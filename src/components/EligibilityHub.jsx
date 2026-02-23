/**
 * Eligibility Hub — Full Verification Management
 * Phase L+N2: 5-tab interface for real-time eligibility verification
 * Tab 1: Dashboard (KPIs, verification stats, SLA indicators)
 * Tab 2: All Patients (status table with quick-verify)
 * Tab 3: Verify Patient (single patient form → full 271 response + coverage date validation)
 * Tab 4: Batch Verify (multi-patient with progress)
 * Tab 5: History (verification log)
 *
 * PRD Coverage: ELG-01→05, USE-04
 */
import React, { useState, useEffect, useCallback } from 'react';
import { verifyEligibility, batchVerify, getPayerList, getEligibilityMode } from '../lib/eligibilityService';
import { useTenant } from '../lib/tenantContext.jsx';
import { BenefitBreakdown } from './BenefitBreakdown';
import mockData from '../lib/mockData';

// =====================================================
// MOCK VERIFICATION HISTORY (for demo)
// =====================================================
const INITIAL_HISTORY = [
    {
        id: 'ev-001', patientName: 'Pedro Suarez', patientId: 0,
        payerName: 'Medicare of Texas', status: 'Active', verifiedAt: '2025-02-15T14:30:00Z',
        mode: 'mock', copay: 0, deductible: 240, coinsurance: 80,
    },
    {
        id: 'ev-002', patientName: 'Roberto Martinez', patientId: 1,
        payerName: 'Medicare of Texas', status: 'Active', verifiedAt: '2025-02-14T09:15:00Z',
        mode: 'mock', copay: 0, deductible: 240, coinsurance: 80,
    },
    {
        id: 'ev-003', patientName: 'Maria Gonzalez', patientId: 2,
        payerName: 'Blue Cross Blue Shield TX', status: 'Active', verifiedAt: '2025-02-13T11:00:00Z',
        mode: 'mock', copay: 30, deductible: 2000, coinsurance: 80,
    },
];

