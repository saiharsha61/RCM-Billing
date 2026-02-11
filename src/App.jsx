import React, { useState, useEffect } from 'react';
import { authService } from './lib/auth';
import mockData from './lib/mockData';
import { formatSSNForDisplay, calculateAge, isItemKeyEnabled } from './lib/validation';
import { maskSSN, maskPhone, maskEmail } from './lib/encryption';
import { EligibilityManagement } from './components/EligibilityCheck';
import { ReferralManagement, ServiceAuthorization } from './components/PriorAuthorization';
import { PatientDemographics } from './components/PatientDemographics';
import { InsuranceGuarantorInfo } from './components/InsuranceGuarantorInfo';
import { JellyBeanNotifications, TaskWorklist } from './components/JellyBeanNotifications';
import { ClaimsWorklist } from './components/ClaimsManagement';
import { TreatmentWindow } from './components/TreatmentWindow';
import { ReportsDashboard, AdminSettings } from './components/AdminDashboard';
import SmartForms from './components/SmartForms';
import { NDCValidator, AnesthesiaCalculator } from './components/ClinicalAdvanced';
import RxEligibility from './components/RxEligibility';
import { PatientKiosk } from './components/PatientKiosk';
import { FHIRDocumentation } from './components/FHIRDocumentation';
import { autoPopulateAuthNumber, validateClaimAuthorization, getExpiringAuthorizations } from './lib/authorizationUtils';
import { processClaimSubmission, getDecrementNotification } from './lib/visitDecrementUtils';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWorklist, setActiveWorklist] = useState(null);
  const [showClaimsWorklist, setShowClaimsWorklist] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Professional Sidebar - Simplified */}
      <div style={{
        width: '260px',
        backgroundColor: '#f7f9ff',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e3f2fd',
        boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
      }}>
        {/* Logo & Brand */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e3f2fd' }}>
          <img
            src="/staffingly-logo.png"
            alt="Staffingly"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '200px',
              marginBottom: '12px'
            }}
          />
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            {user.name} | {user.role}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {[
            { name: 'Dashboard', icon: '■' },
            { name: 'Tasks', icon: '✓' },
            { name: 'Patients', icon: '◉' },
            { name: 'Appointments', icon: '▤' },
            { name: 'Messages', icon: '◈' },
            { name: 'Telehealth', icon: '▶' },
            { name: 'Eligibility', icon: '≡' },
            { name: 'Referrals', icon: '→' },
            { name: 'Authorizations', icon: '◆' },
            { name: 'Clinical', icon: '🩺' },
            { name: 'Coding', icon: '#' },
            { name: 'Claims', icon: '▣' },
            { name: 'Payments', icon: '$' },
            { name: 'Denials', icon: '!' },
            { name: 'Documents', icon: '⊞' },
            { name: 'API Docs', icon: '🔌' },
            { name: 'Reports', icon: '▥' },
            { name: 'Settings', icon: '⚙' }
          ].map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setCurrentPage(name.toLowerCase())}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                marginBottom: '4px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: currentPage === name.toLowerCase() ? '#e3f2fd' : 'transparent',
                color: currentPage === name.toLowerCase() ? '#0004d0' : '#64748b',
                fontSize: '14px',
                fontWeight: currentPage === name.toLowerCase() ? '600' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                borderLeft: currentPage === name.toLowerCase() ? '3px solid #a941c6' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== name.toLowerCase()) {
                  e.target.style.backgroundColor = '#fff6e8';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== name.toLowerCase()) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span>{name}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #e3f2fd' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e3f2fd',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fee2e2';
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#64748b';
            }}
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header Bar */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px 32px',
          borderBottom: '1px solid #e3f2fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#0004d0', margin: 0, textTransform: 'capitalize' }}>
              {currentPage === 'dashboard' ? 'Dashboard' : currentPage}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '24px', cursor: 'pointer', color: '#a941c6' }} title="Notifications">🔔</div>
            <div style={{ fontSize: '24px', cursor: 'pointer', color: '#a941c6' }} title="Help">❓</div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          backgroundColor: '#f8fafc'
        }}>
          {currentPage === 'dashboard' && <JellyBeanNotifications onBeanClick={(type) => setActiveWorklist(type)} />}

          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'tasks' && <TasksPage />}
          {currentPage === 'patients' && <Patients />}
          {currentPage === 'appointments' && <Appointments />}
          {currentPage === 'messages' && <MessagesPage />}
          {currentPage === 'telehealth' && <TelehealthPage />}
          {currentPage === 'eligibility' && <EligibilityManagement patients={mockData.patients} insurances={mockData.eligibilityData} />}
          {currentPage === 'referrals' && <ReferralManagement patients={mockData.patients} referrals={mockData.referrals} providers={mockData.providers} eligibilityData={mockData.eligibilityData} />}
          {currentPage === 'authorizations' && <ServiceAuthorization patients={mockData.patients} serviceAuths={mockData.serviceAuthorizations} eligibilityData={mockData.eligibilityData} />}
          {currentPage === 'clinical' && <TreatmentWindow patient={mockData.patients[0]} />}
          {currentPage === 'coding' && <CodingPage />}
          {currentPage === 'claims' && <Claims onOpenWorklist={() => setShowClaimsWorklist(true)} />}
          {currentPage === 'payments' && <PaymentsPage />}
          {currentPage === 'denials' && <DenialsPage />}
          {currentPage === 'documents' && <DocumentsPage />}
          {currentPage === 'api-docs' && <FHIRDocumentation />}
          {currentPage === 'reports' && <ReportsDashboard />}
          {currentPage === 'settings' && <AdminSettings />}
        </div>
      </div>

      {/* Task Worklist Modal */}
      {activeWorklist && (
        <TaskWorklist
          type={activeWorklist}
          onClose={() => setActiveWorklist(null)}
        />
      )}

      {/* Claims Worklist Modal */}
      {showClaimsWorklist && (
        <ClaimsWorklist
          onClose={() => setShowClaimsWorklist(false)}
        />
      )}
    </div>
  );
}

