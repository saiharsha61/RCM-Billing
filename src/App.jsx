import React, { useState, useEffect } from 'react';
import { authService } from './lib/auth';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#6366f1',
          marginBottom: '10px'
        }}>
          RCM Billing
        </h1>

        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '30px' }}>
          Welcome, {user.name}
        </p>

        <nav style={{ flex: 1 }}>
          {['Dashboard', 'Patients', 'Appointments', 'Eligibility', 'Coding', 'Claims', 'Payments', 'Denials', 'Reports'].map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page.toLowerCase())}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: currentPage === page.toLowerCase() ? '#eef2ff' : 'transparent',
                color: currentPage === page.toLowerCase() ? '#6366f1' : '#64748b',
                fontSize: '14px',
                fontWeight: currentPage === page.toLowerCase() ? '600' : '400',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {page}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '40px',
        overflowY: 'auto',
        backgroundColor: '#f8fafc'
      }}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'patients' && <Patients />}
        {currentPage === 'appointments' && <Appointments />}
        {currentPage === 'eligibility' && <Eligibility />}
        {currentPage === 'coding' && <Coding />}
        {currentPage === 'claims' && <Claims />}
        {currentPage === 'payments' && <Payments />}
        {currentPage === 'denials' && <Denials />}
        {currentPage === 'reports' && <Reports />}
      </div>
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
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1', marginBottom: '8px' }}>
            RCM Billing
          </h1>
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
              backgroundColor: isLoading ? '#94a3b8' : '#6366f1',
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
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
        Dashboard
      </h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>
        Revenue Cycle Management Overview
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <KPICard title="Expected Revenue" value="$128,400" change="+12%" positive />
        <KPICard title="At Risk" value="$22,300" change="-5%" />
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
function Patients() { return <PagePlaceholder title="Patients" subtitle="Patient demographics and management" />; }
function Appointments() { return <PagePlaceholder title="Appointments" subtitle="Schedule and manage patient appointments" />; }
function Eligibility() { return <PagePlaceholder title="Eligibility" subtitle="Insurance eligibility verification" />; }
function Coding() { return <PagePlaceholder title="Coding" subtitle="Medical coding and charge entry" />; }
function Claims() { return <PagePlaceholder title="Claims" subtitle="Claims management and tracking" />; }
function Payments() { return <PagePlaceholder title="Payments" subtitle="Payment posting and reconciliation" />; }
function Denials() { return <PagePlaceholder title="Denials" subtitle="Denial management and appeals" />; }
function Reports() { return <PagePlaceholder title="Reports" subtitle="Analytics and business intelligence" />; }

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
