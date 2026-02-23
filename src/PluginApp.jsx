/**
 * PluginApp — Dedicated SaaS Plugin Entry Point
 * Phase M: Focused 2-module experience for eCW integration
 *
 * Modules: Eligibility Verification + Prior Authorization
 * Features: Unified dashboard, workflow automation, eCW status indicator
 */
import React, { useState, useEffect, useCallback } from 'react';
import { authService } from './lib/auth';
import { EligibilityHub } from './components/EligibilityHub';
import { AuthorizationHub } from './components/AuthorizationHub';
import { getECWConnectionStatus } from './lib/ecwIntegration';
import { runAllAutomation, getAutomationLog, runT48hVerification, runDailyBatch, scanForPARequirements, checkExpiringAuths, checkVisitUsage } from './lib/workflowAutomation';
import { getEligibilityMode } from './lib/eligibilityService';
import './index.css';

// =====================================================
// PLUGIN NAV ITEMS
// =====================================================
const PLUGIN_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'eligibility', label: 'Eligibility', icon: '≡' },
    { id: 'authorizations', label: 'Prior Auth', icon: '◆' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
];

// =====================================================
// MAIN PLUGIN APP
// =====================================================
function PluginApp() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const handleLogin = (userData) => setUser(userData);

    const handleLogout = async () => {
        await authService.logout();
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #f7f9ff 0%, #e3f2fd 100%)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚡</div>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Loading Staffingly Plugin...</p>
                </div>
            </div>
        );
    }

    if (!user) return <PluginLogin onLogin={handleLogin} />;

    const ecwStatus = getECWConnectionStatus();
    const eligMode = getEligibilityMode();

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Sidebar */}
            <div style={{
                width: '240px', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column',
                color: 'white', flexShrink: 0,
            }}>
                {/* Brand */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <img src="/staffingly-logo.png" alt="Staffingly" style={{ height: '28px', filter: 'brightness(2)' }}
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>Staffingly</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>
                        Verification Plugin v1.0
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 8px' }}>
                    {PLUGIN_NAV.map(item => (
                        <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                            padding: '11px 14px', marginBottom: '3px', border: 'none', borderRadius: '8px',
                            backgroundColor: currentPage === item.id ? 'rgba(169,65,198,0.25)' : 'transparent',
                            color: currentPage === item.id ? '#e9d5ff' : 'rgba(255,255,255,0.55)',
                            fontSize: '13px', fontWeight: currentPage === item.id ? '600' : '500',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                            borderLeft: currentPage === item.id ? '3px solid #a941c6' : '3px solid transparent',
                        }}>
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Connection Status */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Connections
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                        {ecwStatus.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                        {eligMode === 'live' ? '🟢 Stedi API' : '🟡 Mock Eligibility'}
                    </div>
                </div>

                {/* User + Logout */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', fontWeight: '500' }}>
                        {user.name || user.email}
                    </div>
                    <button onClick={handleLogout} style={{
                        padding: '6px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px',
                        backgroundColor: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '11px',
                        cursor: 'pointer', width: '100%',
                    }}>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#f7f9ff', padding: '24px 32px' }}>
                {currentPage === 'dashboard' && <PluginDashboard />}
                {currentPage === 'eligibility' && <EligibilityHub />}
                {currentPage === 'authorizations' && <AuthorizationHub />}
                {currentPage === 'settings' && <PluginSettings ecwStatus={ecwStatus} eligMode={eligMode} />}
            </div>
        </div>
    );
}

// =====================================================
// PLUGIN DASHBOARD — Unified View
// =====================================================
function PluginDashboard() {
    const [automationResults, setAutomationResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [activityLog, setActivityLog] = useState([]);
    const [paNeeded, setPaNeeded] = useState([]);
    const [expiringAuths, setExpiringAuths] = useState([]);
    const [visitAlerts, setVisitAlerts] = useState([]);

    const runAutomation = useCallback(async () => {
        setIsRunning(true);
        try {
            const results = await runAllAutomation();
            setAutomationResults(results);
            setPaNeeded(results.paRequired || []);
            setExpiringAuths(results.expiringAuths || []);
            setVisitAlerts(results.visitAlerts || []);
        } catch (e) {
            console.error('Automation error:', e);
        }
        setActivityLog(getAutomationLog());
        setIsRunning(false);
    }, []);

    // Run on mount
    useEffect(() => { runAutomation(); }, [runAutomation]);

    const eligStats = automationResults?.eligibility || { verified: 0, failed: 0 };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                        Verification Dashboard
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        Automated eligibility verification & prior authorization management
                    </p>
                </div>
                <button onClick={runAutomation} disabled={isRunning} style={{
                    padding: '10px 20px', border: 'none', borderRadius: '8px',
                    backgroundColor: isRunning ? '#e2e8f0' : '#a941c6', color: 'white',
                    fontSize: '13px', fontWeight: '600', cursor: isRunning ? 'wait' : 'pointer',
                }}>
                    {isRunning ? '⏳ Running...' : '⚡ Run Automation'}
                </button>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <KPI label="Auto-Verified" value={eligStats.verified} icon="✅" color="#10b981" />
                <KPI label="PA Required" value={paNeeded.length} icon="⚠️" color="#f59e0b" />
                <KPI label="Expiring Auth" value={expiringAuths.length} icon="⏰" color="#ef4444" />
                <KPI label="Visit Alerts" value={visitAlerts.length} icon="📊" color="#3b82f6" />
            </div>

            {/* Two-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* PA Required */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚠️ Prior Authorization Needed
                    </h3>
                    {paNeeded.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>No PA requirements detected</p>
                    ) : (
                        paNeeded.map((item, i) => (
                            <div key={i} style={{
                                padding: '10px 12px', borderRadius: '8px', marginBottom: '8px',
                                backgroundColor: '#fef3c7', border: '1px solid #fcd34d', fontSize: '13px',
                            }}>
                                <strong>{item.appointment.firstName} {item.appointment.lastName}</strong>
                                <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>
                                    CPT: {item.requiredCodes.map(r => r.cptCode).join(', ')} | {item.appointment.payerName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>
                                    Appt: {new Date(item.appointment.appointmentDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Expiring Authorizations */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⏰ Expiring Authorizations (7 days)
                    </h3>
                    {expiringAuths.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>No authorizations expiring soon</p>
                    ) : (
                        expiringAuths.map((auth, i) => (
                            <div key={i} style={{
                                padding: '10px 12px', borderRadius: '8px', marginBottom: '8px',
                                backgroundColor: '#fee2e2', border: '1px solid #fca5a5', fontSize: '13px',
                            }}>
                                <strong>{auth.patientName}</strong> — {auth.authNumber}
                                <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '2px' }}>
                                    Expires: {auth.expiryDate} | Visits: {auth.visitsUsed}/{auth.visitsApproved} used
                                </div>
                                <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '2px' }}>
                                    {auth.payer}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Activity Log */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
                    🤖 Automation Activity Log
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {activityLog.slice(0, 20).map(entry => (
                        <div key={entry.id} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px',
                        }}>
                            <span style={{
                                padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', flexShrink: 0,
                                backgroundColor: entry.status === 'SUCCESS' ? '#d1fae5' : entry.status === 'ERROR' ? '#fee2e2' : entry.status === 'WARNING' ? '#fef3c7' : entry.status === 'RUNNING' ? '#dbeafe' : '#f1f5f9',
                                color: entry.status === 'SUCCESS' ? '#065f46' : entry.status === 'ERROR' ? '#991b1b' : entry.status === 'WARNING' ? '#92400e' : entry.status === 'RUNNING' ? '#1e40af' : '#64748b',
                            }}>
                                {entry.status}
                            </span>
                            <span style={{ color: '#475569', flex: 1 }}>{entry.message}</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px', flexShrink: 0 }}>
                                {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                    {activityLog.length === 0 && (
                        <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                            No automation activity yet. Click "Run Automation" to start.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// =====================================================
// KPI COMPONENT
// =====================================================
function KPI({ label, value, icon, color }) {
    return (
        <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`,
        }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color }}>
                {value}
            </div>
        </div>
    );
}

// =====================================================
// PLUGIN SETTINGS
// =====================================================
function PluginSettings({ ecwStatus, eligMode }) {
    return (
        <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>
                Plugin Settings
            </h1>

            {/* Connection Status */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
                    Connection Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <StatusCard
                        label="eClinicalWorks"
                        status={ecwStatus.connected ? 'Connected' : 'Not Connected'}
                        connected={ecwStatus.connected}
                        detail={ecwStatus.connected ? ecwStatus.url : 'Set VITE_ECW_API_URL + VITE_ECW_API_KEY in .env'}
                    />
                    <StatusCard
                        label="Stedi Eligibility API"
                        status={eligMode === 'live' ? 'Connected' : 'Demo Mode'}
                        connected={eligMode === 'live'}
                        detail={eligMode === 'live' ? 'Live 270/271 transactions' : 'Set VITE_STEDI_API_KEY in .env'}
                    />
                </div>
            </div>

            {/* Environment Variables */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
                    Configuration (.env)
                </h3>
                <pre style={{
                    backgroundColor: '#1e293b', color: '#e2e8f0', padding: '16px', borderRadius: '8px',
                    fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: '1.8',
                }}>
                    {`# Supabase (Database & Auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

# Stedi Eligibility API (1,000 free/month)
VITE_STEDI_API_KEY=your-stedi-key

# eClinicalWorks FHIR R4 Integration
VITE_ECW_API_URL=https://your-ecw.com/fhir/r4
VITE_ECW_API_KEY=your-ecw-key

# Plugin Mode
VITE_PLUGIN_MODE=true`}
                </pre>
            </div>

            {/* Module Info */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
                    Active Modules
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <ModuleCard name="Eligibility Verification" version="1.0" status="Active" price="$249/provider/mo"
                        features={['Real-time 270/271', 'Batch verify', 'T-48h auto-verify', 'Payer directory']} />
                    <ModuleCard name="Prior Authorization" version="1.0" status="Active" price="$249/provider/mo"
                        features={['State machine', 'CPT auto-detect', 'X12 278 preview', 'Expiry tracking']} />
                </div>
            </div>
        </div>
    );
}

function StatusCard({ label, status, connected, detail }) {
    return (
        <div style={{
            padding: '16px', borderRadius: '8px',
            backgroundColor: connected ? '#f0fdf4' : '#fefce8',
            border: `1px solid ${connected ? '#86efac' : '#fde68a'}`,
        }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: connected ? '#166534' : '#854d0e', fontWeight: '600', marginBottom: '4px' }}>
                {connected ? '🟢' : '🟡'} {status}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{detail}</div>
        </div>
    );
}

function ModuleCard({ name, version, status, price, features }) {
    return (
        <div style={{
            padding: '16px', borderRadius: '8px', border: '1px solid #e3f2fd',
            backgroundColor: '#f7f9ff',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{name}</div>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#d1fae5', color: '#065f46', fontWeight: '700' }}>
                    {status}
                </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>v{version} | {price}</div>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {features.map((f, i) => (
                    <li key={i} style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>{f}</li>
                ))}
            </ul>
        </div>
    );
}

// =====================================================
// PLUGIN LOGIN
// =====================================================
function PluginLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { user } = await authService.login(email, password);
            onLogin(user);
        } catch (err) {
            setError(err.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        }}>
            <div style={{
                width: '100%', maxWidth: '420px', backgroundColor: 'white', padding: '40px',
                borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img src="/staffingly-logo.png" alt="Staffingly" style={{ maxWidth: '260px', height: 'auto', marginBottom: '12px' }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    <div style={{
                        display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
                        backgroundColor: '#f3e8ff', color: '#7c3aed', fontSize: '11px', fontWeight: '700',
                    }}>
                        Verification Plugin v1.0
                    </div>
                    <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>
                        Eligibility Verification & Prior Authorization
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="verifier@rcmbilling.com"
                            style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password"
                            style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>

                    {error && (
                        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} style={{
                        width: '100%', padding: '12px', border: 'none', borderRadius: '8px',
                        backgroundColor: isLoading ? '#e2e8f0' : '#a941c6', color: 'white',
                        fontSize: '14px', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}>
                        {isLoading ? 'Signing in...' : 'Sign In to Plugin'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>Quick Login:</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => { setEmail('verifier@rcmbilling.com'); setPassword('verifier123'); }}
                            style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '2px solid #a941c6', backgroundColor: '#faf5ff', fontSize: '11px', cursor: 'pointer', color: '#7c3aed', fontWeight: '700' }}>
                            🔍 Verifier
                        </button>
                        <button type="button" onClick={() => { setEmail('demo@rcmbilling.com'); setPassword('demo123'); }}
                            style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '11px', cursor: 'pointer', color: '#475569' }}>
                            👤 Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PluginApp;