// Login Component
function Login({ onLogin }) {
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
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7f9ff 0%, #e3f2fd 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,4,208,0.15), 0 4px 12px rgba(169,65,198,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/staffingly-logo.png"
            alt="Staffingly"
            style={{
              width: '100%',
              maxWidth: '300px',
              height: 'auto',
              marginBottom: '16px'
            }}
          />
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Revenue Cycle Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@rcmbilling.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#e3f2fd' : '#a941c6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#4f46e5')}
            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#6366f1')}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
            Demo Credentials:
          </p>
          <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
            Email: <span style={{ fontWeight: '600' }}>demo@rcmbilling.com</span>
          </p>
          <p style={{ fontSize: '12px', color: '#475569' }}>
            Password: <span style={{ fontWeight: '600' }}>demo123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const { patients, referrals, serviceAuthorizations } = mockData;

  // Get expiring authorizations
  const expiringAuths = getExpiringAuthorizations(referrals, serviceAuthorizations);

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
        Dashboard
      </h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Revenue Cycle Management Overview
      </p>

      {/* Expiration Alerts */}
      {expiringAuths.length > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px', marginTop: '2px' }}>⏳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px', fontSize: '16px' }}>
              {expiringAuths.length} Authorization{expiringAuths.length !== 1 ? 's' : ''} Expiring Within 30 Days
            </div>
            <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
              {expiringAuths.slice(0, 3).map((auth, idx) => {
                const patient = patients.find(p => p.PatientID === auth.patient_id);
                return (
                  <div key={idx} style={{ marginBottom: '4px' }}>
                    • <strong>{patient ? `${patient.FirstName} ${patient.LastName} ` : 'Unknown'}</strong> - {auth.type} ({auth.auth_number}) expires on {auth.expiration_date}
                  </div>
                );
              })}
              {expiringAuths.length > 3 && <div style={{ marginTop: '8px', fontStyle: 'italic' }}>+ {expiringAuths.length - 3} more authorization{expiringAuths.length - 3 !== 1 ? 's' : ''} expiring soon</div>}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <KPICard title="Expected Revenue" value="$128,400" change="+12%" positive />
        <KPICard title="In Review" value="$22,300" change="Processing" />
        <KPICard title="Clean Rate" value="94%" change="+1%" positive />
        <KPICard title="Needs Action" value="14" change="+2" />
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
          Priority Queue
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Type</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Description</th>
              <th style={{ padding: '12px 0', textAlign: 'right', color: '#64748b', fontSize: '14px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <TaskRow type="Denial" desc="Medical Necessity - Claim #4928" amount="$1,250" />
            <TaskRow type="Review" desc="Missing Modifier - Dr. Rao" amount="$890" />
            <TaskRow type="Payment" desc="Unmatched ERA - Medicare" amount="$2,300" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, positive }) {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
      <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{value}</p>
      <p style={{ color: positive ? '#10b981' : '#f59e0b', fontSize: '14px' }}>{change}</p>
    </div>
  );
}