// =====================================================
// MAIN HUB COMPONENT
// =====================================================
export function EligibilityHub() {
    const { tenant, tenantId, getSLAThreshold, getTenantConfig } = useTenant();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [patients] = useState(() => {
        const all = [mockData.pedroSuarezPatient, ...(mockData.patients || [])].filter(Boolean);
        return all;
    });
    const [eligibilityData] = useState(mockData.eligibilityData || []);
    const [verificationHistory, setVerificationHistory] = useState(INITIAL_HISTORY);
    const [notification, setNotification] = useState(null);
    const [patientResults, setPatientResults] = useState({}); // patientId → last result

    const eligMode = getEligibilityMode();
    const eligSLA = getSLAThreshold('eligibility');
    const autoVerifyHours = getTenantConfig('autoVerifyHours') || 48;

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'patients', label: 'All Patients', icon: '◉' },
        { id: 'verify', label: 'Verify Patient', icon: '🔍' },
        { id: 'batch', label: 'Batch Verify', icon: '⚡' },
        { id: 'history', label: 'History', icon: '📋' },
    ];

    const showNotif = useCallback((msg, isError = false) => {
        setNotification({ msg, isError });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    const handleVerifyComplete = useCallback((patient, result) => {
        const pName = `${patient.FirstName || patient.firstName} ${patient.LastName || patient.lastName}`;
        const historyEntry = {
            id: `ev-${Date.now()}`,
            patientName: pName,
            patientId: patient.PatientID || patient.patient_id,
            payerName: result.plan?.name || 'Unknown',
            status: result.status,
            verifiedAt: result.verifiedAt,
            mode: result.mode,
            copay: result.benefits?.copay || 0,
            deductible: result.benefits?.deductible || 0,
            coinsurance: result.benefits?.coinsurance || 80,
        };
        setVerificationHistory(prev => [historyEntry, ...prev]);
        setPatientResults(prev => ({
            ...prev,
            [patient.PatientID || patient.patient_id]: result,
        }));
    }, []);

    // Stats
    const stats = {
        total: patients.length,
        verified: verificationHistory.length,
        active: verificationHistory.filter(h => h.status === 'Active').length,
        inactive: verificationHistory.filter(h => h.status === 'Inactive').length,
        pending: patients.length - new Set(verificationHistory.map(h => h.patientId)).size,
        todayCount: verificationHistory.filter(h => {
            const today = new Date().toDateString();
            return new Date(h.verifiedAt).toDateString() === today;
        }).length,
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 6px 0' }}>
                            Eligibility Verification Hub
                        </h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                            {tenant?.name ? `${tenant.name} · ` : ''}Real-time insurance eligibility verification (270/271)
                        </p>
                    </div>
                    <div style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                        backgroundColor: eligMode === 'live' ? '#d1fae5' : '#fef3c7',
                        color: eligMode === 'live' ? '#065f46' : '#92400e',
                        border: `1px solid ${eligMode === 'live' ? '#6ee7b7' : '#fcd34d'}`,
                    }}>
                        {eligMode === 'live' ? '🟢 Stedi API Connected' : '🟡 Demo Mode (Mock Data)'}
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div style={{
                    padding: '12px 20px', borderRadius: '8px', marginBottom: '16px',
                    backgroundColor: notification.isError ? '#fee2e2' : '#d1fae5',
                    color: notification.isError ? '#dc2626' : '#065f46',
                    fontSize: '14px', fontWeight: '500',
                }}>
                    {notification.msg}
                </div>
            )}

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: '4px', marginBottom: '24px',
                borderBottom: '2px solid #e3f2fd', paddingBottom: '0',
            }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '12px 20px', border: 'none', cursor: 'pointer',
                        backgroundColor: activeTab === tab.id ? '#0004d0' : 'transparent',
                        color: activeTab === tab.id ? 'white' : '#64748b',
                        borderRadius: '8px 8px 0 0', fontSize: '13px', fontWeight: '600',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && <DashboardTab stats={stats} history={verificationHistory} eligSLA={eligSLA} autoVerifyHours={autoVerifyHours} />}
            {activeTab === 'patients' && (
                <AllPatientsTab
                    patients={patients}
                    eligibilityData={eligibilityData}
                    patientResults={patientResults}
                    onVerify={handleVerifyComplete}
                    showNotif={showNotif}
                />
            )}
            {activeTab === 'verify' && (
                <VerifyPatientTab
                    patients={patients}
                    eligibilityData={eligibilityData}
                    onVerify={handleVerifyComplete}
                    showNotif={showNotif}
                />
            )}
            {activeTab === 'batch' && (
                <BatchVerifyTab
                    patients={patients}
                    eligibilityData={eligibilityData}
                    onVerify={handleVerifyComplete}
                    showNotif={showNotif}
                />
            )}
            {activeTab === 'history' && <HistoryTab history={verificationHistory} />}
        </div>
    );
}

