// Simple Test Version of App to Check for Errors
import React, { useState } from 'react';
import { authService } from './lib/auth';
import mockData from './lib/mockData';

console.log('=== APP LOADING ===');
console.log('Mock Data:', mockData);
console.log('Patients:', mockData.patients);
console.log('Claims:', mockData.claims);

function TestApp() {
    console.log('TestApp rendering');

    const [user, setUser] = useState({
        email: 'test@test.com',
        name: 'Test User',
        role: 'admin'
    });

    const [currentPage, setCurrentPage] = useState('dashboard');

    if (!user) {
        return <div style={{ padding: '20px' }}>
            <h1>Login Test</h1>
            <button onClick={() => setUser({ email: 'demo@rcmbilling.com', name: 'Demo User', role: 'admin' })}>
                Login as Demo
            </button>
        </div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>RCM App - Test Mode</h1>
            <p>User: {user.name} ({user.email})</p>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <button onClick={() => setCurrentPage('dashboard')} style={{ margin: '5px', padding: '10px' }}>Dashboard</button>
                <button onClick={() => setCurrentPage('patients')} style={{ margin: '5px', padding: '10px' }}>Patients</button>
                <button onClick={() => setCurrentPage('claims')} style={{ margin: '5px', padding: '10px' }}>Claims</button>
            </div>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <h2>Current Page: {currentPage}</h2>

                {currentPage === 'dashboard' && <DashboardTest />}
                {currentPage === 'patients' && <PatientsTest />}
                {currentPage === 'claims' && <ClaimsTest />}
            </div>
        </div>
    );
}

function DashboardTest() {
    return <div>
        <h3>✅ Dashboard Loaded</h3>
        <p>Stats:</p>
        <ul>
            <li>Total Patients: {mockData.patients.length}</li>
            <li>Total Claims: {mockData.claims.length}</li>
            <li>Total Providers: {mockData.providers.length}</li>
        </ul>
    </div>;
}

function PatientsTest() {
    console.log('PatientsTest rendering');
    const { patients, insurances } = mockData;

    return <div>
        <h3>✅ Patients Module Loaded</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Account #</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>DOB</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Insurance</th>
                </tr>
            </thead>
            <tbody>
                {patients.map(patient => {
                    const insurance = insurances.find(ins => ins.PatientID === patient.PatientID);
                    return (
                        <tr key={patient.PatientID} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{patient.AccountNo}</td>
                            <td style={{ padding: '10px' }}>{patient.FirstName} {patient.LastName}</td>
                            <td style={{ padding: '10px' }}>{patient.DOB}</td>
                            <td style={{ padding: '10px' }}>{insurance?.InsuranceName || 'None'}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>;
}

function ClaimsTest() {
    console.log('ClaimsTest rendering');
    const { claims, patients } = mockData;

    return <div>
        <h3>✅ Claims Module Loaded</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Claim #</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Patient</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                </tr>
            </thead>
            <tbody>
                {claims.map(claim => {
                    const patient = patients.find(p => p.PatientID === claim.PatientID);
                    return (
                        <tr key={claim.InvoiceID} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{claim.ClaimNumber}</td>
                            <td style={{ padding: '10px' }}>{patient?.FirstName} {patient?.LastName}</td>
                            <td style={{ padding: '10px' }}>${claim.TotalCharges.toFixed(2)}</td>
                            <td style={{ padding: '10px' }}>{claim.ClaimStatus}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>;
}

export default TestApp;
