// Enhanced Referral Dialog with Eligibility Integration
// Adds eligibility verification check before creating referral

import React, { useState } from 'react';

export function NewReferralDialog({ patients, providers, eligibilityData = [], onClose, onSave }) {
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

    // Get eligibility for selected patient
    const selectedPatient = patients.find(p => p.PatientID === formData.patient_id);
    const eligibility = eligibilityData.find(e => e.patient_id === formData.patient_id);


    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return { bg: '#d1fae5', text: '#065f46', icon: '●' };
            case 'Inactive': return { bg: '#fee2e2', text: '#991b1b', icon: '○' };
            default: return { bg: '#fef3c7', text: '#92400e', icon: '◔' };
        }
    };

    const eligibilityColor = eligibility ? getStatusColor(eligibility.eligibility_status) : null;

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

                    {/* Eligibility Status Alert */}
                    {selectedPatient && eligibility && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '16px',
                            backgroundColor: eligibilityColor.bg,
                            border: `2px solid ${eligibilityColor.text}`,
                            borderRadius: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{eligibilityColor.icon}</span>
                                <div>
                                    <div style={{ fontWeight: '600', color: eligibilityColor.text }}>
                                        Insurance Eligibility: {eligibility.eligibility_status}
                                    </div>
                                    <div style={{ fontSize: '13px', color: eligibility Color.text }}>
                                        Verified: {eligibility.verification_date} • Payer: {eligibility.payer_name}
                                    </div>
                                </div>
                            </div>

                            {eligibility.eligibility_status === 'Active' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: `1px solid ${eligibilityColor.text}` }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: eligibilityColor.text, opacity: 0.8 }}>Specialist Copay</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: eligibilityColor.text }}>
                                            ${eligibility.copay_spec?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: eligibilityColor.text, opacity: 0.8 }}>Coinsurance</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: eligibilityColor.text }}>
                                            {eligibility.coinsurance_pct}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            {eligibility.eligibility_status !== 'Active' && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    color: eligibilityColor.text,
                                    fontWeight: '600'
                                }}>
                                    ! WARNING: Patient does not have active coverage. Referral may be denied.
                                </div>
                            )}
                        </div>
                    )}

                    {selectedPatient && !eligibility && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '16px',
                            backgroundColor: '#fef3c7',
                            border: '2px solid #f59e0b',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                                ! No Eligibility Data Found
                            </div>
                            <div style={{ fontSize: '13px', color: '#92400e' }}>
                                Run eligibility verification before creating this referral.
                            </div>
                        </div>
                    )}

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
                            disabled={eligibility && eligibility.eligibility_status !== 'Active'}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: (eligibility && eligibility.eligibility_status !== 'Active') ? '#cbd5e1' : '#a941c6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: (eligibility && eligibility.eligibility_status !== 'Active') ? 'not-allowed' : 'pointer',
                                opacity: (eligibility && eligibility.eligibility_status !== 'Active') ? 0.5 : 1
                            }}
                        >
                            {(eligibility && eligibility.eligibility_status !== 'Active') ? '! Cannot Create (Inactive Coverage)' : 'Save Referral'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
