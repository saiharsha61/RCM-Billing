// Prior Authorization Management Components
// Scenario A: Referral Management (Gatekeeper Plans)
// Scenario B: Service Authorization (High-Cost Procedures)
// Integrated with Eligibility Verification (270/271)

import React, { useState } from 'react';
import { EligibilityIndicator } from './EligibilityCheck';
import { NotesPanel } from './NotesPanel';
import { BenefitBreakdown } from './BenefitBreakdown';

/**
 * SCENARIO A: REFERRAL MANAGEMENT
 * For HMO/Gatekeeper Plans - PCP sends patient to Specialist
 */
export function ReferralManagement({ patients, referrals, providers, eligibilityData = [] }) {
    const [showNewReferral, setShowNewReferral] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Filter referrals
    const filteredReferrals = referrals.filter(ref => {
        const patient = patients.find(p => p.PatientID === ref.patient_id);
        const matchesSearch = patient ?
            patient.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.LastName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const matchesStatus = filterStatus === 'All' || ref.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 8px 0' }}>
                        Referral Management
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Manage outgoing referrals to specialists (Gatekeeper Plans)
                    </p>
                </div>
                <button
                    onClick={() => setShowNewReferral(true)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#a941c6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ➕ New Outgoing Referral
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #e3f2fd',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        border: '1px solid #e3f2fd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        minWidth: '150px'
                    }}
                >
                    <option value="All">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Denied">Denied</option>
                    <option value="Expired">Expired</option>
                </select>
            </div>

            {/* Referrals List */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Patient</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Refer To</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Diagnosis</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Auth No</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Visits</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Expires</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReferrals.map(referral => {
                            const patient = patients.find(p => p.PatientID === referral.patient_id);
                            const visitsRemaining = referral.num_visits - referral.visits_used;

                            return (
                                <tr key={referral.referral_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a' }}>
                                        {patient ? `${patient.FirstName} ${patient.LastName}` : 'Unknown'}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        <div style={{ fontWeight: '500', color: '#0f172a' }}>{referral.refer_to_name}</div>
                                        <div style={{ fontSize: '13px' }}>{referral.refer_to_specialty}</div>
                                    </td>
                                    <td style={{ padding: '16px', fontFamily: 'monospace', color: '#64748b' }}>
                                        <div style={{ fontWeight: '600', color: '#0004d0' }}>{referral.diagnosis_code}</div>
                                        <div style={{ fontSize: '13px' }}>{referral.diagnosis_description}</div>
                                    </td>
                                    <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: '600', color: '#a941c6' }}>
                                        {referral.authorization_no}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            backgroundColor: visitsRemaining > 0 ? '#d1fae5' : '#fee2e2',
                                            color: visitsRemaining > 0 ? '#065f46' : '#991b1b',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {visitsRemaining} of {referral.num_visits}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                                        {referral.expiration_date}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor:
                                                referral.status === 'Approved' ? '#d1fae5' :
                                                    referral.status === 'Pending' ? '#fef3c7' :
                                                        referral.status === 'Denied' ? '#fee2e2' : '#f1f5f9',
                                            color:
                                                referral.status === 'Approved' ? '#065f46' :
                                                    referral.status === 'Pending' ? '#92400e' :
                                                        referral.status === 'Denied' ? '#991b1b' : '#64748b',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {referral.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* New Referral Dialog */}
            {showNewReferral && (
                <NewReferralDialog
                    patients={patients}
                    providers={providers}
                    onClose={() => setShowNewReferral(false)}
                    onSave={(data) => {
                        console.log('New referral:', data);
                        setShowNewReferral(false);
                    }}
                />
            )}
        </div>
    );
}

/**
 * New Referral Dialog
 */
function NewReferralDialog({ patients, providers, onClose, onSave }) {
    const [formData, setFormData] = useState({
        patient_id: '',
        refer_to_npi: '',
        refer_to_name: '',
        diagnosis_code: '',
        diagnosis_description: '',
        authorization_no: '',
        num_visits: 1,
        referral_date: new Date().toISOString().split('T')[0],
        expiration_date: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleProviderSelect = (e) => {
        const provider = providers.find(p => p.NPI === e.target.value);
        if (provider) {
            setFormData({
                ...formData,
                refer_to_npi: provider.NPI,
                refer_to_name: `Dr. ${provider.FirstName} ${provider.LastName}, ${provider.Credentials}`
            });
        }
    };

    return (
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
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{ margin: '0 0 24px 0', color: '#0004d0', fontSize: '24px' }}>
                    New Outgoing Referral
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Patient Selection */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                            Patient *
                        </label>
                        <select
                            required
                            value={formData.patient_id}
                            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e3f2fd',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select Patient...</option>
                            {patients.map(p => (
                                <option key={p.PatientID} value={p.PatientID}>
                                    {p.LastName}, {p.FirstName} - {p.AccountNo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Refer To (Specialist) */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                            Refer To (Specialist) *
                        </label>
                        <select
                            required
                            onChange={handleProviderSelect}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e3f2fd',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select Specialist...</option>
                            {providers.map(p => (
                                <option key={p.NPI} value={p.NPI}>
                                    Dr. {p.FirstName} {p.LastName}, {p.Credentials} - {p.SpecialtyType}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Diagnosis Code */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                            Diagnosis Code (ICD-10) *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., M54.5"
                            value={formData.diagnosis_code}
                            onChange={(e) => setFormData({ ...formData, diagnosis_code: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e3f2fd',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Diagnosis Description */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                            Diagnosis Description
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Low back pain"
                            value={formData.diagnosis_description}
                            onChange={(e) => setFormData({ ...formData, diagnosis_description: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e3f2fd',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Authorization Number - CRITICAL */}
                    <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fff9c4', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#92400e' }}>
                            ! Authorization Number (Box 23) *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., AUTH123456"
                            value={formData.authorization_no}
                            onChange={(e) => setFormData({ ...formData, authorization_no: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #f59e0b',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                                fontWeight: '600'
                            }}
                        />
                        <p style={{ fontSize: '12px', color: '#92400e', margin: '8px 0 0 0' }}>
                            This number will appear on the claim (Box 23). Must match payer records exactly.
                        </p>
                    </div>

                    {/* Number of Visits */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                            Number of Visits Authorized *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.num_visits}
                            onChange={(e) => setFormData({ ...formData, num_visits: parseInt(e.target.value) })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e3f2fd',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Referral Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.referral_date}
                                onChange={(e) => setFormData({ ...formData, referral_date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Expiration Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.expiration_date}
                                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'white',
                                color: '#64748b',
                                border: '1px solid #e3f2fd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#a941c6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Save Referral
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * SCENARIO B: SERVICE AUTHORIZATION
 * For High-Cost Procedures (MRI, CT, Surgery, etc.)
 */
export function ServiceAuthorization({ patients, serviceAuths, eligibilityData = [] }) {
    const [showNewAuth, setShowNewAuth] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredAuths = serviceAuths.filter(auth => {
        const patient = patients.find(p => p.PatientID === auth.patient_id);
        const matchesSearch = patient ?
            patient.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            auth.authorization_no.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const matchesStatus = filterStatus === 'All' || auth.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 8px 0' }}>
                        Service Authorization
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Manage prior authorizations for high-cost procedures
                    </p>
                </div>
                <button
                    onClick={() => setShowNewAuth(true)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#a941c6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ➕ New Authorization
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search patients or auth #..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #e3f2fd',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        border: '1px solid #e3f2fd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        minWidth: '150px'
                    }}
                >
                    <option value="All">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Denied">Denied</option>
                </select>
            </div>

            {/* Service Auth List */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Patient</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Type</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Procedure</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Payer</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Auth Number</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Valid Dates</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAuths.map(auth => {
                            const patient = patients.find(p => p.PatientID === auth.patient_id);

                            return (
                                <tr key={auth.auth_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a' }}>
                                        {patient ? `${patient.FirstName} ${patient.LastName}` : 'Unknown'}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor: '#e3f2fd',
                                            color: '#0004d0',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {auth.auth_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontFamily: 'monospace', color: '#64748b' }}>
                                        <div style={{ fontWeight: '600', color: '#0004d0' }}>{auth.procedure_code}</div>
                                        <div style={{ fontSize: '13px' }}>{auth.procedure_description}</div>
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                                        {auth.payer}
                                    </td>
                                    <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: '600', color: '#a941c6' }}>
                                        {auth.authorization_no}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                                        <div>{auth.start_date}</div>
                                        <div>to {auth.end_date}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor:
                                                auth.status === 'Approved' ? '#d1fae5' :
                                                    auth.status === 'Pending' ? '#fef3c7' :
                                                        '#fee2e2',
                                            color:
                                                auth.status === 'Approved' ? '#065f46' :
                                                    auth.status === 'Pending' ? '#92400e' :
                                                        '#991b1b',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {auth.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* New Auth Dialog */}
            {showNewAuth && (
                <NewServiceAuthDialog
                    patients={patients}
                    onClose={() => setShowNewAuth(false)}
                    onSave={(data) => {
                        console.log('New service auth:', data);
                        setShowNewAuth(false);
                    }}
                />
            )}
        </div>
    );
}

/**
 * New Service Authorization Dialog
 */
function NewServiceAuthDialog({ patients, onClose, onSave }) {
    const [formData, setFormData] = useState({
        patient_id: '',
        auth_type: 'Medical Care',
        payer: '',
        procedure_code: '',
        procedure_description: '',
        units_approved: 1,
        authorization_no: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
        // INFINX Enhanced Data Capture
        facility_name: '',
        facility_npi: '',
        facility_tin: '',
        servicing_provider_name: '',
        servicing_provider_npi: '',
        servicing_provider_tin: '',
        ordering_provider_name: '',
        ordering_provider_npi: '',
        ordering_provider_tin: '',
        ordering_provider_fax: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
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
            {/* Two-column layout: Form + Notes Panel */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '0',
                maxWidth: '1200px',
                width: '95%',
                maxHeight: '95vh',
                display: 'flex',
                overflow: 'hidden'
            }}>
                {/* Main Form Column */}
                <div style={{
                    flex: '1 1 70%',
                    padding: '32px',
                    overflowY: 'auto',
                    maxHeight: '95vh'
                }}>
                    <h2 style={{ margin: '0 0 24px 0', color: '#0004d0', fontSize: '24px' }}>
                        New Service Authorization
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Patient Selection */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Patient *
                            </label>
                            <select
                                required
                                value={formData.patient_id}
                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">Select Patient...</option>
                                {patients.map(p => (
                                    <option key={p.PatientID} value={p.PatientID}>
                                        {p.LastName}, {p.FirstName} - {p.AccountNo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Benefit Breakdown - Show when patient selected */}
                        {formData.patient_id && (
                            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <BenefitBreakdown
                                    patientId={formData.patient_id}
                                    patients={patients}
                                />
                            </div>
                        )}

                        {/* Authorization Type */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Authorization Type *
                            </label>
                            <select
                                value={formData.auth_type}
                                onChange={(e) => setFormData({ ...formData, auth_type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="Medical Care">Medical Care</option>
                                <option value="Surgical">Surgical</option>
                                <option value="Diagnostic">Diagnostic</option>
                            </select>
                        </div>

                        {/* Payer */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Payer *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Medicare of Texas"
                                value={formData.payer}
                                onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Procedure Code */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Procedure Code (CPT) *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., 70553"
                                value={formData.procedure_code}
                                onChange={(e) => setFormData({ ...formData, procedure_code: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>

                        {/* Procedure Description */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Procedure Description
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., MRI Brain with contrast"
                                value={formData.procedure_description}
                                onChange={(e) => setFormData({ ...formData, procedure_description: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* INFINX Facility Information */}
                        <div style={{ marginTop: '32px', marginBottom: '24px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                                Facility Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                        Facility Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., South Carolina Coastal Medical Center"
                                        value={formData.facility_name}
                                        onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e3f2fd',
                                            borderRadius: '8px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                        Facility NPI
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 1205605409"
                                        value={formData.facility_npi}
                                        onChange={(e) => setFormData({ ...formData, facility_npi: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e3f2fd',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                        Facility TIN (Tax ID) *
                                        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#64748b', marginLeft: '4px' }}>
                                            (Required for claims)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="XX-XXXXXXX (9 digits)"
                                        value={formData.facility_tin}
                                        onChange={(e) => setFormData({ ...formData, facility_tin: e.target.value })}
                                        pattern="[0-9]{2}-[0-9]{7}"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #a941c6',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'monospace',
                                            backgroundColor: '#faf5ff'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* INFINX Provider Information */}
                        <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                                Provider Information
                            </h3>

                            {/* Servicing Provider */}
                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '12px' }}>
                                    Servicing Provider
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                            Provider Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Dr. Johnson"
                                            value={formData.servicing_provider_name}
                                            onChange={(e) => setFormData({ ...formData, servicing_provider_name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1fae5',
                                                borderRadius: '6px',
                                                fontSize: '13px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                            NPI
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1234567890"
                                            value={formData.servicing_provider_npi}
                                            onChange={(e) => setFormData({ ...formData, servicing_provider_npi: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1fae5',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                            TIN (Tax ID)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="XX-XXXXXXX"
                                            value={formData.servicing_provider_tin}
                                            onChange={(e) => setFormData({ ...formData, servicing_provider_tin: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1fae5',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ordering Provider */}
                            <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>
                                    Ordering Provider
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                            Provider Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Dr. Smith"
                                            value={formData.ordering_provider_name}
                                            onChange={(e) => setFormData({ ...formData, ordering_provider_name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #dbeafe',
                                                borderRadius: '6px',
                                                fontSize: '13px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                            NPI
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="0987654321"
                                            value={formData.ordering_provider_npi}
                                            onChange={(e) => setFormData({ ...formData, ordering_provider_npi: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #dbeafe',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                            TIN (Tax ID)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="XX-XXXXXXX"
                                            value={formData.ordering_provider_tin}
                                            onChange={(e) => setFormData({ ...formData, ordering_provider_tin: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #dbeafe',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                            Fax Number
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            value={formData.ordering_provider_fax}
                                            onChange={(e) => setFormData({ ...formData, ordering_provider_fax: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #dbeafe',
                                                borderRadius: '6px',
                                                fontSize: '13px'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Authorization Number - CRITICAL */}
                        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fff9c4', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#92400e' }}>
                                ! Authorization Number (Box 23) *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., MRIAUTH2025"
                                value={formData.authorization_no}
                                onChange={(e) => setFormData({ ...formData, authorization_no: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #f59e0b',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    fontWeight: '600'
                                }}
                            />
                        </div>

                        {/* Units */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Units Approved *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.units_approved}
                                onChange={(e) => setFormData({ ...formData, units_approved: parseInt(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Dates */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e3f2fd',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #e3f2fd',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                placeholder="Additional notes..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'white',
                                    color: '#64748b',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#a941c6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Authorization
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notes Panel Column */}
                <div style={{
                    flex: '0 0 350px',
                    borderLeft: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    padding: '20px',
                    overflowY: 'auto',
                    maxHeight: '95vh'
                }}>
                    <NotesPanel
                        relatedToId={formData.patient_id || 'new-service-auth'}
                        relatedToType="service_authorization"
                        currentUser={{ name: 'Current User' }}
                    />
                </div>
            </div>
        </div>
    );
}