// =====================================================
// TAB 1: DASHBOARD
// =====================================================
function DashboardTab({ stats, history, eligSLA, autoVerifyHours }) {
    const kpis = [
        { label: 'Total Patients', value: stats.total, color: '#0004d0', icon: '◉' },
        { label: 'Verified Today', value: stats.todayCount, color: '#a941c6', icon: '✓' },
        { label: 'Active Coverage', value: stats.active, color: '#10b981', icon: '●' },
        { label: 'Inactive', value: stats.inactive, color: '#ef4444', icon: '○' },
        { label: 'Pending Check', value: stats.pending, color: '#f59e0b', icon: '◌' },
        { label: 'Total Checks', value: stats.verified, color: '#3b82f6', icon: '≡' },
    ];

    // SLA color coding (USE-04)
    const slaColor = eligSLA <= 12 ? '#ef4444' : eligSLA <= 24 ? '#f59e0b' : '#10b981';

    return (
        <div>
            {/* SLA + Auto-Verify Status Bar (USE-04, ELG-05) */}
            <div style={{
                display: 'flex', gap: '12px', marginBottom: '20px',
            }}>
                <div style={{
                    flex: 1, padding: '12px 16px', borderRadius: '8px',
                    backgroundColor: `${slaColor}10`, border: `1px solid ${slaColor}30`,
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{ fontSize: '18px' }}>⏱</span>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Eligibility SLA</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: slaColor }}>{eligSLA}h turnaround</div>
                    </div>
                </div>
                <div style={{
                    flex: 1, padding: '12px 16px', borderRadius: '8px',
                    backgroundColor: '#eef2ff', border: '1px solid #c7d2fe',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{ fontSize: '18px' }}>🔄</span>
                    <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Auto Re-Verify (ELG-05)</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#6366f1' }}>T-{autoVerifyHours}h before service</div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {kpis.map(kpi => (
                    <div key={kpi.label} style={{
                        backgroundColor: 'white', borderRadius: '12px', padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${kpi.color}`,
                    }}>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
                            {kpi.icon} {kpi.label}
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: kpi.color }}>
                            {kpi.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Verifications */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                    Recent Verifications
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e3f2fd' }}>
                            <th style={thStyle}>Patient</th>
                            <th style={thStyle}>Payer</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Copay</th>
                            <th style={thStyle}>Deductible</th>
                            <th style={thStyle}>Verified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.slice(0, 5).map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={tdStyle}><strong>{h.patientName}</strong></td>
                                <td style={tdStyle}>{h.payerName}</td>
                                <td style={tdStyle}><StatusBadge status={h.status} /></td>
                                <td style={tdStyle}>${(h.copay || 0).toFixed(2)}</td>
                                <td style={tdStyle}>${(h.deductible || 0).toFixed(2)}</td>
                                <td style={{ ...tdStyle, fontSize: '12px', color: '#94a3b8' }}>
                                    {new Date(h.verifiedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// =====================================================
// TAB 2: ALL PATIENTS
// =====================================================
function AllPatientsTab({ patients, eligibilityData, patientResults, onVerify, showNotif }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [verifyingId, setVerifyingId] = useState(null);

    const handleQuickVerify = async (patient) => {
        const pId = patient.PatientID || patient.patient_id;
        setVerifyingId(pId);
        const insurance = eligibilityData.find(e => e.PatientID === pId) || {
            payerId: 'UHC', payerName: 'United Healthcare',
            memberId: patient.AccountNo, subscriberNo: patient.AccountNo,
        };
        try {
            const result = await verifyEligibility(patient, insurance);
            onVerify(patient, result);
            showNotif(`✅ ${patient.FirstName} ${patient.LastName}: ${result.status}`);
        } catch (e) {
            showNotif(`❌ Error verifying: ${e.message}`, true);
        }
        setVerifyingId(null);
    };

    const filtered = patients.filter(p => {
        const name = `${p.FirstName || ''} ${p.LastName || ''} ${p.AccountNo || ''}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase());
        if (filter === 'All') return matchSearch;
        const pId = p.PatientID || p.patient_id;
        const result = patientResults[pId];
        if (filter === 'Verified') return matchSearch && result;
        if (filter === 'Unverified') return matchSearch && !result;
        if (filter === 'Active') return matchSearch && result?.status === 'Active';
        if (filter === 'Inactive') return matchSearch && result?.status === 'Inactive';
        return matchSearch;
    });

    return (
        <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input
                    type="text" placeholder="Search patients..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                />
                <select value={filter} onChange={e => setFilter(e.target.value)}
                    style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minWidth: '140px' }}>
                    <option value="All">All Patients</option>
                    <option value="Verified">Verified</option>
                    <option value="Unverified">Unverified</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={thStyle}>Patient Name</th>
                            <th style={thStyle}>Account No</th>
                            <th style={thStyle}>Eligibility</th>
                            <th style={thStyle}>Copay</th>
                            <th style={thStyle}>Deductible</th>
                            <th style={thStyle}>Last Verified</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(patient => {
                            const pId = patient.PatientID || patient.patient_id;
                            const result = patientResults[pId];
                            const isVerifying = verifyingId === pId;
                            return (
                                <tr key={pId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>
                                        <strong>{patient.FirstName} {patient.LastName}</strong>
                                    </td>
                                    <td style={tdStyle}>{patient.AccountNo || 'N/A'}</td>
                                    <td style={tdStyle}>
                                        {result ? <StatusBadge status={result.status} /> : (
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Not checked</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        {result ? `$${(result.benefits?.copay || 0).toFixed(2)}` : '—'}
                                    </td>
                                    <td style={tdStyle}>
                                        {result ? `$${(result.benefits?.deductible || 0).toFixed(2)}` : '—'}
                                    </td>
                                    <td style={{ ...tdStyle, fontSize: '12px', color: '#94a3b8' }}>
                                        {result ? new Date(result.verifiedAt).toLocaleString() : 'Never'}
                                    </td>
                                    <td style={tdStyle}>
                                        <button onClick={() => handleQuickVerify(patient)} disabled={isVerifying} style={{
                                            padding: '6px 14px', border: 'none', borderRadius: '6px',
                                            backgroundColor: isVerifying ? '#e2e8f0' : '#a941c6', color: 'white',
                                            fontSize: '12px', fontWeight: '600', cursor: isVerifying ? 'wait' : 'pointer',
                                        }}>
                                            {isVerifying ? '⏳ Checking...' : '🔍 Verify'}
                                        </button>
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
// TAB 3: VERIFY PATIENT
// =====================================================
function VerifyPatientTab({ patients, eligibilityData, onVerify, showNotif }) {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const payers = getPayerList();

    // Form state
    const [memberId, setMemberId] = useState('');
    const [payerId, setPayerId] = useState('');
    const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);

    const handlePatientSelect = (e) => {
        const pId = parseInt(e.target.value);
        const patient = patients.find(p => (p.PatientID || p.patient_id) === pId);
        setSelectedPatient(patient);
        setResult(null);

        // Auto-fill from eligibility data
        const ins = eligibilityData.find(el => el.PatientID === pId);
        if (ins) {
            setMemberId(ins.subscriber_no || ins.subscriberNo || '');
            const matchedPayer = payers.find(p =>
                (ins.payer_name || '').toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
            );
            setPayerId(matchedPayer?.id || '');
        }
    };

    const handleVerify = async () => {
        if (!selectedPatient) return;
        setIsVerifying(true);
        setResult(null);

        const insurance = {
            memberId: memberId,
            payerId: payerId,
            payerName: payers.find(p => p.id === payerId)?.name || 'Unknown',
            subscriberNo: memberId,
        };

        try {
            const res = await verifyEligibility(selectedPatient, insurance);
            setResult(res);
            onVerify(selectedPatient, res);
            showNotif(`✅ Verification complete: ${res.status}`);
        } catch (e) {
            showNotif(`❌ Error: ${e.message}`, true);
        }
        setIsVerifying(false);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left: Form */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>
                    270 Eligibility Request
                </h3>

                {/* Patient Selection */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Select Patient</label>
                    <select onChange={handlePatientSelect} value={selectedPatient ? (selectedPatient.PatientID || selectedPatient.patient_id) : ''}
                        style={inputStyle}>
                        <option value="">— Choose patient —</option>
                        {patients.map(p => (
                            <option key={p.PatientID || p.patient_id} value={p.PatientID || p.patient_id}>
                                {p.FirstName} {p.LastName} ({p.AccountNo || 'N/A'})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPatient && (
                    <>
                        {/* Patient Info Box */}
                        <div style={{
                            backgroundColor: '#f7f9ff', borderRadius: '8px', padding: '14px',
                            marginBottom: '16px', border: '1px solid #e3f2fd',
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0004d0' }}>
                                {selectedPatient.FirstName} {selectedPatient.LastName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                DOB: {selectedPatient.DOB || 'N/A'} | Gender: {selectedPatient.Gender || 'N/A'} | Acct: {selectedPatient.AccountNo}
                            </div>
                        </div>

                        {/* Payer */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Payer</label>
                            <select value={payerId} onChange={e => setPayerId(e.target.value)} style={inputStyle}>
                                <option value="">— Select payer —</option>
                                {payers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Member ID */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Member / Subscriber ID</label>
                            <input type="text" value={memberId} onChange={e => setMemberId(e.target.value)}
                                placeholder="Enter member ID" style={inputStyle} />
                        </div>

                        {/* Service Date */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Service Date</label>
                            <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)}
                                style={inputStyle} />
                        </div>

                        {/* Verify Button */}
                        <button onClick={handleVerify} disabled={isVerifying || !payerId || !memberId}
                            style={{
                                width: '100%', padding: '14px', border: 'none', borderRadius: '8px',
                                backgroundColor: (isVerifying || !payerId || !memberId) ? '#e2e8f0' : '#a941c6',
                                color: 'white', fontSize: '15px', fontWeight: '700', cursor: isVerifying ? 'wait' : 'pointer',
                                transition: 'all 0.2s',
                            }}>
                            {isVerifying ? '⏳ Verifying with payer...' : '🔍 Verify Eligibility'}
                        </button>
                    </>
                )}
            </div>

            {/* Right: Result */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>
                    271 Eligibility Response
                </h3>

                {!result && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <p>Select a patient and click Verify to see eligibility results</p>
                    </div>
                )}

                {result && (
                    <div>
                        {/* Status Banner */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '16px', borderRadius: '10px', marginBottom: '20px',
                            backgroundColor: result.statusColor + '15',
                            borderLeft: `4px solid ${result.statusColor}`,
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: result.statusColor, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '18px',
                            }}>
                                {result.status === 'Active' ? '✓' : result.status === 'Inactive' ? '✗' : '?'}
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '18px' }}>
                                    Coverage: {result.status}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {result.coverage?.type || 'Standard'} | {result.coverage?.network || 'IN-NETWORK'}
                                </div>
                            </div>
                        </div>

                        {/* Plan Info */}
                        {result.plan && (
                            <div style={{
                                padding: '12px', backgroundColor: '#f7f9ff', borderRadius: '8px',
                                marginBottom: '16px', border: '1px solid #e3f2fd',
                            }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Plan</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                    {result.plan.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                    Group: {result.plan.groupNumber || 'N/A'}
                                </div>
                            </div>
                        )}

                        {/* Coverage Date Validation (ELG-03) */}
                        {result.coverage && (
                            <CoverageDateValidation coverage={result.coverage} serviceDate={serviceDate} />
                        )}

                        {/* Benefits Grid */}
                        {result.benefits && (
                            <BenefitBreakdown eligibilityData={{ benefits: result.benefits }} />
                        )}

                        {/* Mode + Timestamp */}
                        <div style={{
                            marginTop: '16px', padding: '10px', backgroundColor: '#f8fafc',
                            borderRadius: '8px', fontSize: '11px', color: '#94a3b8', textAlign: 'center',
                        }}>
                            Mode: {result.mode === 'live' ? '🟢 Live (Stedi API)' : '🟡 Mock'} |
                            Verified: {new Date(result.verifiedAt).toLocaleString()}
                            {result.rawResponse?.transactionId && ` | TX: ${result.rawResponse.transactionId}`}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// =====================================================
// TAB 4: BATCH VERIFY
// =====================================================
function BatchVerifyTab({ patients, eligibilityData, onVerify, showNotif }) {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState([]);

    const togglePatient = (pId) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(pId)) next.delete(pId); else next.add(pId);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedIds.size === patients.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(patients.map(p => p.PatientID || p.patient_id)));
        }
    };

    const handleBatchVerify = async () => {
        const items = patients
            .filter(p => selectedIds.has(p.PatientID || p.patient_id))
            .map(patient => {
                const pId = patient.PatientID || patient.patient_id;
                const ins = eligibilityData.find(e => e.PatientID === pId) || {
                    payerId: 'UHC', payerName: 'United Healthcare',
                    memberId: patient.AccountNo, subscriberNo: patient.AccountNo,
                };
                return { patient, insurance: ins };
            });

        if (items.length === 0) return;

        setIsRunning(true);
        setProgress({ current: 0, total: items.length });
        setResults([]);

        const batchResults = await batchVerify(items, (current, total, result) => {
            setProgress({ current, total });
        });

        const formattedResults = batchResults.map(r => ({
            patientName: `${r.patient.FirstName || r.patient.firstName} ${r.patient.LastName || r.patient.lastName}`,
            status: r.result.status,
            copay: r.result.benefits?.copay || 0,
            deductible: r.result.benefits?.deductible || 0,
            plan: r.result.plan?.name || 'Unknown',
        }));

        setResults(formattedResults);

        // Update history for each
        batchResults.forEach(r => onVerify(r.patient, r.result));

        showNotif(`✅ Batch complete: ${batchResults.length} patients verified`);
        setIsRunning(false);
    };

    const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
        <div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <button onClick={selectAll} style={outlineBtnStyle}>
                    {selectedIds.size === patients.length ? 'Deselect All' : 'Select All'}
                </button>
                <button onClick={handleBatchVerify} disabled={isRunning || selectedIds.size === 0}
                    style={{
                        padding: '10px 24px', border: 'none', borderRadius: '8px',
                        backgroundColor: (isRunning || selectedIds.size === 0) ? '#e2e8f0' : '#a941c6',
                        color: 'white', fontSize: '14px', fontWeight: '600', cursor: isRunning ? 'wait' : 'pointer',
                    }}>
                    {isRunning ? `⏳ Verifying ${progress.current}/${progress.total}...` : `🔍 Verify ${selectedIds.size} Patient${selectedIds.size !== 1 ? 's' : ''}`}
                </button>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedIds.size} of {patients.length} selected
                </span>
            </div>

            {/* Progress Bar */}
            {isRunning && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${pct}%`, backgroundColor: '#a941c6',
                            borderRadius: '4px', transition: 'width 0.3s',
                        }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                        {pct}% — {progress.current} of {progress.total} checked
                    </div>
                </div>
            )}

            {/* Results Table */}
            {results.length > 0 && (
                <div style={{
                    backgroundColor: 'white', borderRadius: '12px', padding: '20px',
                    marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                        Batch Results — {results.length} patients
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e3f2fd' }}>
                                <th style={thStyle}>Patient</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Plan</th>
                                <th style={thStyle}>Copay</th>
                                <th style={thStyle}>Deductible</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}><strong>{r.patientName}</strong></td>
                                    <td style={tdStyle}><StatusBadge status={r.status} /></td>
                                    <td style={tdStyle}>{r.plan}</td>
                                    <td style={tdStyle}>${r.copay.toFixed(2)}</td>
                                    <td style={tdStyle}>${r.deductible.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Patient Selection Checkboxes */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={{ ...thStyle, width: '40px' }}>
                                <input type="checkbox" checked={selectedIds.size === patients.length}
                                    onChange={selectAll} />
                            </th>
                            <th style={thStyle}>Patient Name</th>
                            <th style={thStyle}>Account No</th>
                            <th style={thStyle}>DOB</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(p => {
                            const pId = p.PatientID || p.patient_id;
                            return (
                                <tr key={pId} style={{
                                    borderBottom: '1px solid #f1f5f9',
                                    backgroundColor: selectedIds.has(pId) ? '#faf5ff' : 'transparent',
                                }}>
                                    <td style={tdStyle}>
                                        <input type="checkbox" checked={selectedIds.has(pId)}
                                            onChange={() => togglePatient(pId)} />
                                    </td>
                                    <td style={tdStyle}>{p.FirstName} {p.LastName}</td>
                                    <td style={tdStyle}>{p.AccountNo || 'N/A'}</td>
                                    <td style={tdStyle}>{p.DOB || 'N/A'}</td>
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
// TAB 5: HISTORY
// =====================================================
function HistoryTab({ history }) {
    const [search, setSearch] = useState('');

    const filtered = history.filter(h => {
        if (!search) return true;
        return h.patientName.toLowerCase().includes(search.toLowerCase()) ||
            h.payerName.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <input type="text" placeholder="Search history..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={thStyle}>Date/Time</th>
                            <th style={thStyle}>Patient</th>
                            <th style={thStyle}>Payer / Plan</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Copay</th>
                            <th style={thStyle}>Deductible</th>
                            <th style={thStyle}>Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ ...tdStyle, fontSize: '12px', color: '#64748b' }}>
                                    {new Date(h.verifiedAt).toLocaleString()}
                                </td>
                                <td style={tdStyle}><strong>{h.patientName}</strong></td>
                                <td style={tdStyle}>{h.payerName}</td>
                                <td style={tdStyle}><StatusBadge status={h.status} /></td>
                                <td style={tdStyle}>${(h.copay || 0).toFixed(2)}</td>
                                <td style={tdStyle}>${(h.deductible || 0).toFixed(2)}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        fontSize: '10px', padding: '3px 8px', borderRadius: '4px',
                                        backgroundColor: h.mode === 'live' ? '#d1fae5' : '#fef3c7',
                                        color: h.mode === 'live' ? '#065f46' : '#92400e',
                                        fontWeight: '600',
                                    }}>
                                        {h.mode === 'live' ? 'LIVE' : 'MOCK'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>
                                No history records found
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// =====================================================
// COVERAGE DATE VALIDATION (ELG-03)
// =====================================================

function CoverageDateValidation({ coverage, serviceDate }) {
    const warnings = [];
    const now = new Date();
    const svcDate = serviceDate ? new Date(serviceDate) : now;

    if (coverage.effectiveDate) {
        const effDate = new Date(coverage.effectiveDate);
        if (svcDate < effDate) {
            warnings.push({ type: 'error', msg: `Coverage starts ${coverage.effectiveDate} — service date is BEFORE effective date` });
        }
    }
    if (coverage.terminationDate) {
        const termDate = new Date(coverage.terminationDate);
        if (svcDate > termDate) {
            warnings.push({ type: 'error', msg: `Coverage ended ${coverage.terminationDate} — service date is AFTER termination` });
        } else {
            const daysUntilTerm = Math.ceil((termDate - svcDate) / (1000 * 60 * 60 * 24));
            if (daysUntilTerm <= 30) {
                warnings.push({ type: 'warning', msg: `Coverage terminates in ${daysUntilTerm} days (${coverage.terminationDate})` });
            }
        }
    }

    if (warnings.length === 0) {
        return (
            <div style={{
                padding: '8px 12px', borderRadius: '6px', marginBottom: '12px',
                backgroundColor: '#d1fae5', border: '1px solid #86efac', fontSize: '12px', color: '#065f46',
            }}>
                ✅ Coverage dates valid for service date ({serviceDate || 'today'})
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '12px' }}>
            {warnings.map((w, i) => (
                <div key={i} style={{
                    padding: '8px 12px', borderRadius: '6px', marginBottom: '4px',
                    backgroundColor: w.type === 'error' ? '#fee2e2' : '#fef3c7',
                    border: `1px solid ${w.type === 'error' ? '#fca5a5' : '#fcd34d'}`,
                    fontSize: '12px', color: w.type === 'error' ? '#991b1b' : '#92400e',
                    fontWeight: '600',
                }}>
                    {w.type === 'error' ? '🚫' : '⚠️'} {w.msg}
                </div>
            ))}
        </div>
    );
}

// =====================================================
// SHARED COMPONENTS + STYLES
// =====================================================

function StatusBadge({ status }) {
    const colors = {
        Active: { bg: '#d1fae5', text: '#065f46' },
        Inactive: { bg: '#fee2e2', text: '#991b1b' },
        Pending: { bg: '#fef3c7', text: '#92400e' },
        Error: { bg: '#fef3c7', text: '#92400e' },
    };
    const c = colors[status] || colors.Pending;
    return (
        <span style={{
            padding: '4px 10px', borderRadius: '12px', fontSize: '11px',
            fontWeight: '700', backgroundColor: c.bg, color: c.text,
        }}>
            {status}
        </span>
    );
}

const thStyle = {
    padding: '12px 16px', textAlign: 'left', color: '#0004d0',
    fontWeight: '600', fontSize: '13px',
};

const tdStyle = {
    padding: '12px 16px', fontSize: '14px', color: '#0f172a',
};

const labelStyle = {
    display: 'block', marginBottom: '6px', fontSize: '13px',
    fontWeight: '600', color: '#374151',
};

const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
};

const outlineBtnStyle = {
    padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px',
    backgroundColor: 'white', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', color: '#475569',
};

export default EligibilityHub;
