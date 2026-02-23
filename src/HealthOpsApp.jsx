/**
 * HealthOpsApp — Multi-Tenant SaaS Platform Shell
 * HealthOps Backoffice OS — Phase N1
 *
 * The production entry point for the modular SaaS platform.
 * Dynamic sidebar, tenant-aware routing, unified dashboard.
 *
 * PRD Coverage: MT-01→06, MOD-01→04, FF-04, USE-01→04
 */
import React, { useState, useEffect, useCallback } from 'react';
import { authService } from './lib/auth';
import { TenantProvider, useTenant } from './lib/tenantContext.jsx';
import { getEnabledModules, getModulesByCategory, checkModuleDependencies, MODULE_REGISTRY } from './lib/moduleRegistry';
import { EligibilityHub } from './components/EligibilityHub';
import { AuthorizationHub } from './components/AuthorizationHub';
import { getECWConnectionStatus } from './lib/ecwIntegration';
import { getEligibilityMode } from './lib/eligibilityService';
import { runAllAutomation, getAutomationLog } from './lib/workflowAutomation';
import './index.css';

// =====================================================
// MAIN APP WRAPPER (with TenantProvider)
// =====================================================
function HealthOpsApp() {
    return (
        <TenantProvider>
            <HealthOpsInner />
        </TenantProvider>
    );
}

// =====================================================
// INNER APP (has access to tenant context)
// =====================================================
function HealthOpsInner() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const { tenant, enabledModules, tenantName, switchTenant, allTenants } = useTenant();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const handleLogin = (userData) => setUser(userData);
    const handleLogout = async () => { await authService.logout(); setUser(null); };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '42px', marginBottom: '16px' }}>⚡</div>
                    <h2 style={{ color: '#1e293b', fontWeight: '800', fontSize: '20px', margin: '0 0 6px 0' }}>HealthOps Backoffice OS</h2>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>Loading platform...</p>
                </div>
            </div>
        );
    }

    if (!user) return <HealthOpsLogin onLogin={handleLogin} />;

    const activeModules = getEnabledModules(enabledModules);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Sidebar */}
            <Sidebar
                activeModules={activeModules} currentPage={currentPage}
                onNavigate={setCurrentPage} user={user} onLogout={handleLogout}
                tenant={tenant} allTenants={allTenants} onSwitchTenant={switchTenant}
            />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <Header tenant={tenant} user={user} currentPage={currentPage} />

                {/* Module Content */}
                <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#f7f9ff', padding: '24px 28px' }}>
                    {currentPage === 'dashboard' && <PlatformDashboard enabledModules={enabledModules} />}
                    {currentPage === 'eligibility' && <EligibilityHub />}
                    {currentPage === 'prior-auth' && <AuthorizationHub />}
                    {currentPage === 'auth-followup' && <AuthorizationHub />}
                    {currentPage === 'settings' && <PlatformSettings />}
                    {/* Planned modules show placeholder */}
                    {['scheduling', 'referral', 'denial-tracking', 'financial-clearance', 'communication', 'reporting', 'workforce'].includes(currentPage) && (
                        <ModulePlaceholder moduleId={currentPage} />
                    )}
                </div>
            </div>
        </div>
    );
}

