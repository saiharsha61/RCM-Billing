// ECW Patient Hub Module
// Based on Screenshot 3: Patient Hub Interface

import React, { useState } from 'react';
import mockData from '../lib/mockData';
import { calculateAge } from '../lib/validation';
import { maskSSN, maskPhone, maskEmail } from '../lib/encryption';

export function PatientHub({ patient }) {
    const [activeSection, setActiveSection] = useState('overview');

    if (!patient) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>No Patient Selected</h2>
                <p style={{ color: 'var(--ecw-text-secondary)' }}>Please select a patient to view their information</p>
            </div>
        );
    }

    const insurance = mockData.insurances.find(ins => ins.PatientID === patient.PatientID);
    const provider = mockData.providers.find(p => p.ProviderID === patient.UsualProvider);

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Left Panel - Billing & Appointments */}
            <div style={{ width: '280px', backgroundColor: 'white', padding: '16px', borderRight: '1px solid var(--ecw-border)', overflowY: 'auto' }}>
                <BillingPanel patient={patient} insurance={insurance} />
                <AppointmentsPanel patient={patient} />
            </div>

            {/* Center Panel - Patient Info & Quick Actions */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                <PatientInfoCard patient={patient} insurance={insurance} provider={provider} />
                <QuickActionsGrid />
                <StructuredDataPanel patient={patient} />
                <ClinicalSectionsPanel patient={patient} />
            </div>
        </div>
    );
}

// ============================================================================
// BILLING PANEL (Left Sidebar)
// ============================================================================
function BillingPanel({ patient, insurance }) {
    return (
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--ecw-text-primary)' }}>
                Billing
            </h3>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ecw-text-secondary)' }}>Patient Balance</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ecw-success)' }}>
                        ${insurance?.PatientBalance || '0.00'}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ecw-text-secondary)' }}>Copay/Co-Insurance</span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        ${insurance?.Copay || '0.00'}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ecw-text-secondary)' }}>Collection Status</span>
                    <span className="ecw-badge ecw-badge-success" style={{ fontSize: '10px' }}>
                        Current
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="ecw-btn ecw-btn-primary ecw-btn-sm" style={{ width: '100%' }}>
                    + Add Card
                </button>
                <button className="ecw-btn ecw-btn-secondary ecw-btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    Guarantor Balance
                </button>
                <button className="ecw-btn ecw-btn-secondary ecw-btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    Billing Logs
                </button>
            </div>

            <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--ecw-text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Account Inquiry
                </label>
                <select className="ecw-select ecw-select-sm" style={{ width: '100%', fontSize: '12px' }}>
                    <option>Select...</option>
                    <option>View Balance</option>
                    <option>Payment History</option>
                    <option>Statements</option>
                </select>
            </div>
        </div>
    );
}

