import React, { useState, useEffect } from 'react';
import { authService } from './lib/auth';
import mockData from './lib/mockData';
import { calculateAge, formatSSNForDisplay } from './lib/validation';
import { maskSSN, maskPhone, maskEmail } from './lib/encryption';
import { PatientHub, Scheduler, ClaimsManagement, ProgressNotes, AdminModule } from './components/ECWModules';
import './styles/ecw.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentModule, setCurrentModule] = useState('patient-hub');
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // Auto-select first patient for demo
        if (mockData.patients.length > 0) {
            setSelectedPatient(mockData.patients[0]);
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        await authService.logout();
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <p>Loading eClinicalWorks...</p>
            </div>
        );
    }

    if (!user) {
        return <ECWLogin onLogin={handleLogin} />;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Left Sidebar */}
            <ECWSidebar currentModule={currentModule} onModuleChange={setCurrentModule} onLogout={handleLogout} />

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Header */}
                {selectedPatient && (
                    <ECWPatientHeader patient={selectedPatient} />
                )}

                {/* Module Content */}
                <div style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--ecw-bg-gray)' }}>
                    {currentModule === 'patient-hub' && <PatientHub patient={selectedPatient} />}
                    {currentModule === 'scheduler' && <Scheduler />}
                    {currentModule === 'claims' && <ClaimsManagement patient={selectedPatient} />}
                    {currentModule === 'progress-notes' && <ProgressNotes patient={selectedPatient} />}
                    {currentModule === 'admin' && <AdminModule />}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// ECW LOGIN COMPONENT
// ============================================================================
function ECWLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { user } = await authService.login(email, password);
            onLogin(user);
        } catch (err) {
            setError(err.error || 'Login failed');
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--ecw-primary-blue)' }}>
            <div className="ecw-card" style={{ width: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ color: 'var(--ecw-primary-blue)', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                        eClinicalWorks
                    </h1>
                    <p style={{ color: 'var(--ecw-text-secondary)', fontSize: '14px' }}>
                        Revenue Cycle Management V12
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '12px', backgroundColor: '#ffebee', color: 'var(--ecw-error)', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            className="ecw-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="demo@rcmbilling.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            className="ecw-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="demo123"
                            required
                        />
                    </div>

                    <button type="submit" className="ecw-btn ecw-btn-primary" style={{ width: '100%' }}>
                        Sign In
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--ecw-text-secondary)', textAlign: 'center' }}>
                    Demo: demo@rcmbilling.com / demo123
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// ECW SIDEBAR COMPONENT
// ============================================================================
function ECWSidebar({ currentModule, onModuleChange, onLogout }) {
    const modules = [
        { id: 'patient-hub', icon: '◉', label: 'Patient', title: 'Patient Hub' },
        { id: 'scheduler', icon: '▤', label: 'Schedule', title: 'Scheduler' },
        { id: 'admin', icon: '⚙', label: 'Admin', title: 'Administration' },
        { id: 'claims', icon: '$', label: 'Claims', title: 'Claims Management' },
        { id: 'progress-notes', icon: '▣', label: 'Notes', title: 'Progress Notes' },
        { id: 'referrals', icon: '→', label: 'Referrals', title: 'Referrals' },
        { id: 'registry', icon: '■', label: 'Registry', title: 'Registry' },
        { id: 'alerts', icon: '◈', label: 'Alerts', title: 'Alerts' },
        { id: 'analytics', icon: '▥', label: 'Analytics', title: 'Analytics' },
        { id: 'forms', icon: '▣', label: 'Forms', title: 'Forms' },
    ];

    return (
        <div style={{
            width: 'var(--ecw-sidebar-width)',
            backgroundColor: 'var(--ecw-sidebar-bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '16px',
            paddingBottom: '16px',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        }}>
            {/* Logo */}
            <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--ecw-primary-blue)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '24px',
                color: 'white',
                fontWeight: 'bold'
            }}>
                eC
            </div>

            {/* Module Icons */}
            <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {modules.map(module => (
                    <button
                        key={module.id}
                        onClick={() => onModuleChange(module.id)}
                        title={module.title}
                        style={{
                            width: '44px',
                            height: '44px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: currentModule === module.id ? 'var(--ecw-primary-blue)' : 'transparent',
                            color: currentModule === module.id ? 'white' : 'var(--ecw-sidebar-icon-color)',
                            fontSize: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        <span>{module.icon}</span>
                        <span style={{ fontSize: '8px', marginTop: '2px' }}>{module.label}</span>
                    </button>
                ))}
            </div>

            {/* Logout */}
            <button
                onClick={onLogout}
                title="Logout"
                style={{
                    width: '44px',
                    height: '44px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: 'var(--ecw-sidebar-icon-color)',
                    fontSize: '20px',
                    cursor: 'pointer'
                }}
            >
                Logout
            </button>
        </div>
    );
}

// ============================================================================
// ECW PATIENT HEADER
// ============================================================================
function ECWPatientHeader({ patient }) {
    const insurance = mockData.insurances.find(ins => ins.PatientID === patient.PatientID);
    const age = calculateAge(patient.DOB);

    return (
        <div style={{
            backgroundColor: 'var(--ecw-primary-blue)',
            color: 'white',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {patient.LastName}, {patient.FirstName}
                    </span>
                    {patient.MiddleName && <span> {patient.MiddleName}</span>}
                    <span style={{ marginLeft: '12px', opacity: 0.9 }}>
                        DOB: {patient.DOB} ({age} yo {patient.Gender === 'M' ? 'M' : 'F'})
                    </span>
                </div>
                <div style={{ opacity: 0.9 }}>
                    Acc No. <strong>{patient.AccountNo}</strong>
                </div>
                <div style={{ opacity: 0.9 }}>
                    {insurance?.InsuranceName || 'No Insurance'}
                </div>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                POS: {new Date().toLocaleDateString()}
            </div>
        </div>
    );
}

export default App;