// =====================================================
// SIDEBAR
// =====================================================
function Sidebar({ activeModules, currentPage, onNavigate, user, onLogout, tenant, allTenants, onSwitchTenant }) {
    const [showTenantPicker, setShowTenantPicker] = useState(false);

    return (
        <div style={{
            width: '250px', backgroundColor: '#0c1222', display: 'flex', flexDirection: 'column',
            color: 'white', flexShrink: 0,
        }}>
            {/* Branding */}
            <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '800',
                    }}>HO</div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', lineHeight: '1.2' }}>HealthOps</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>Backoffice OS</div>
                    </div>
                </div>
            </div>

            {/* Tenant Selector */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => setShowTenantPicker(!showTenantPicker)} style={{
                    width: '100%', padding: '8px 10px', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.8)', fontSize: '12px', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant?.name || 'Select Tenant'}</span>
                    <span style={{ fontSize: '8px', opacity: 0.5 }}>▼</span>
                </button>
                {showTenantPicker && (
                    <div style={{ marginTop: '4px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {allTenants.map(t => (
                            <button key={t.id} onClick={() => { onSwitchTenant(t.id); setShowTenantPicker(false); }} style={{
                                width: '100%', padding: '8px 10px', border: 'none', textAlign: 'left',
                                backgroundColor: t.id === tenant?.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.02)',
                                color: 'rgba(255,255,255,0.8)', fontSize: '11px', cursor: 'pointer',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}>
                                <div style={{ fontWeight: '600' }}>{t.name}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
                                    {t.plan} · {t.enabledModules.length} modules
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
                {/* Dashboard (always visible) */}
                <NavItem icon="■" label="Dashboard" active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />

                {/* Active Modules */}
                <div style={{ padding: '8px 8px 4px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Active Modules
                </div>
                {activeModules.map(mod => (
                    <NavItem key={mod.id} icon={mod.icon} label={mod.shortName} active={currentPage === mod.id}
                        onClick={() => onNavigate(mod.id)} badge={mod.status === 'planned' ? 'Soon' : null} />
                ))}

                {/* Settings (always visible) */}
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <NavItem icon="⚙" label="Settings" active={currentPage === 'settings'} onClick={() => onNavigate('settings')} />
                </div>
            </nav>

            {/* User Footer */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: '6px' }}>
                    {user?.name || user?.email}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                    {user?.role || 'Staff'}
                </div>
                <button onClick={onLogout} style={{
                    width: '100%', padding: '6px', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '5px', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.45)',
                    fontSize: '11px', cursor: 'pointer',
                }}>
                    Sign Out
                </button>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick, badge }) {
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
            padding: '9px 12px', marginBottom: '2px', border: 'none', borderRadius: '7px',
            backgroundColor: active ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: active ? '#c7d2fe' : 'rgba(255,255,255,0.5)',
            fontSize: '13px', fontWeight: active ? '600' : '500',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
            borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
        }}>
            <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge && <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', fontWeight: '700' }}>{badge}</span>}
        </button>
    );
}

// =====================================================
// HEADER
// =====================================================
function Header({ tenant, user, currentPage }) {
    const ecw = getECWConnectionStatus();
    const eligMode = getEligibilityMode();

    const pageTitle = currentPage === 'dashboard' ? 'Dashboard' :
        MODULE_REGISTRY.find(m => m.id === currentPage)?.name ?? currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 28px', backgroundColor: 'white', borderBottom: '1px solid #e8ecf4',
        }}>
            <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{pageTitle}</h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>{tenant?.name} · {tenant?.plan} tier</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <StatusPill label={ecw.mode === 'live' ? 'eCW Live' : 'eCW Demo'} connected={ecw.connected} />
                <StatusPill label={eligMode === 'live' ? 'Stedi Live' : 'Mock 271'} connected={eligMode === 'live'} />
            </div>
        </div>
    );
}

function StatusPill({ label, connected }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
            backgroundColor: connected ? '#ecfdf5' : '#fefce8',
            color: connected ? '#065f46' : '#854d0e',
        }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#f59e0b' }} />
            {label}
        </span>
    );
}

