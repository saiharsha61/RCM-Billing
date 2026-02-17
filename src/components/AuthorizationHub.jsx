/**
 * Authorization Hub — Full PA Lifecycle Management
 * Spec v1.0: 6-tab interface covering the entire authorization workflow
 * Tab 1: Dashboard (KPIs, state distribution)
 * Tab 2: All Authorizations (filterable list with state badges)
 * Tab 3: New Request (smart form with auto-detection)
 * Tab 4: Submission Queue (batch submission, X12 278 preview)
 * Tab 5: Appeal Queue (denied auths, peer-to-peer scheduling)
 * Tab 6: Expiring (14-day alerts, renewal)
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
    AUTH_STATES, AUTH_ACTIONS,
    getAvailableActions, getStateConfig, getActionConfig,
    transition, isExpiringSoon, daysUntilExpiry, needsAttention, createAuditEntry
} from '../lib/authStateMachine';
import {
    checkAuthRequired, validateAuthRequest, prePopulateAuthRequest, calculateSLADeadline
} from '../lib/authRulesEngine';
import {
    submitToPayer, pollPayerStatus, generateX12_278Request, schedulePeerToPeer
} from '../lib/authPayerGateway';
import mockData from '../lib/mockData';

// =====================================================
// MOCK AUTH DATA (for demo mode)
// =====================================================
const INITIAL_AUTHS = [
    {
        auth_id: 'auth-001', patient_id: 1, payer_id: 'MEDTX', payer_name: 'Medicare of Texas',
        provider_id: 1, auth_number: 'AUTH-2025-WC-001', status: 'APPROVED',
        service_type: 'OUTPATIENT', cpt_codes: ['97597', '97598', '11042'],
        diagnosis_codes: ['L97.929', 'E11.621'], units_requested: 12, units_approved: 12,
        effective_date: '2025-01-15', expiry_date: '2025-04-15',
        service_description: 'Wound care debridement series',
        submitted_at: '2025-01-10T09:00:00Z', decided_at: '2025-01-12T14:30:00Z',
        urgency: 'routine', created_at: '2025-01-09T08:00:00Z',
        patient_name: 'Pedro Suarez', provider_name: 'Dr. Farias-Jimenez'
    },
    {
        auth_id: 'auth-002', patient_id: 5, payer_id: 'MEDTX', payer_name: 'Medicare of Texas',
        provider_id: 1, auth_number: 'AUTH-2025-WC-002', status: 'APPROVED',
        service_type: 'OUTPATIENT', cpt_codes: ['11042', '97597'],
        diagnosis_codes: ['L89.619', 'I96'], units_requested: 8, units_approved: 8,
        effective_date: '2025-02-01', expiry_date: '2025-03-10',
        service_description: 'Pressure ulcer treatment',
        submitted_at: '2025-01-28T10:00:00Z', decided_at: '2025-01-30T11:00:00Z',
        urgency: 'routine', created_at: '2025-01-27T09:00:00Z',
        patient_name: 'Roberto Martinez', provider_name: 'Dr. Farias-Jimenez'
    },
    {
        auth_id: 'auth-003', patient_id: 2, payer_id: 'BCBSTX', payer_name: 'Blue Cross Blue Shield TX',
        provider_id: 5, auth_number: null, status: 'PENDING',
        service_type: 'OUTPATIENT', cpt_codes: ['70553'],
        diagnosis_codes: ['G43.909'], units_requested: 1, units_approved: null,
        effective_date: '2025-02-20', expiry_date: null,
        service_description: 'Brain MRI for chronic migraine evaluation',
        submitted_at: '2025-02-15T14:00:00Z', decided_at: null,
        urgency: 'routine', created_at: '2025-02-14T10:00:00Z',
        patient_name: 'Maria Garcia', provider_name: 'Dr. Johnson'
    },
    {
        auth_id: 'auth-004', patient_id: 3, payer_id: 'AETNA', payer_name: 'Aetna',
        provider_id: 6, auth_number: null, status: 'DENIED',
        service_type: 'OUTPATIENT', cpt_codes: ['70553'],
        diagnosis_codes: ['R51.9'], units_requested: 1, units_approved: null,
        effective_date: '2025-02-10', expiry_date: null,
        service_description: 'Brain MRI - headache workup',
        submitted_at: '2025-02-05T09:00:00Z', decided_at: '2025-02-07T16:00:00Z',
        denial_reason: 'Insufficient clinical documentation', denial_code: '72',
        urgency: 'routine', created_at: '2025-02-04T08:00:00Z',
        patient_name: 'James Wilson', provider_name: 'Dr. Chen'
    },
    {
        auth_id: 'auth-005', patient_id: 4, payer_id: 'UHC', payer_name: 'United Healthcare',
        provider_id: 7, auth_number: null, status: 'DRAFT',
        service_type: 'OUTPATIENT', cpt_codes: ['73721'],
        diagnosis_codes: ['M25.561'], units_requested: 1, units_approved: null,
        effective_date: '2025-02-25', expiry_date: null,
        service_description: 'Knee MRI for joint pain evaluation',
        submitted_at: null, decided_at: null,
        urgency: 'routine', created_at: '2025-02-17T11:00:00Z',
        patient_name: 'Kim Nguyen', provider_name: 'Dr. Rodriguez'
    }
];

// =====================================================
// MAIN HUB COMPONENT
// =====================================================
export function AuthorizationHub() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [authorizations, setAuthorizations] = useState(INITIAL_AUTHS);
    const [auditLog, setAuditLog] = useState([]);
    const [selectedAuth, setSelectedAuth] = useState(null);
    const [showNewRequest, setShowNewRequest] = useState(false);
    const [notification, setNotification] = useState(null);

    // --- Computed data ---
    const stats = useMemo(() => {
        const total = authorizations.length;
        const byStatus = {};
        Object.values(AUTH_STATES).forEach(s => { byStatus[s] = 0; });
        authorizations.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
        const approved = byStatus.APPROVED || 0;
        const denied = byStatus.DENIED || 0;
        const decided = approved + denied;
        const expiringSoon = authorizations.filter(a =>
            a.status === 'APPROVED' && isExpiringSoon(a.expiry_date, 14)
        ).length;
        return {
            total, byStatus, approved, denied, decided, expiringSoon,
            approvalRate: decided > 0 ? ((approved / decided) * 100).toFixed(1) : '0',
            pendingCount: byStatus.PENDING || 0, draftCount: byStatus.DRAFT || 0
        };
    }, [authorizations]);

    // --- Execute state transition ---
    const handleTransition = useCallback((authId, action, context = {}) => {
        setAuthorizations(prev => prev.map(a => {
            if (a.auth_id !== authId) return a;
            const result = transition(a, action, {
                userId: '1', userName: 'Demo User', userRole: 'admin', ...context
            });
            if (result.success) {
                setAuditLog(prev => [result.auditEntry, ...prev]);
                showNotif(`✅ ${getActionConfig(action).label}: ${a.patient_name || 'Auth'}`);
                return result.authorization;
            }
            showNotif(`❌ ${result.error}`, true);
            return a;
        }));
    }, []);

    // --- Submit to payer ---
    const handleSubmitToPayer = useCallback(async (auth) => {
        showNotif('📤 Submitting to payer...');
        const result = await submitToPayer(auth);
        if (result.success) {
            setAuthorizations(prev => prev.map(a =>
                a.auth_id === auth.auth_id ? {
                    ...a, status: 'PENDING', submitted_at: result.submitted_at,
                    x12_278_request: result.x12_278_request,
                    clearinghouse_ref: result.clearinghouse_ref
                } : a
            ));
            const entry = createAuditEntry(auth.auth_id, 'PAYER_SUBMISSION', { status: 'SUBMITTED' }, { status: 'PENDING' }, { userName: 'Demo User' });
            setAuditLog(prev => [entry, ...prev]);
            showNotif(`✅ ${result.message}`);
        }
    }, []);

    // --- Poll payer status ---
    const handlePollStatus = useCallback(async (auth) => {
        showNotif('🔄 Checking payer status...');
        const result = await pollPayerStatus(auth);
        if (result.status_changed && result.decision) {
            setAuthorizations(prev => prev.map(a => {
                if (a.auth_id !== auth.auth_id) return a;
                return {
                    ...a, status: result.decision,
                    auth_number: result.auth_number || a.auth_number,
                    units_approved: result.units_approved ?? a.units_approved,
                    denial_reason: result.denial_reason || a.denial_reason,
                    denial_code: result.denial_code || a.denial_code,
                    decided_at: result.decided_at
                };
            }));
            showNotif(`📋 Payer decision: ${result.decision} — ${result.message}`);
        } else {
            showNotif(`⏳ ${result.message}`);
        }
    }, []);

    // --- Create new auth ---
    const handleCreateAuth = useCallback((newAuth) => {
        const auth = {
            ...newAuth,
            auth_id: `auth-${Date.now()}`,
            status: 'DRAFT',
            created_at: new Date().toISOString(),
            auth_number: null, units_approved: null,
            submitted_at: null, decided_at: null
        };
        setAuthorizations(prev => [auth, ...prev]);
        const entry = createAuditEntry(auth.auth_id, 'CREATE', null, auth, { userName: 'Demo User' });
        setAuditLog(prev => [entry, ...prev]);
        setShowNewRequest(false);
        showNotif(`✅ Authorization request created for ${auth.patient_name || 'patient'}`);
    }, []);

    function showNotif(msg, isError = false) {
        setNotification({ msg, isError });
        setTimeout(() => setNotification(null), 4000);
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'all', label: 'All Authorizations', icon: '📋' },
        { id: 'new', label: 'New Request', icon: '➕' },
        { id: 'queue', label: 'Submission Queue', icon: '📤' },
        { id: 'appeals', label: 'Appeals', icon: '🔄' },
        { id: 'expiring', label: `Expiring (${stats.expiringSoon})`, icon: '⏰' }
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 8px 0' }}>
                    Authorization Management Hub
                </h1>
                <p style={{ color: '#64748b', margin: 0 }}>
                    Prior authorization lifecycle — create, submit, track, appeal
                </p>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    padding: '14px 24px', borderRadius: '10px',
                    backgroundColor: notification.isError ? '#fee2e2' : '#dcfce7',
                    color: notification.isError ? '#991b1b' : '#166534',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: '600',
                    maxWidth: '400px', animation: 'fadeIn 0.3s ease'
                }}>
                    {notification.msg}
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                            borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: activeTab === tab.id ? '#0004d0' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            borderBottom: activeTab === tab.id ? '2px solid #0004d0' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>{tab.icon}</span>{tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && <DashboardTab stats={stats} authorizations={authorizations} />}
            {activeTab === 'all' && <AllAuthsTab authorizations={authorizations} onTransition={handleTransition} onSelect={setSelectedAuth} onPoll={handlePollStatus} />}
            {activeTab === 'new' && <NewRequestTab onCreateAuth={handleCreateAuth} />}
            {activeTab === 'queue' && <SubmissionQueueTab authorizations={authorizations} onSubmit={handleSubmitToPayer} onTransition={handleTransition} />}
            {activeTab === 'appeals' && <AppealsTab authorizations={authorizations} onTransition={handleTransition} />}
            {activeTab === 'expiring' && <ExpiringTab authorizations={authorizations} />}

            {/* Auth Detail Modal */}
            {selectedAuth && <AuthDetailModal auth={selectedAuth} auditLog={auditLog.filter(l => l.auth_id === selectedAuth.auth_id)} onClose={() => setSelectedAuth(null)} onTransition={handleTransition} />}
        </div>
    );
}