// ============================================================================
// APPOINTMENTS PANEL (Left Sidebar)
// ============================================================================
function AppointmentsPanel({ patient }) {
    const nextAppt = {
        date: '12/04/2025',
        time: '12:30 PM CST',
        location: 'VSR'
    };

    return (
        <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Appointments
            </h3>

            {nextAppt && (
                <div style={{ backgroundColor: 'var(--ecw-light-blue)', padding: '12px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--ecw-primary-blue)' }}>
                        Next Appointment
                    </div>
                    <div style={{ color: 'var(--ecw-text-primary)' }}>
                        {nextAppt.date} {nextAppt.time}
                    </div>
                    <div style={{ color: 'var(--ecw-text-secondary)', fontSize: '11px' }}>
                        at {nextAppt.location}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--ecw-text-secondary)', marginBottom: '4px' }}>
                    Multifield Appt:
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    NONE
                </div>
            </div>

            <button className="ecw-btn ecw-btn-primary ecw-btn-sm" style={{ width: '100%' }}>
                + New Appointment
            </button>
        </div>
    );
}

// ============================================================================
// PATIENT INFO CARD
// ============================================================================
function PatientInfoCard({ patient, insurance, provider }) {
    return (
        <div className="ecw-card" style={{ marginBottom: '16px' }}>
            <div className="ecw-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                    <div>
                        <div style={{ color: 'var(--ecw-text-secondary)', fontSize: '11px', marginBottom: '4px' }}>Address</div>
                        <div>{patient.Address1}</div>
                        {patient.Address2 && <div>{patient.Address2}</div>}
                        <div>{patient.City}, {patient.State} {patient.ZipCode}</div>
                    </div>

                    <div>
                        <div style={{ color: 'var(--ecw-text-secondary)', fontSize: '11px', marginBottom: '4px' }}>Contact</div>
                        <div>📞 {maskPhone(patient.Phone)}</div>
                        <div>{maskEmail(patient.Email)}</div>
                        <div>🏥 {insurance?.InsuranceName || 'Self Pay'}</div>
                    </div>

                    {provider && (
                        <div>
                            <div style={{ color: 'var(--ecw-text-secondary)', fontSize: '11px', marginBottom: '4px' }}>Rendering Provider</div>
                            <div style={{ fontWeight: '600' }}>
                                {provider.FirstName} {provider.LastName}, {provider.Credentials}
                            </div>
                        </div>
                    )}

                    <div>
                        <div style={{ color: 'var(--ecw-text-secondary)', fontSize: '11px', marginBottom: '4px' }}>Advanced Directives</div>
                        <div>
                            <span className="ecw-badge ecw-badge-info">On File</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// QUICK ACTIONS GRID (8 Circular Buttons)
// ============================================================================
function QuickActionsGrid() {
    const actions = [
        { id: 'photos', icon: '📷', label: 'Photos' },
        { id: 'labs', icon: '🧪', label: 'Labs' },
        { id: 'di', icon: '🔬', label: 'D/I' },
        { id: 'referrals', icon: '👨‍⚕️', label: 'Referrals' },
        { id: 'actions', icon: '⚡', label: 'Actions' },
        { id: 'tel-enc', icon: '📞', label: 'Tel Enc' },
        { id: 'web-enc', icon: '🌐', label: 'Web Enc' },
        { id: 'docs', icon: '📄', label: 'Docs' },
        { id: 'p2p', icon: '🔄', label: 'P2P' },
    ];

    return (
        <div className="ecw-card" style={{ marginBottom: '16px' }}>
            <div className="ecw-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {actions.map(action => (
                        <div key={action.id} className="ecw-quick-action">
                            <div className="ecw-quick-action-icon">
                                {action.icon}
                            </div>
                            <div className="ecw-quick-action-label">{action.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// STRUCTURED DATA PANEL
// ============================================================================
function StructuredDataPanel({ patient }) {
    const [structuredData, setStructuredData] = useState({
        veteran: patient.IsVeteran || false,
        seasonal: patient.IsSeasonal || false,
        migrant: patient.IsMigrant || false,
        homeless: patient.IsHomeless || false,
        limitedEnglish: patient.LimitedEnglishProficiency || false,
        publicHousing: patient.PublicHousing || false
    });

    return (
        <div className="ecw-card" style={{ marginBottom: '16px' }}>
            <div className="ecw-card-header">Structured Data</div>
            <div className="ecw-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <label className="ecw-checkbox">
                        <input
                            type="checkbox"
                            checked={structuredData.veteran}
                            onChange={(e) => setStructuredData({ ...structuredData, veteran: e.target.checked })}
                        />
                        <span>Veteran</span>
                    </label>

                    <label className="ecw-checkbox">
                        <input
                            type="checkbox"
                            checked={structuredData.seasonal}
                            onChange={(e) => setStructuredData({ ...structuredData, seasonal: e.target.checked })}
                        />
                        <span>Seasonal</span>
                    </label>

                    <label className="ecw-checkbox">
                        <input
                            type="checkbox"
                            checked={structuredData.migrant}
                            onChange={(e) => setStructuredData({ ...structuredData, migrant: e.target.checked })}
                        />
                        <span>Migrant</span>
                    </label>

                    <label className="ecw-checkbox">
                        <input
                            type="checkbox"
                            checked={structuredData.homeless}
                            onChange={(e) => setStructuredData({ ...structuredData, homeless: e.target.checked })}
                        />
                        <span>Homeless</span>
                    </label>

                    <label className="ecw-checkbox">
                        <input
                            type="checkbox"
                            checked={structuredData.limitedEnglish}
                            onChange={(e) => setStructuredData({ ...structuredData, limitedEnglish: e.target.checked })}
                        />
                        <span>Limited English Proficiency</span>
                    </label>

                    <label className="ecw-checkbox">
                        <input
                            type="checkbox"
                            checked={structuredData.publicHousing}
                            onChange={(e) => setStructuredData({ ...structuredData, publicHousing: e.target.checked })}
                        />
                        <span>Public Housing</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// CLINICAL SECTIONS PANEL
// ============================================================================
function ClinicalSectionsPanel({ patient }) {
    const sections = [
        { label: 'Progress Notes', dropdown: true },
        { label: 'Medical Summary', dropdown: true },
        { label: 'Medical Record', dropdown: false },
        { label: 'Problem List', dropdown: true },
        { label: 'Consult Notes', dropdown: false },
        { label: 'Flowsheets', dropdown: true },
        { label: 'Devices', dropdown: false },
        { label: 'Print Labels', dropdown: true },
        { label: 'Messenger', dropdown: true },
    ];

    return (
        <div className="ecw-card">
            <div className="ecw-card-header">Clinical Information</div>
            <div className="ecw-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {sections.map((section, idx) => (
                        <div key={idx}>
                            {section.dropdown ? (
                                <select className="ecw-select" style={{ width: '100%' }}>
                                    <option>{section.label}</option>
                                    <option>View All</option>
                                    <option>Add New</option>
                                </select>
                            ) : (
                                <button className="ecw-btn ecw-btn-secondary ecw-btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    {section.label}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Placeholder components for other modules
export function Scheduler() {
    return <div className="ecw-p-lg"><h2>Scheduler Module</h2><p>Calendar view coming soon...</p></div>;
}

export function ClaimsManagement() {
    return <div className="ecw-p-lg"><h2>Claims Management Module</h2><p>Claims list coming soon...</p></div>;
}

export function ProgressNotes() {
    return <div className="ecw-p-lg"><h2>Progress Notes Module</h2><p>SOAP notes coming soon...</p></div>;
}

export function AdminModule() {
    return <div className="ecw-p-lg"><h2>Administration Module</h2><p>Admin settings coming soon...</p></div>;
}