function TaskRow({ type, desc, amount }) {
  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '16px 0' }}>
        <span style={{ padding: '4px 12px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
          {type}
        </span>
      </td>
      <td style={{ padding: '16px 0', color: '#475569' }}>{desc}</td>
      <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '600' }}>{amount}</td>
    </tr>
  );
}

// Placeholder components for other pages
function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add-patient', 'edit-demographics', 'edit-insurance', 'detail'
  const [editingPatient, setEditingPatient] = useState(null);

  const { patients, insurances, itemKeys, providers } = mockData;

  // Check if Item Keys are enabled
  const showHeight = isItemKeyEnabled('1562_DMJ', itemKeys);
  const showWeight = isItemKeyEnabled('1573_DMJ', itemKeys);
  const showHeadCirc = isItemKeyEnabled('0833_DMJ', itemKeys);

  const filteredPatients = searchTerm
    ? patients.filter(p =>
      p.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.AccountNo.includes(searchTerm)
    )
    : patients;

  const handleSavePatient = (patientData) => {
    console.log('Saving patient:', patientData);
    // In production, this would save to database
    alert(`Patient ${patientData.FirstName} ${patientData.LastName} saved successfully!`);
    setViewMode('list');
    setEditingPatient(null);
  };

  const handleSaveInsurance = (insuranceData) => {
    console.log('Saving insurance:', insuranceData);
    // In production, this would save to database
    alert('Insurance information saved successfully!');
    setViewMode('list');
    setEditingPatient(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingPatient(null);
    setSelectedPatient(null);
  };

  // If viewing Demographics form
  if (viewMode === 'add-patient' || viewMode === 'edit-demographics') {
    return (
      <div>
        <PatientDemographics
          onSave={handleSavePatient}
          onCancel={handleCancel}
          initialData={editingPatient}
          registrationVector="patient_hub"
          providers={providers || []}
          mandatoryConfig={{
            lastName: true,
            firstName: true,
            dob: true,
            gender: true,
            phoneMobile: true,
            email: true,
            race: true,
            ethnicity: true,
            language: true
          }}
        />
      </div>
    );
  }

  // If viewing Insurance form
  if (viewMode === 'edit-insurance') {
    return (
      <div>
        <InsuranceGuarantorInfo
          patientId={editingPatient?.PatientID}
          onSave={handleSaveInsurance}
          onCancel={handleCancel}
          initialData={null}
          patients={patients}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Patients</h2>
          <p style={{ color: '#64748b', marginBottom: 0 }}>Patient demographics and management</p>
        </div>
        <button
          onClick={() => {
            setEditingPatient(null);
            setViewMode('add-patient');
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#a941c6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(169, 65, 198, 0.3)'
          }}
        >
          + Add New Patient
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or account number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Patient Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Account #</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Name</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>DOB</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>SSN</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Insurance</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => {
              const insurance = insurances.find(ins => ins.PatientID === patient.PatientID);
              const eligibility = mockData.eligibilityData.find(e => e.patient_id === patient.PatientID);
              const patientReferrals = mockData.referrals.filter(r => r.patient_id === patient.PatientID && r.status === 'Approved');
              const patientAuths = mockData.serviceAuthorizations.filter(a => a.patient_id === patient.PatientID && a.status === 'Approved');
              const age = calculateAge(patient.DOB);

              return (
                <tr
                  key={patient.PatientID}
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <td style={{ padding: '16px 0', fontWeight: '600', color: '#6366f1' }}>{patient.AccountNo}</td>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{patient.FirstName} {patient.LastName}</span>
                      {eligibility && (
                        <span style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: eligibility.eligibility_status === 'Active' ? '#10b981' : eligibility.eligibility_status === 'Inactive' ? '#ef4444' : '#f59e0b',
                          display: 'inline-block'
                        }} title={`Eligibility: ${eligibility.eligibility_status} `} />
                      )}
                      {(patientReferrals.length > 0 || patientAuths.length > 0) && (
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: '#e0e7ff',
                          color: '#4f46e5',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {patientReferrals.length + patientAuths.length} Auth
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 0' }}>{patient.DOB} (Age: {age})</td>
                  <td style={{ padding: '16px 0', fontFamily: 'monospace' }}>{maskSSN(patient.SSN)}</td>
                  <td style={{ padding: '16px 0' }}>{insurance?.InsuranceName || 'None'}</td>
                  <td style={{ padding: '16px 0' }}>{maskPhone(patient.Phone)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Patient Details - {selectedPatient.AccountNo}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Patient ID</p>
                <p style={{ fontWeight: '600' }}>{selectedPatient.PatientID}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Account Number</p>
                <p style={{ fontWeight: '600' }}>{selectedPatient.AccountNo}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Full Name</p>
                <p style={{ fontWeight: '600' }}>
                  {selectedPatient.FirstName} {selectedPatient.MiddleName} {selectedPatient.LastName}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Gender</p>
                <p style={{ fontWeight: '600' }}>{selectedPatient.Gender === 'M' ? 'Male' : 'Female'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date of Birth</p>
                <p style={{ fontWeight: '600' }}>{selectedPatient.DOB} ({calculateAge(selectedPatient.DOB)} yrs)</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>SSN</p>
                <p style={{ fontWeight: '600', fontFamily: 'monospace' }}>{maskSSN(selectedPatient.SSN)}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Guarantor ID</p>
                <p style={{ fontWeight: '600' }}>{selectedPatient.GuarantorID}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email</p>
                <p style={{ fontWeight: '600' }}>{maskEmail(selectedPatient.Email)}</p>
              </div>
            </div>

            {/* Item Key Fields */}
            {(showHeight || showWeight || showHeadCirc) && (
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Vitals (Item Keys Enabled)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {showHeight && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Height (1562_DMJ)</p>
                      <p style={{ fontWeight: '600' }}>{selectedPatient.Height_cm ? `${selectedPatient.Height_cm} cm` : 'N/A'}</p>
                    </div>
                  )}
                  {showWeight && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Weight (1573_DMJ)</p>
                      <p style={{ fontWeight: '600' }}>{selectedPatient.Weight_kg ? `${selectedPatient.Weight_kg} kg` : 'N/A'}</p>
                    </div>
                  )}
                  {showHeadCirc && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Head Circumference (0833_DMJ)</p>
                      <p style={{ fontWeight: '600' }}>{selectedPatient.HeadCircumference ? `${selectedPatient.HeadCircumference} cm` : 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPatient(selectedPatient);
                  setViewMode('edit-demographics');
                  setSelectedPatient(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#a941c6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Edit Demographics
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPatient(selectedPatient);
                  setViewMode('edit-insurance');
                  setSelectedPatient(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Manage Insurance
              </button>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function Referrals() {
  const { referrals, patients, providers } = mockData;

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Referrals & Authorizations</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Track referrals and prior authorizations</p>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Patient</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Specialist</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Auth #</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Visits</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Valid Through</th>
              <th style={{ padding: '12px 0', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map(referral => {
              const patient = patients.find(p => p.PatientID === referral.PatientID);
              const specialist = providers.find(p => p.ProviderID === referral.RefToID);

              return (
                <tr key={referral.ReferralID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 0' }}>{patient?.FirstName} {patient?.LastName}</td>
                  <td style={{ padding: '16px 0' }}>
                    {specialist ? `${specialist.FirstName} ${specialist.LastName}, ${specialist.Credentials} ` : 'N/A'}
                  </td>
                  <td style={{ padding: '16px 0', fontFamily: 'monospace', fontSize: '13px' }}>{referral.AuthNo}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ fontWeight: '600' }}>{referral.VisitsUsed}</span> / {referral.VisitsAllowed}
                    <span style={{ marginLeft: '8px', color: '#64748b' }}>({referral.VisitsRemaining} left)</span>
                  </td>
                  <td style={{ padding: '16px 0' }}>{referral.EndDate}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: referral.AuthStatus === 'Approved' ? '#10b98120' : '#94a3b820',
                      color: referral.AuthStatus === 'Approved' ? '#10b981' : '#94a3b8',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {referral.AuthStatus}
                    </span>
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

function Appointments() {
  const { patients, eligibilityData } = mockData;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock appointments data
  const appointments = [
    { time: '09:00 AM', patient_id: 'P001', provider: 'Dr. Smith', reason: 'Annual Physical', duration: 30 },
    { time: '09:30 AM', patient_id: 'P002', provider: 'Dr. Smith', reason: 'Follow-up', duration: 15 },
    { time: '10:00 AM', patient_id: 'P003', provider: 'Dr. Smith', reason: 'New Patient Consult', duration: 45 },
    { time: '11:00 AM', patient_id: null, provider: 'Dr. Smith', reason: 'Available', duration: 30 },
    { time: '11:30 AM', patient_id: 'P001', provider: 'Dr. Smith', reason: 'Lab Review', duration: 15 },
    { time: '02:00 PM', patient_id: 'P002', provider: 'Dr. Jones', reason: 'Specialist Referral', duration: 30 },
    { time: '02:30 PM', patient_id: null, provider: 'Dr. Jones', reason: 'Available', duration: 30 },
    { time: '03:00 PM', patient_id: 'P003', provider: 'Dr. Jones', reason: 'Procedure', duration: 60 },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Appointments</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Schedule and manage patient appointments</p>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                <span>Active Coverage</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                <span>Pending/No Data</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                <span>Inactive Coverage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Schedule */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {appointments.map((apt, idx) => {
            const patient = patients.find(p => p.PatientID === apt.patient_id);
            const eligibility = eligibilityData.find(e => e.patient_id === apt.patient_id);

            let statusColor = '#94a3b8';
            let statusText = 'Available';

            if (patient && eligibility) {
              if (eligibility.eligibility_status === 'Active') {
                statusColor = '#10b981';
                statusText = 'Active Coverage';
              } else if (eligibility.eligibility_status === 'Inactive') {
                statusColor = '#ef4444';
                statusText = 'Inactive Coverage';
              } else {
                statusColor = '#f59e0b';
                statusText = 'Pending Verification';
              }
            } else if (patient && !eligibility) {
              statusColor = '#f59e0b';
              statusText = 'No Eligibility Data';
            }

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  padding: '16px',
                  backgroundColor: apt.patient_id ? '#ffffff' : '#f8fafc',
                  border: `2px solid ${apt.patient_id ? statusColor + '40' : '#e2e8f0'} `,
                  borderLeft: `4px solid ${statusColor} `,
                  borderRadius: '8px',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ minWidth: '80px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{apt.time}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{apt.duration} min</div>
                </div>

                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: statusColor,
                    flexShrink: 0
                  }}
                  title={statusText}
                />

                <div style={{ flex: 1 }}>
                  {patient ? (
                    <>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                        {patient.FirstName} {patient.LastName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {apt.reason} - {apt.provider}
                      </div>
                      <div style={{ fontSize: '11px', color: statusColor, fontWeight: '600', marginTop: '4px' }}>
                        {statusText}
                        {eligibility && eligibility.eligibility_status === 'Active' && (
                          <span style={{ marginLeft: '8px', color: '#64748b' }}>
                            - Copay: ${eligibility.copay_pcp?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>
                      {apt.reason} Slot - {apt.provider}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Claims({ onOpenWorklist }) {
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Claims</h2>
      <p style={{ color: '#64748b' }}>Submit and manage insurance claims</p>
      <div style={{ marginTop: '30px', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
        <button
          onClick={onOpenWorklist}
          style={{
            padding: '16px 32px',
            backgroundColor: '#a941c6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(169,65,198,0.3)'
          }}
        >
          Open Claims Worklist
        </button>
      </div>
    </div>
  );
}

// ============================================
// CODING PAGE - SmartForms + NDC + Anesthesia
// ============================================
function CodingPage() {
  const [activeTab, setActiveTab] = useState('smartforms');
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Medical Coding</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Charge capture, code validation, and smart templates</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'smartforms', label: 'Smart Forms' },
          { key: 'ndc', label: 'NDC Validator' },
          { key: 'anesthesia', label: 'Anesthesia Calculator' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === tab.key ? '#a941c6' : '#f1f5f9',
              color: activeTab === tab.key ? 'white' : '#64748b',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'smartforms' && <SmartForms />}
      {activeTab === 'ndc' && <NDCValidator />}
      {activeTab === 'anesthesia' && <AnesthesiaCalculator />}
    </div>
  );
}

// ============================================
// TASKS PAGE - Task Worklist
// ============================================
function TasksPage() {
  const taskCategories = [
    { name: 'Eligibility Failures', count: 3, color: '#ef4444', items: ['Smith, John - Aetna coverage lapsed', 'Brown, Patricia - Medicare ID mismatch', 'Davis, Michael - Cigna group number invalid'] },
    { name: 'Auth Expiring Soon', count: 2, color: '#f59e0b', items: ['Johnson, Sarah - Auth #A1234 expires 02/15', 'Williams, Robert - Referral expiring 02/20'] },
    { name: 'Claims Needing Scrub', count: 4, color: '#3b82f6', items: ['Claim #CLM-001 - Missing modifier', 'Claim #CLM-005 - No auth number', 'Claim #CLM-008 - Invalid POS', 'Claim #CLM-012 - Diagnosis pointer missing'] },
    { name: 'Denials to Work', count: 2, color: '#dc2626', items: ['Claim #CLM-003 - CO-4 Procedure not covered', 'Claim #CLM-007 - CO-197 Auth required'] },
    { name: 'Patient Reviews Pending', count: 1, color: '#8b5cf6', items: ['Garcia, Maria - Kiosk data needs verification'] }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Task Center</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Action items and work queues requiring attention</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {taskCategories.map(cat => (
          <div key={cat.name} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${cat.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{cat.name}</h3>
              <span style={{ backgroundColor: cat.color, color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }}>{cat.count}</span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
              {cat.items.map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', lineHeight: '1.4' }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PAYMENTS PAGE
// ============================================
function PaymentsPage() {
  const [payments] = useState([
    { id: 'PAY-001', date: '2026-02-07', patient: 'Smith, John', payer: 'Blue Cross', claimNo: 'CLM-001', charged: 450.00, paid: 360.00, adjusted: 90.00, method: 'ERA' },
    { id: 'PAY-002', date: '2026-02-06', patient: 'Johnson, Sarah', payer: 'Aetna', claimNo: 'CLM-003', charged: 280.00, paid: 224.00, adjusted: 56.00, method: 'ERA' },
    { id: 'PAY-003', date: '2026-02-06', patient: 'Williams, Robert', payer: 'Patient', claimNo: 'CLM-005', charged: 45.00, paid: 45.00, adjusted: 0, method: 'Credit Card' },
    { id: 'PAY-004', date: '2026-02-05', patient: 'Brown, Patricia', payer: 'Medicare', claimNo: 'CLM-002', charged: 180.00, paid: 144.00, adjusted: 36.00, method: 'ERA' },
    { id: 'PAY-005', date: '2026-02-04', patient: 'Davis, Michael', payer: 'Cigna', claimNo: 'CLM-006', charged: 375.00, paid: 0, adjusted: 0, method: 'Pending' },
  ]);

  const totalCharged = payments.reduce((s, p) => s + p.charged, 0);
  const totalPaid = payments.reduce((s, p) => s + p.paid, 0);
  const totalAdjusted = payments.reduce((s, p) => s + p.adjusted, 0);
  const totalBalance = totalCharged - totalPaid - totalAdjusted;

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Payment Posting</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Payment reconciliation and posting</p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Charged', value: `$${totalCharged.toFixed(2)}`, color: '#3b82f6' },
          { label: 'Total Paid', value: `$${totalPaid.toFixed(2)}`, color: '#10b981' },
          { label: 'Adjustments', value: `$${totalAdjusted.toFixed(2)}`, color: '#f59e0b' },
          { label: 'Balance Due', value: `$${totalBalance.toFixed(2)}`, color: '#ef4444' }
        ].map(card => (
          <div key={card.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Payments Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
              {['Payment ID', 'Date', 'Patient', 'Payer', 'Claim #', 'Charged', 'Paid', 'Adjusted', 'Method'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0004d0', fontSize: '13px' }}>{p.id}</td>
                <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{p.date}</td>
                <td style={{ padding: '14px 16px', fontWeight: '500', fontSize: '13px' }}>{p.patient}</td>
                <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{p.payer}</td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{p.claimNo}</td>
                <td style={{ padding: '14px 16px', fontWeight: '600', fontSize: '13px' }}>${p.charged.toFixed(2)}</td>
                <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: '600', fontSize: '13px' }}>${p.paid.toFixed(2)}</td>
                <td style={{ padding: '14px 16px', color: '#f59e0b', fontSize: '13px' }}>${p.adjusted.toFixed(2)}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: p.method === 'ERA' ? '#dbeafe' : p.method === 'Pending' ? '#fef3c7' : '#d1fae5', color: p.method === 'ERA' ? '#1d4ed8' : p.method === 'Pending' ? '#d97706' : '#059669' }}>{p.method}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// DENIALS PAGE
// ============================================
function DenialsPage() {
  const [denials] = useState([
    { id: 'DEN-001', claim: 'CLM-003', patient: 'Johnson, Sarah', payer: 'Aetna', code: 'CO-4', reason: 'Procedure code inconsistent with modifier', amount: 280.00, dept: 'Coding', status: 'new', priority: 'high', dueDate: '2026-02-12' },
    { id: 'DEN-002', claim: 'CLM-007', patient: 'Garcia, Maria', payer: 'UHC', code: 'CO-197', reason: 'Precertification/authorization not obtained', amount: 1200.00, dept: 'Front Desk', status: 'in_progress', priority: 'critical', dueDate: '2026-02-10' },
    { id: 'DEN-003', claim: 'CLM-010', patient: 'Lee, James', payer: 'Cigna', code: 'CO-16', reason: 'Missing claim information', amount: 450.00, dept: 'Registration', status: 'new', priority: 'medium', dueDate: '2026-02-15' },
    { id: 'DEN-004', claim: 'CLM-012', patient: 'Taylor, Lisa', payer: 'BCBS', code: 'CO-29', reason: 'Timely filing limit exceeded', amount: 320.00, dept: 'Billing', status: 'appealed', priority: 'high', dueDate: '2026-02-08' },
    { id: 'DEN-005', claim: 'CLM-015', patient: 'Harris, Mark', payer: 'Medicare', code: 'CO-97', reason: 'Payment adjusted - already adjudicated', amount: 180.00, dept: 'Billing', status: 'resolved', priority: 'low', dueDate: '2026-02-20' }
  ]);

  const statusColors = { new: { bg: '#fee2e2', text: '#dc2626' }, in_progress: { bg: '#fef3c7', text: '#d97706' }, appealed: { bg: '#dbeafe', text: '#1d4ed8' }, resolved: { bg: '#d1fae5', text: '#059669' } };
  const priorityColors = { critical: '#dc2626', high: '#f59e0b', medium: '#3b82f6', low: '#94a3b8' };

  const totalDenied = denials.reduce((s, d) => s + d.amount, 0);
  const openDenials = denials.filter(d => d.status !== 'resolved');

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Denial Management</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Track, appeal, and resolve claim denials</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Denied', value: `$${totalDenied.toFixed(2)}`, color: '#ef4444' },
          { label: 'Open Denials', value: openDenials.length, color: '#f59e0b' },
          { label: 'Appeal Rate', value: '40%', color: '#3b82f6' },
          { label: 'Recovery Rate', value: '65%', color: '#10b981' }
        ].map(card => (
          <div key={card.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Denials Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
              {['Priority', 'Denial ID', 'Claim', 'Patient', 'CARC', 'Reason', 'Amount', 'Dept', 'Status', 'Due'].map(h => (
                <th key={h} style={{ padding: '14px 12px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {denials.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: priorityColors[d.priority], display: 'inline-block' }} />
                </td>
                <td style={{ padding: '14px 12px', fontWeight: '600', color: '#0004d0', fontSize: '13px' }}>{d.id}</td>
                <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '13px' }}>{d.claim}</td>
                <td style={{ padding: '14px 12px', fontWeight: '500', fontSize: '13px' }}>{d.patient}</td>
                <td style={{ padding: '14px 12px', fontWeight: '700', color: '#dc2626', fontSize: '13px' }}>{d.code}</td>
                <td style={{ padding: '14px 12px', color: '#475569', fontSize: '12px', maxWidth: '200px' }}>{d.reason}</td>
                <td style={{ padding: '14px 12px', fontWeight: '700', fontSize: '13px' }}>${d.amount.toFixed(2)}</td>
                <td style={{ padding: '14px 12px', fontSize: '12px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', fontWeight: '600' }}>{d.dept}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: statusColors[d.status]?.bg, color: statusColors[d.status]?.text }}>{d.status.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '12px' }}>{d.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// MESSAGES PAGE
// ============================================
function MessagesPage() {
  const [messages] = useState([
    { id: 1, from: 'Dr. Cara Erkut', subject: 'Lab results for Smith, John', time: '10:30 AM', unread: true, category: 'Lab' },
    { id: 2, from: 'Front Desk', subject: 'Auth approval received - Johnson, Sarah', time: '9:45 AM', unread: true, category: 'Auth' },
    { id: 3, from: 'Billing Team', subject: 'Claim CLM-003 denied - needs review', time: 'Yesterday', unread: false, category: 'Billing' },
    { id: 4, from: 'Patient Portal', subject: 'Rx refill request - Williams, Robert', time: 'Yesterday', unread: false, category: 'Rx' },
    { id: 5, from: 'Lab Corp', subject: 'STAT results available', time: '2 days ago', unread: false, category: 'Lab' }
  ]);

  const categoryColors = { Lab: '#3b82f6', Auth: '#a941c6', Billing: '#f59e0b', Rx: '#10b981' };

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Secure Messages</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Internal communication and notifications</p>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {messages.map(m => (
          <div key={m.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: m.unread ? '#f7f9ff' : 'white', cursor: 'pointer' }}>
            {m.unread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a941c6', flexShrink: 0 }} />}
            {!m.unread && <span style={{ width: '8px', height: '8px', flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: m.unread ? '700' : '500', fontSize: '14px', color: '#0f172a' }}>{m.from}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{m.time}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{m.subject}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: `${categoryColors[m.category]}20`, color: categoryColors[m.category] }}>{m.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TELEHEALTH PAGE
// ============================================
function TelehealthPage() {
  const upcomingVisits = [
    { id: 1, patient: 'Smith, John', time: '2:00 PM', type: 'Follow-up', status: 'scheduled' },
    { id: 2, patient: 'Johnson, Sarah', time: '2:30 PM', type: 'New Patient', status: 'waiting' },
    { id: 3, patient: 'Williams, Robert', time: '3:00 PM', type: 'Med Check', status: 'scheduled' }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Telehealth</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Virtual care visit management</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Today's Virtual Visits */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Today's Virtual Visits</h3>
          {upcomingVisits.map(v => (
            <div key={v.id} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', color: '#0f172a' }}>{v.patient}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{v.time} - {v.type}</div>
              </div>
              <button style={{ padding: '8px 16px', backgroundColor: v.status === 'waiting' ? '#10b981' : '#a941c6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                {v.status === 'waiting' ? 'Join Now' : 'View'}
              </button>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Telehealth Stats</h3>
          {[
            { label: 'Visits Today', value: '3', color: '#a941c6' },
            { label: 'Avg Duration', value: '18 min', color: '#3b82f6' },
            { label: 'No-Show Rate', value: '8%', color: '#10b981' },
            { label: 'Patient Satisfaction', value: '4.8/5', color: '#f59e0b' }
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>{s.label}</span>
              <span style={{ fontWeight: '700', color: s.color, fontSize: '16px' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DOCUMENTS PAGE
// ============================================
function DocumentsPage() {
  const [documents] = useState([
    { id: 1, name: 'Insurance_Card_Front.pdf', patient: 'Smith, John', type: 'Insurance', date: '2026-02-07', size: '245 KB' },
    { id: 2, name: 'Referral_Letter.pdf', patient: 'Johnson, Sarah', type: 'Referral', date: '2026-02-06', size: '128 KB' },
    { id: 3, name: 'Lab_Results_CBC.pdf', patient: 'Williams, Robert', type: 'Lab Report', date: '2026-02-05', size: '312 KB' },
    { id: 4, name: 'Auth_Approval.pdf', patient: 'Brown, Patricia', type: 'Authorization', date: '2026-02-04', size: '89 KB' },
    { id: 5, name: 'Patient_Consent.pdf', patient: 'Davis, Michael', type: 'Consent Form', date: '2026-02-03', size: '156 KB' }
  ]);

  const typeColors = { Insurance: '#3b82f6', Referral: '#a941c6', 'Lab Report': '#10b981', Authorization: '#f59e0b', 'Consent Form': '#64748b' };

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Document Manager</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>File management, scanning, and OCR</p>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
              {['File Name', 'Patient', 'Type', 'Date', 'Size', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>{doc.name}</td>
                <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{doc.patient}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: `${typeColors[doc.type]}20`, color: typeColors[doc.type] }}>{doc.type}</span>
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{doc.date}</td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{doc.size}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button style={{ padding: '4px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#64748b', fontSize: '12px', cursor: 'pointer', marginRight: '6px' }}>View</button>
                  <button style={{ padding: '4px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PagePlaceholder({ title, subtitle }) {
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>{title}</h2>
      <p style={{ color: '#64748b' }}>{subtitle}</p>
      <div style={{ marginTop: '30px', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Content coming soon...</p>
      </div>
    </div>
  );
}

export default App;