// =====================================================
// TAB 1: DASHBOARD
// =====================================================
function DashboardTab({ stats, authorizations }) {
    const kpis = [
        { label: 'Total Auths', value: stats.total, color: '#0004d0', icon: '📋' },
        { label: 'Approval Rate', value: `${stats.approvalRate}%`, color: '#16a34a', icon: '✅' },
        { label: 'Pending', value: stats.pendingCount, color: '#d97706', icon: '⏳' },
        { label: 'Expiring Soon', value: stats.expiringSoon, color: '#dc2626', icon: '⏰' },
        { label: 'Drafts', value: stats.draftCount, color: '#64748b', icon: '📝' },
        { label: 'Denied', value: stats.denied, color: '#dc2626', icon: '❌' }
    ];

    return (
        <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {kpis.map(kpi => (
                    <div key={kpi.label} style={{
                        backgroundColor: 'white', borderRadius: '12px', padding: '20px',
                        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{kpi.icon}</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: kpi.color }}>{kpi.value}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* State Distribution */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                    Authorization State Distribution
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {Object.entries(stats.byStatus).filter(([, v]) => v > 0).map(([state, count]) => {
                        const cfg = getStateConfig(state);
                        const pct = ((count / Math.max(stats.total, 1)) * 100).toFixed(0);
                        return (
                            <div key={state} style={{ flex: '1 1 140px', minWidth: '140px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{count}</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: cfg.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// =====================================================
// TAB 2: ALL AUTHORIZATIONS
// =====================================================
function AllAuthsTab({ authorizations, onTransition, onSelect, onPoll }) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filtered = authorizations.filter(a => {
        const matchS = filterStatus === 'ALL' || a.status === filterStatus;
        const matchQ = !search || [a.patient_name, a.auth_number, a.payer_name, ...(a.cpt_codes || [])].some(
            f => f && f.toLowerCase().includes(search.toLowerCase())
        );
        return matchS && matchQ;
    });

    return (
        <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search patient, auth#, payer, CPT..."
                    style={{ flex: '1 1 250px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', minWidth: '160px' }}
                >
                    <option value="ALL">All States</option>
                    {Object.values(AUTH_STATES).map(s => <option key={s} value={s}>{getStateConfig(s).label}</option>)}
                </select>
            </div>

            {/* Results count */}
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{filtered.length} authorization(s)</p>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            {['Patient', 'Payer', 'CPT Codes', 'Status', 'Units', 'Auth #', 'Dates', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(auth => {
                            const cfg = getStateConfig(auth.status);
                            const actions = getAvailableActions(auth.status);
                            return (
                                <tr key={auth.auth_id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => onSelect(auth)}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{auth.patient_name}</td>
                                    <td style={{ padding: '12px 16px' }}>{auth.payer_name}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {(auth.cpt_codes || []).map(c => (
                                            <span key={c} style={{ display: 'inline-block', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '4px', fontFamily: 'monospace' }}>{c}</span>
                                        ))}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: cfg.bgColor, color: cfg.color }}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                                        {auth.units_approved != null ? `${auth.units_approved}/${auth.units_requested}` : auth.units_requested}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px' }}>
                                        {auth.auth_number || '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                                        {auth.effective_date}{auth.expiry_date ? ` → ${auth.expiry_date}` : ''}
                                    </td>
                                    <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {actions.slice(0, 2).map(action => {
                                                const acfg = getActionConfig(action);
                                                return (
                                                    <button key={action} onClick={() => onTransition(auth.auth_id, action)}
                                                        style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer', backgroundColor: acfg.color, color: 'white' }}>
                                                        {acfg.label}
                                                    </button>
                                                );
                                            })}
                                            {auth.status === 'PENDING' && (
                                                <button onClick={() => onPoll(auth)}
                                                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '11px', fontWeight: '600', cursor: 'pointer', backgroundColor: 'white', color: '#374151' }}>
                                                    🔄 Check
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// =====================================================
// TAB 3: NEW REQUEST
// =====================================================
function NewRequestTab({ onCreateAuth }) {
    const [form, setForm] = useState({
        patient_name: '', patient_id: '', payer_id: '', payer_name: '',
        provider_name: '', provider_id: '', service_type: 'OUTPATIENT',
        cpt_codes: '', diagnosis_codes: '', units_requested: 1,
        effective_date: new Date().toISOString().split('T')[0], expiry_date: '',
        service_description: '', clinical_notes: '', urgency: 'routine'
    });
    const [authCheck, setAuthCheck] = useState(null);
    const [validation, setValidation] = useState(null);

    const PATIENTS = [
        { id: 1, name: 'Pedro Suarez', payer_id: 'MEDTX', payer_name: 'Medicare of Texas' },
        { id: 2, name: 'Maria Garcia', payer_id: 'BCBSTX', payer_name: 'Blue Cross Blue Shield TX' },
        { id: 3, name: 'James Wilson', payer_id: 'AETNA', payer_name: 'Aetna' },
        { id: 4, name: 'Kim Nguyen', payer_id: 'UHC', payer_name: 'United Healthcare' },
        { id: 5, name: 'Roberto Martinez', payer_id: 'MEDTX', payer_name: 'Medicare of Texas' }
    ];
    const PROVIDERS = [
        { id: 1, name: 'Dr. Farias-Jimenez' }, { id: 2, name: 'Dr. Garza Jr' },
        { id: 3, name: 'Dr. Morales' }, { id: 4, name: 'Dr. Reyes' },
        { id: 5, name: 'Dr. Johnson' }, { id: 6, name: 'Dr. Chen' }, { id: 7, name: 'Dr. Rodriguez' }
    ];

    const handlePatientSelect = (e) => {
        const p = PATIENTS.find(p => p.id === Number(e.target.value));
        if (p) setForm(f => ({ ...f, patient_id: p.id, patient_name: p.name, payer_id: p.payer_id, payer_name: p.payer_name }));
    };

    const handleCheckAuth = async () => {
        const cpts = form.cpt_codes.split(',').map(c => c.trim()).filter(Boolean);
        if (cpts.length && form.payer_id) {
            const results = [];
            for (const cpt of cpts) {
                const r = await checkAuthRequired(cpt, form.payer_id);
                results.push({ cpt, ...r });
            }
            setAuthCheck(results);
        }
    };

    const handleSubmit = () => {
        const cpts = form.cpt_codes.split(',').map(c => c.trim()).filter(Boolean);
        const dxs = form.diagnosis_codes.split(',').map(c => c.trim()).filter(Boolean);
        const authData = {
            ...form, cpt_codes: cpts, diagnosis_codes: dxs,
            units_requested: parseInt(form.units_requested) || 1
        };
        const v = validateAuthRequest(authData);
        setValidation(v);
        if (v.valid) {
            const provider = PROVIDERS.find(p => p.id === Number(form.provider_id));
            onCreateAuth({ ...authData, provider_name: provider?.name || '' });
        }
    };

    const fieldStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>New Authorization Request</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Patient */}
                    <div>
                        <label style={labelStyle}>Patient *</label>
                        <select onChange={handlePatientSelect} value={form.patient_id} style={fieldStyle}>
                            <option value="">Select patient...</option>
                            {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    {/* Payer (auto-populated) */}
                    <div>
                        <label style={labelStyle}>Payer (auto-populated)</label>
                        <input value={form.payer_name} readOnly style={{ ...fieldStyle, backgroundColor: '#f9fafb' }} />
                    </div>
                    {/* Provider */}
                    <div>
                        <label style={labelStyle}>Ordering Provider *</label>
                        <select value={form.provider_id} onChange={e => setForm(f => ({ ...f, provider_id: e.target.value }))} style={fieldStyle}>
                            <option value="">Select provider...</option>
                            {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    {/* Service Type */}
                    <div>
                        <label style={labelStyle}>Service Type *</label>
                        <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} style={fieldStyle}>
                            <option value="OUTPATIENT">Outpatient (Professional)</option>
                            <option value="INPATIENT">Inpatient (Institutional)</option>
                        </select>
                    </div>
                    {/* CPT Codes + Auto-detect */}
                    <div>
                        <label style={labelStyle}>CPT/HCPCS Codes * (comma-separated)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input value={form.cpt_codes} onChange={e => setForm(f => ({ ...f, cpt_codes: e.target.value }))} placeholder="70553, 27447" style={{ ...fieldStyle, flex: 1 }} />
                            <button onClick={handleCheckAuth} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                🔍 Check
                            </button>
                        </div>
                        {authCheck && (
                            <div style={{ marginTop: '8px' }}>
                                {authCheck.map(r => (
                                    <div key={r.cpt} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px', backgroundColor: r.required ? '#fef3c7' : '#dcfce7', color: r.required ? '#92400e' : '#166534' }}>
                                        <strong>{r.cpt}</strong>: {r.required ? '⚠️ Auth Required' : '✅ No Auth Required'} ({r.source})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Diagnosis Codes */}
                    <div>
                        <label style={labelStyle}>Diagnosis Codes (comma-separated)</label>
                        <input value={form.diagnosis_codes} onChange={e => setForm(f => ({ ...f, diagnosis_codes: e.target.value }))} placeholder="L97.929, E11.621" style={fieldStyle} />
                    </div>
                    {/* Units */}
                    <div>
                        <label style={labelStyle}>Units Requested *</label>
                        <input type="number" min="1" value={form.units_requested} onChange={e => setForm(f => ({ ...f, units_requested: e.target.value }))} style={fieldStyle} />
                    </div>
                    {/* Urgency */}
                    <div>
                        <label style={labelStyle}>Urgency</label>
                        <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))} style={fieldStyle}>
                            <option value="routine">Routine</option>
                            <option value="urgent">Urgent</option>
                            <option value="emergent">Emergent</option>
                        </select>
                    </div>
                    {/* Effective Date */}
                    <div>
                        <label style={labelStyle}>Effective Date *</label>
                        <input type="date" value={form.effective_date} onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} style={fieldStyle} />
                    </div>
                    {/* Expiry Date */}
                    <div>
                        <label style={labelStyle}>Expiry Date</label>
                        <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} style={fieldStyle} />
                    </div>
                </div>

                {/* Service Description */}
                <div style={{ marginTop: '20px' }}>
                    <label style={labelStyle}>Service Description</label>
                    <input value={form.service_description} onChange={e => setForm(f => ({ ...f, service_description: e.target.value }))} placeholder="e.g. Wound care debridement series" style={fieldStyle} />
                </div>

                {/* Clinical Notes */}
                <div style={{ marginTop: '20px' }}>
                    <label style={labelStyle}>Clinical Notes / Justification</label>
                    <textarea value={form.clinical_notes} onChange={e => setForm(f => ({ ...f, clinical_notes: e.target.value }))} rows={4} placeholder="Clinical justification for authorization..." style={{ ...fieldStyle, resize: 'vertical' }} />
                </div>

                {/* Validation feedback */}
                {validation && !validation.valid && (
                    <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        <strong>Please fix:</strong>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>{validation.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                    </div>
                )}
                {validation && validation.warnings?.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#92400e' }}>
                        <strong>Warnings:</strong>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>{validation.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                    </div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit} style={{
                    marginTop: '24px', padding: '14px 32px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#a941c6', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                }}>
                    📝 Create Authorization Request
                </button>
            </div>
        </div>
    );
}

// =====================================================
// TAB 4: SUBMISSION QUEUE
// =====================================================
function SubmissionQueueTab({ authorizations, onSubmit, onTransition }) {
    const [x12Preview, setX12Preview] = useState(null);
    const drafts = authorizations.filter(a => a.status === 'DRAFT');
    const submitted = authorizations.filter(a => a.status === 'SUBMITTED');

    return (
        <div>
            {/* Drafts ready to submit */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                📝 Draft Requests ({drafts.length})
            </h3>
            {drafts.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No draft authorizations</p>}
            {drafts.map(auth => (
                <div key={auth.auth_id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{auth.patient_name}</strong> — {auth.payer_name}
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                CPT: {(auth.cpt_codes || []).join(', ')} | Units: {auth.units_requested} | {auth.service_description}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setX12Preview(generateX12_278Request(auth))}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                👁️ Preview X12 278
                            </button>
                            <button onClick={() => onTransition(auth.auth_id, 'submit')}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                📤 Submit for Review
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Submitted, ready to send to payer */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '32px 0 16px 0' }}>
                📤 Ready to Send ({submitted.length})
            </h3>
            {submitted.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No authorizations ready to send</p>}
            {submitted.map(auth => (
                <div key={auth.auth_id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #dbeafe', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{auth.patient_name}</strong> — {auth.payer_name}
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                CPT: {(auth.cpt_codes || []).join(', ')} | Submitted: {auth.submitted_at ? new Date(auth.submitted_at).toLocaleString() : '—'}
                            </div>
                        </div>
                        <button onClick={() => onSubmit(auth)}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#7c3aed', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            🚀 Send to Payer (X12 278)
                        </button>
                    </div>
                </div>
            ))}

            {/* X12 278 Preview Modal */}
            {x12Preview && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', maxWidth: '700px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>X12 278 Prior Authorization Request</h3>
                            <button onClick={() => setX12Preview(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <pre style={{ backgroundColor: '#1e293b', color: '#22d3ee', padding: '20px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', fontFamily: 'monospace', lineHeight: '1.6' }}>
                            {x12Preview}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================================
// TAB 5: APPEALS
// =====================================================
function AppealsTab({ authorizations, onTransition }) {
    const denied = authorizations.filter(a => a.status === 'DENIED');
    const appealed = authorizations.filter(a => a.status === 'APPEALED');
    const [appealReason, setAppealReason] = useState({});
    const [scheduling, setScheduling] = useState(null);

    const handleAppeal = (authId) => {
        onTransition(authId, 'appeal', { reason: appealReason[authId] || 'Appeal filed' });
        setAppealReason(prev => ({ ...prev, [authId]: '' }));
    };

    const handleScheduleP2P = async (auth) => {
        setScheduling(auth.auth_id);
        const result = await schedulePeerToPeer(auth);
        setScheduling(null);
        if (result.success) {
            alert(`📞 Peer-to-Peer Scheduled\n\n${result.message}\n\nCall: ${result.conference_details.number} ext ${result.conference_details.extension}\nRef: ${result.conference_details.reference}`);
        }
    };

    return (
        <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '16px' }}>
                ❌ Denied — Awaiting Appeal ({denied.length})
            </h3>
            {denied.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No denied authorizations</p>}
            {denied.map(auth => (
                <div key={auth.auth_id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #fecaca', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <strong>{auth.patient_name}</strong> — {auth.payer_name}
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>CPT: {(auth.cpt_codes || []).join(', ')}</div>
                            <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '6px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#fee2e2' }}>
                                <strong>Denial:</strong> {auth.denial_reason || 'No reason provided'} {auth.denial_code ? `(Code: ${auth.denial_code})` : ''}
                            </div>
                            <div style={{ marginTop: '12px' }}>
                                <input value={appealReason[auth.auth_id] || ''} onChange={e => setAppealReason(prev => ({ ...prev, [auth.auth_id]: e.target.value }))}
                                    placeholder="Appeal reason / clinical justification..."
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                            <button onClick={() => handleAppeal(auth.auth_id)}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#9333ea', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                🔄 File Appeal
                            </button>
                            <button onClick={() => handleScheduleP2P(auth)} disabled={scheduling === auth.auth_id}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                {scheduling === auth.auth_id ? '⏳...' : '📞 Schedule P2P'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#9333ea', margin: '32px 0 16px 0' }}>
                🔄 Active Appeals ({appealed.length})
            </h3>
            {appealed.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No active appeals</p>}
            {appealed.map(auth => (
                <div key={auth.auth_id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e9d5ff', marginBottom: '12px' }}>
                    <strong>{auth.patient_name}</strong> — {auth.payer_name}
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                        Appeal reason: {auth.appeal_reason || '—'} | Filed: {auth.appeal_submitted_at ? new Date(auth.appeal_submitted_at).toLocaleDateString() : '—'}
                    </div>
                </div>
            ))}
        </div>
    );
}

// =====================================================
// TAB 6: EXPIRING
// =====================================================
function ExpiringTab({ authorizations }) {
    const expiring = authorizations.filter(a => a.status === 'APPROVED' && a.expiry_date).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

    return (
        <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>⏰ Authorization Expiry Tracker</h3>
            {expiring.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No approved authorizations with expiry dates</p>}
            {expiring.map(auth => {
                const days = daysUntilExpiry(auth.expiry_date);
                const soon = isExpiringSoon(auth.expiry_date, 14);
                const expired = days !== null && days < 0;
                return (
                    <div key={auth.auth_id} style={{
                        backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px',
                        border: `1px solid ${expired ? '#fecaca' : soon ? '#fde68a' : '#e2e8f0'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{auth.patient_name}</strong> — {auth.auth_number}
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                    {auth.payer_name} | CPT: {(auth.cpt_codes || []).join(', ')} | Visits: {auth.units_approved - (auth.units_used || 0)} remaining
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '20px', fontWeight: '700',
                                    color: expired ? '#dc2626' : soon ? '#d97706' : '#16a34a'
                                }}>
                                    {expired ? 'EXPIRED' : `${days} days`}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    Expires: {auth.expiry_date}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// =====================================================
// AUTH DETAIL MODAL
// =====================================================
function AuthDetailModal({ auth, auditLog, onClose, onTransition }) {
    const cfg = getStateConfig(auth.status);
    const actions = getAvailableActions(auth.status);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '700px', width: '90%', maxHeight: '85vh', overflow: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                            {auth.patient_name} — Authorization Detail
                        </h2>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', backgroundColor: cfg.bgColor, color: cfg.color }}>
                            {cfg.icon} {cfg.label}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>✕</button>
                </div>

                {/* Detail Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    {[
                        ['Auth #', auth.auth_number || '—'],
                        ['Payer', auth.payer_name],
                        ['Service Type', auth.service_type],
                        ['Urgency', auth.urgency],
                        ['CPT Codes', (auth.cpt_codes || []).join(', ')],
                        ['Diagnosis', (auth.diagnosis_codes || []).join(', ')],
                        ['Units', `${auth.units_approved ?? '?'}/${auth.units_requested} ${auth.units_approved && auth.units_approved < auth.units_requested ? '(PARTIAL)' : ''}`],
                        ['Effective', `${auth.effective_date}${auth.expiry_date ? ` → ${auth.expiry_date}` : ''}`],
                        ['Submitted', auth.submitted_at ? new Date(auth.submitted_at).toLocaleString() : '—'],
                        ['Decision', auth.decided_at ? new Date(auth.decided_at).toLocaleString() : '—']
                    ].map(([k, v]) => (
                        <div key={k}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>{k}</div>
                            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{v}</div>
                        </div>
                    ))}
                </div>

                {/* Denial reason */}
                {auth.denial_reason && (
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b', marginBottom: '16px', fontSize: '14px' }}>
                        <strong>Denial:</strong> {auth.denial_reason} {auth.denial_code ? `(${auth.denial_code})` : ''}
                    </div>
                )}

                {/* Service description */}
                {auth.service_description && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Service Description</div>
                        <div style={{ fontSize: '14px', color: '#0f172a' }}>{auth.service_description}</div>
                    </div>
                )}

                {/* Actions */}
                {actions.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Available Actions</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {actions.map(action => {
                                const acfg = getActionConfig(action);
                                return (
                                    <button key={action} onClick={() => { onTransition(auth.auth_id, action); onClose(); }}
                                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: acfg.color, color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                        {acfg.icon} {acfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Audit Trail */}
                <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Audit Trail ({auditLog.length} entries)</div>
                    {auditLog.length === 0 && <p style={{ fontSize: '13px', color: '#94a3b8' }}>No audit entries yet</p>}
                    {auditLog.map((entry, i) => (
                        <div key={i} style={{ padding: '8px 12px', borderLeft: '3px solid #a941c6', marginBottom: '8px', backgroundColor: '#faf5ff', borderRadius: '0 6px 6px 0', fontSize: '13px' }}>
                            <strong>{entry.action}</strong> by {entry.performed_by_name} — {new Date(entry.timestamp).toLocaleString()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AuthorizationHub;
