// Insurance Eligibility Verification Component
// Based on ECW V12 - 270/271 Transaction Display

import React, { useState } from 'react';

/**
 * Eligibility Status Indicator ("I" Icon)
 * 
 * Status Colors:
 * - Green: Active Coverage (Verified)
 * - Red: Inactive/Terminated
 * - Yellow: Verification Pending/Error
 */
export function EligibilityIndicator({ patient, insurance, onVerify }) {
    const [showDialog, setShowDialog] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Determine status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return '#10b981'; // green
            case 'Inactive':
                return '#ef4444'; // red
            case 'Pending':
            default:
                return '#f59e0b'; // yellow
        }
    };

    const eligibilityStatus = insurance?.eligibility_status || 'Pending';
    const statusColor = getStatusColor(eligibilityStatus);

    const handleVerify = async () => {
        setIsVerifying(true);
        // Simulate API call to payer (270 Request)
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (onVerify) onVerify(patient.PatientID);
        setIsVerifying(false);
    };

    return (
        <>
            {/* "I" Icon Button */}
            <button
                onClick={() => setShowDialog(true)}
                title={`Insurance Eligibility: ${eligibilityStatus}`}
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${statusColor}`,
                    backgroundColor: statusColor,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                }}
            >
                I
            </button>

            {/* Eligibility Verification Dialog */}
            {showDialog && (
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
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        {/* Header */}
                        <div style={{ marginBottom: '24px', borderBottom: '2px solid #e3f2fd', paddingBottom: '16px' }}>
                            <h2 style={{ margin: 0, color: '#0004d0', fontSize: '24px' }}>
                                Insurance Eligibility Verification
                            </h2>
                            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                                270/271 Transaction Data
                            </p>
                        </div>

                        {/* Patient Info */}
                        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f7f9ff', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 'bold', color: '#0004d0', marginBottom: '8px' }}>
                                Patient: {patient.FirstName} {patient.LastName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Account No: {patient.AccountNo} | DOB: {patient.DOB}
                            </div>
                        </div>

                        {/* Eligibility Status */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                backgroundColor: statusColor + '15',
                                borderLeft: `4px solid ${statusColor}`,
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: statusColor,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}>
                                    I
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                                        Status: {eligibilityStatus}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                        Verified: {insurance?.verification_date || 'Not verified'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 271 Response Fields */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0004d0', marginBottom: '16px' }}>
                                Coverage Details (271 Response)
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Copay - Office Visit */}
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Copay - Office Visit
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0004d0' }}>
                                        ${insurance?.copay_ov?.toFixed(2) || '0.00'}
                                    </div>
                                </div>

                                {/* Copay - Specialist */}
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Copay - Specialist
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0004d0' }}>
                                        ${insurance?.copay_spec?.toFixed(2) || '0.00'}
                                    </div>
                                </div>

                                {/* Deductible - Individual */}
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Deductible - Individual
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                                        ${insurance?.deductible_indiv?.toFixed(2) || '0.00'}
                                    </div>
                                </div>

                                {/* Deductible - Family */}
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Deductible - Family
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                                        ${insurance?.deductible_family?.toFixed(2) || '0.00'}
                                    </div>
                                </div>

                                {/* Co-Insurance */}
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Co-Insurance %
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                                        {insurance?.coinsurance_pct || 80}%
                                    </div>
                                </div>

                                {/* Payer Name */}
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Payer Name
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        {insurance?.payer_name || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Subscriber ID */}
                            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff9c4', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                                <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>
                                    ! Subscriber ID (Must Match Exactly)
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace' }}>
                                    {insurance?.subscriber_no || 'Not provided'}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e3f2fd' }}>
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: isVerifying ? '#e3f2fd' : '#a941c6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: isVerifying ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify Now'}
                            </button>
                            <button
                                onClick={() => setShowDialog(false)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'white',
                                    color: '#64748b',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * Eligibility Management Panel
 * Full-page view for managing all patient eligibilities
 */
export function EligibilityManagement({ patients, insurances }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredPatients = patients.filter(p => {
        const matchesSearch =
            p.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.AccountNo.includes(searchTerm);

        const insurance = insurances.find(ins => ins.PatientID === p.PatientID);
        const matchesStatus = filterStatus === 'All' || insurance?.eligibility_status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 8px 0' }}>
                    Eligibility Verification
                </h1>
                <p style={{ color: '#64748b', margin: 0 }}>
                    Manage insurance eligibility verification for all patients
                </p>
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>

            {/* Patient List */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Patient</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Account No</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Payer</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Copay</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600', fontSize: '14px' }}>Last Verified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map(patient => {
                            const insurance = insurances.find(ins => ins.PatientID === patient.PatientID);
                            return (
                                <tr key={patient.PatientID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px' }}>
                                        <EligibilityIndicator patient={patient} insurance={insurance} />
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a' }}>
                                        {patient.FirstName} {patient.LastName}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        {patient.AccountNo}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        {insurance?.payer_name || 'N/A'}
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#0004d0' }}>
                                        ${insurance?.copay_ov?.toFixed(2) || '0.00'}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
                                        {insurance?.verification_date || 'Never'}
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