// =====================================================
// PLATFORM DASHBOARD
// =====================================================
function PlatformDashboard({ enabledModules }) {
    const { tenant, getSLAThreshold, getEscalationChain } = useTenant();
    const [automationResults, setAutomationResults] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const runAutomation = useCallback(async () => {
        setIsRunning(true);
        try {
            const results = await runAllAutomation();
            setAutomationResults(results);
        } catch (e) { console.error('Automation error:', e); }
        setActivityLog(getAutomationLog());
        setIsRunning(false);
    }, []);

    useEffect(() => { runAutomation(); }, [runAutomation]);

    const elig = automationResults?.eligibility || { verified: 0, failed: 0 };
    const pa = automationResults?.paRequired || [];
    const expiring = automationResults?.expiringAuths || [];
    const visits = automationResults?.visitAlerts || [];

    return (
        <div>
            {/* Welcome + Run */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                        Welcome to {tenant?.name}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        {enabledModules.length} active modules · {tenant?.plan} plan
                    </p>
                </div>
                <button onClick={runAutomation} disabled={isRunning} style={{
                    padding: '10px 20px', border: 'none', borderRadius: '8px',
                    background: isRunning ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: 'white', fontSize: '13px', fontWeight: '600', cursor: isRunning ? 'wait' : 'pointer',
                    boxShadow: isRunning ? 'none' : '0 2px 8px rgba(99,102,241,0.3)',
                }}>
                    {isRunning ? '⏳ Running...' : '⚡ Run Automation'}
                </button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <DashKPI label="Auto-Verified" value={elig.verified} icon="✅" color="#10b981" sub="T-48h pipeline" />
                <DashKPI label="PA Required" value={pa.length} icon="⚠️" color="#f59e0b" sub="CPT rule engine" />
                <DashKPI label="Expiring Auth" value={expiring.length} icon="⏰" color="#ef4444" sub="Within 7 days" />
                <DashKPI label="Visit Alerts" value={visits.length} icon="📊" color="#6366f1" sub=">80% usage" />
            </div>

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
                {/* PA Alerts */}
                <Card title="⚠️ Prior Authorization Needed">
                    {pa.length === 0 ? <EmptyState text="No PA requirements detected" /> : pa.map((item, i) => (
                        <AlertRow key={i} color="#fef3c7" border="#fcd34d" textColor="#92400e">
                            <strong>{item.appointment.firstName} {item.appointment.lastName}</strong>
                            <div>CPT: {item.requiredCodes.map(r => r.cptCode).join(', ')} · {item.appointment.payerName}</div>
                        </AlertRow>
                    ))}
                </Card>

                {/* Expiring */}
                <Card title="⏰ Expiring Authorizations">
                    {expiring.length === 0 ? <EmptyState text="No authorizations expiring soon" /> : expiring.map((auth, i) => (
                        <AlertRow key={i} color="#fee2e2" border="#fca5a5" textColor="#991b1b">
                            <strong>{auth.patientName}</strong> — {auth.authNumber}
                            <div>Expires: {auth.expiryDate} · {auth.visitsUsed}/{auth.visitsApproved} visits</div>
                        </AlertRow>
                    ))}
                </Card>
            </div>

            {/* SLA Config Summary */}
            <Card title="⚙️ SLA Configuration">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <SLABadge label="Eligibility" hours={getSLAThreshold('eligibility')} />
                    <SLABadge label="Prior Auth" hours={getSLAThreshold('priorAuth')} />
                    <SLABadge label="Follow-Up" hours={getSLAThreshold('followUp')} />
                </div>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                    Escalation chain: {getEscalationChain().join(' → ')}
                </div>
            </Card>

            {/* Activity Log */}
            <div style={{ marginTop: '18px' }}>
                <Card title="🤖 Automation Activity Log">
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {activityLog.slice(0, 15).map(entry => (
                            <div key={entry.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '8px',
                                padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px',
                            }}>
                                <LogBadge status={entry.status} />
                                <span style={{ color: '#475569', flex: 1 }}>{entry.message}</span>
                                <span style={{ color: '#94a3b8', fontSize: '10px', flexShrink: 0 }}>
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                        {activityLog.length === 0 && <EmptyState text='Click "Run Automation" to start' />}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// =====================================================
// PLATFORM SETTINGS
// =====================================================
function PlatformSettings() {
    const { tenant, enabledModules, switchTenant, allTenants, getSLAThreshold, getEscalationChain } = useTenant();
    const categories = getModulesByCategory();
    const ecw = getECWConnectionStatus();
    const eligMode = getEligibilityMode();

    return (
        <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>Platform Settings</h1>

            {/* Tenant Info */}
            <Card title="🏥 Tenant Information">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <InfoField label="Organization" value={tenant?.name} />
                    <InfoField label="Slug" value={tenant?.slug} />
                    <InfoField label="Plan" value={tenant?.plan?.toUpperCase()} />
                    <InfoField label="Facility Type" value={tenant?.facilityType?.replace('_', ' ')} />
                    <InfoField label="Location" value={tenant?.location} />
                    <InfoField label="NPI" value={tenant?.npi} />
                </div>
            </Card>

            {/* Connections */}
            <div style={{ marginTop: '18px' }}>
                <Card title="🔗 Connections">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <ConnStatus label="eClinicalWorks" connected={ecw.connected} detail={ecw.connected ? ecw.url : 'Set VITE_ECW_API_URL'} />
                        <ConnStatus label="Stedi Eligibility" connected={eligMode === 'live'} detail={eligMode === 'live' ? 'Live 270/271' : 'Set VITE_STEDI_API_KEY'} />
                    </div>
                </Card>
            </div>

            {/* Module Activation */}
            <div style={{ marginTop: '18px' }}>
                <Card title="📦 Module Activation">
                    {Object.entries(categories).map(([catKey, cat]) => (
                        <div key={catKey} style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                {cat.label}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {cat.modules.map(mod => {
                                    const enabled = enabledModules.includes(mod.id) || (mod.id === 'auth-followup' && enabledModules.includes('prior-auth'));
                                    const depCheck = checkModuleDependencies(mod.id, enabledModules);
                                    return (
                                        <div key={mod.id} style={{
                                            padding: '12px', borderRadius: '8px',
                                            border: `1px solid ${enabled ? '#c7d2fe' : '#e2e8f0'}`,
                                            backgroundColor: enabled ? '#eef2ff' : '#fafafa',
                                            opacity: mod.status === 'planned' && !enabled ? 0.7 : 1,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                                    {mod.icon} {mod.shortName}
                                                </span>
                                                <span style={{
                                                    fontSize: '9px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700',
                                                    backgroundColor: enabled ? '#d1fae5' : '#f1f5f9',
                                                    color: enabled ? '#065f46' : '#94a3b8',
                                                }}>
                                                    {enabled ? 'ACTIVE' : mod.status === 'planned' ? 'COMING SOON' : 'INACTIVE'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{mod.description}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{mod.pricing}</div>
                                            {!depCheck.canEnable && !enabled && (
                                                <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>
                                                    Requires: {depCheck.missingDeps.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </Card>
            </div>

            {/* SLA Config */}
            <div style={{ marginTop: '18px' }}>
                <Card title="⏱ SLA Configuration">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                        <SLABadge label="Eligibility SLA" hours={getSLAThreshold('eligibility')} />
                        <SLABadge label="Prior Auth SLA" hours={getSLAThreshold('priorAuth')} />
                        <SLABadge label="Follow-Up SLA" hours={getSLAThreshold('followUp')} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                        <strong>Escalation chain:</strong> {getEscalationChain().map((level, i) => (
                            <span key={i}>
                                {i > 0 && ' → '}
                                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{level}</span>
                            </span>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Environment */}
            <div style={{ marginTop: '18px' }}>
                <Card title="🔧 Environment Configuration">
                    <pre style={{
                        backgroundColor: '#1e293b', color: '#e2e8f0', padding: '14px', borderRadius: '8px',
                        fontSize: '11px', fontFamily: 'monospace', overflow: 'auto', lineHeight: '1.7',
                    }}>
                        {`# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

# Stedi Eligibility API
VITE_STEDI_API_KEY=your-stedi-key

# eClinicalWorks FHIR R4
VITE_ECW_API_URL=https://your-ecw.com/fhir/r4
VITE_ECW_API_KEY=your-ecw-key

# Platform Mode
VITE_PLUGIN_MODE=healthops`}
                    </pre>
                </Card>
            </div>
        </div>
    );
}

// =====================================================
// MODULE PLACEHOLDER (for planned modules)
// =====================================================
function ModulePlaceholder({ moduleId }) {
    const mod = MODULE_REGISTRY.find(m => m.id === moduleId);
    if (!mod) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{mod.icon}</div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{mod.name}</h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>{mod.description}</p>
                <div style={{
                    display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
                    backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '12px', fontWeight: '600',
                }}>
                    🚧 Coming Soon — PRD §{mod.prdSection}
                </div>
                <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8' }}>
                    Covers: {mod.prdIds.join(', ') || 'TBD'}
                </div>
            </div>
        </div>
    );
}

// =====================================================
// LOGIN
// =====================================================
function HealthOpsLogin({ onLogin }) {
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
        } catch (err) { setError(err.error || 'Login failed'); }
        finally { setIsLoading(false); }
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        }}>
            <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 12px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: '800', color: 'white',
                    }}>HO</div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>HealthOps Backoffice OS</h1>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Multi-Tenant Healthcare RCM Platform</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="verifier@rcmbilling.com"
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    {error && <div style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>{error}</div>}
                    <button type="submit" disabled={isLoading} style={{
                        width: '100%', padding: '11px', border: 'none', borderRadius: '8px',
                        background: isLoading ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: 'white', fontSize: '14px', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Quick Login */}
                <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px', fontWeight: '700' }}>Demo Accounts:</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {[
                            { label: '🔍 Verifier', email: 'verifier@rcmbilling.com', pass: 'verifier123' },
                            { label: '👤 Admin', email: 'demo@rcmbilling.com', pass: 'demo123' },
                            { label: '💰 Biller', email: 'billing@rcmbilling.com', pass: 'billing123' },
                        ].map(cred => (
                            <button key={cred.email} onClick={() => { setEmail(cred.email); setPassword(cred.pass); }} style={{
                                flex: 1, padding: '5px', borderRadius: '5px', border: '1px solid #e2e8f0',
                                backgroundColor: 'white', fontSize: '10px', cursor: 'pointer', color: '#475569', minWidth: '80px',
                            }}>{cred.label}</button>
                        ))}
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '14px' }}>
                    Powered by Staffingly · HIPAA Compliant
                </p>
            </div>
        </div>
    );
}

// =====================================================
// SHARED UI COMPONENTS
// =====================================================
function Card({ title, children }) {
    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {title && <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>{title}</h3>}
            {children}
        </div>
    );
}

function DashKPI({ label, value, icon, color, sub }) {
    return (
        <div style={{
            backgroundColor: 'white', borderRadius: '10px', padding: '16px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}`,
        }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color }}>{value}</div>
            {sub && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>}
        </div>
    );
}

function AlertRow({ children, color, border, textColor }) {
    return (
        <div style={{
            padding: '8px 10px', borderRadius: '6px', marginBottom: '6px',
            backgroundColor: color, border: `1px solid ${border}`, fontSize: '12px', color: textColor,
        }}>
            {children}
        </div>
    );
}

function EmptyState({ text }) {
    return <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '14px 0' }}>{text}</p>;
}

function SLABadge({ label, hours }) {
    const color = hours <= 12 ? '#ef4444' : hours <= 24 ? '#f59e0b' : '#10b981';
    return (
        <div style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${color}20`, backgroundColor: `${color}08`, textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color }}>{hours}h</div>
        </div>
    );
}

function LogBadge({ status }) {
    const styles = {
        SUCCESS: { bg: '#d1fae5', color: '#065f46' }, ERROR: { bg: '#fee2e2', color: '#991b1b' },
        WARNING: { bg: '#fef3c7', color: '#92400e' }, RUNNING: { bg: '#dbeafe', color: '#1e40af' },
        DONE: { bg: '#e0e7ff', color: '#3730a3' }, SKIPPED: { bg: '#f1f5f9', color: '#64748b' },
    };
    const s = styles[status] || styles.SKIPPED;
    return <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: '700', backgroundColor: s.bg, color: s.color, flexShrink: 0 }}>{status}</span>;
}

function InfoField({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500', textTransform: 'capitalize' }}>{value || '—'}</div>
        </div>
    );
}

function ConnStatus({ label, connected, detail }) {
    return (
        <div style={{
            padding: '14px', borderRadius: '8px',
            backgroundColor: connected ? '#f0fdf4' : '#fefce8',
            border: `1px solid ${connected ? '#86efac' : '#fde68a'}`,
        }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '12px', color: connected ? '#166534' : '#854d0e', fontWeight: '600', marginBottom: '2px' }}>
                {connected ? '🟢 Connected' : '🟡 Not Connected'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{detail}</div>
        </div>
    );
}

export default HealthOpsApp;
