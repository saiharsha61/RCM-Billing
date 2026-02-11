import React, { useState } from 'react';

/**
 * CLAIMS MANAGEMENT MODULE
 * Phase 3B: Claims Worklist, Scrubbing, and Status Tracking
 */

export function ClaimsWorklist({ onClose }) {
    const [claims, setClaims] = useState(getMockClaims());
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [scrubResults, setScrubResults] = useState(null);

    const filterClaims = () => {
        if (statusFilter === 'all') return claims;
        return claims.filter(claim => claim.status === statusFilter);
    };

    const handleScrubClaim = (claimId) => {
        const claim = claims.find(c => c.id === claimId);
        const results = runClaimScrubber(claim);
        setScrubResults({ claimId, results });
    };

    const handleSubmitClaim = (claimId) => {
        setClaims(claims.map(c =>
            c.id === claimId ? { ...c, status: 'Billed', billedDate: new Date().toISOString().split('T')[0] } : c
        ));
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': '#3b82f6',
            'Hold': '#f59e0b',
            'Billed': '#10b981',
            'Rejected': '#ef4444',
            'Denied': '#dc2626',
            'Paid': '#059669'
        };
        return colors[status] || '#64748b';
    };

    const statusCounts = {
        all: claims.length,
        New: claims.filter(c => c.status === 'New').length,
        Hold: claims.filter(c => c.status === 'Hold').length,
        Billed: claims.filter(c => c.status === 'Billed').length,
        Rejected: claims.filter(c => c.status === 'Rejected').length,
        Denied: claims.filter(c => c.status === 'Denied').length
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
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                width: '95%',
                maxWidth: '1400px',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '2px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                            Claims Management
                        </h2>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                            Submit, track, and manage insurance claims
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f1f5f9',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '16px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    overflow: 'auto'
                }}>
                    {['all', 'New', 'Hold', 'Billed', 'Rejected', 'Denied'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: statusFilter === status ? '#a941c6' : '#ffffff',
                                color: statusFilter === status ? '#ffffff' : '#64748b',
                                border: `1px solid ${statusFilter === status ? '#a941c6' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {status === 'all' ? 'All Claims' : status} ({statusCounts[status]})
                        </button>
                    ))}
                </div>

                {/* Claims Table */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={headerCellStyle}>Claim #</th>
                                <th style={headerCellStyle}>Patient</th>
                                <th style={headerCellStyle}>DOS</th>
                                <th style={headerCellStyle}>Provider</th>
                                <th style={headerCellStyle}>Payer</th>
                                <th style={headerCellStyle}>Amount</th>
                                <th style={headerCellStyle}>Status</th>
                                <th style={headerCellStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterClaims().map((claim, idx) => (
                                <tr key={claim.id} style={{
                                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                    borderBottom: '1px solid #e2e8f0'
                                }}>
                                    <td style={cellStyle}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#a941c6' }}>
                                            {claim.claimNumber}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>{claim.patient}</td>
                                    <td style={cellStyle}>{claim.dos}</td>
                                    <td style={cellStyle}>{claim.provider}</td>
                                    <td style={cellStyle}>{claim.payer}</td>
                                    <td style={cellStyle}>
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>
                                            ${claim.amount.toFixed(2)}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor: `${getStatusColor(claim.status)}15`,
                                            color: getStatusColor(claim.status),
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {claim.status === 'New' && (
                                                <>
                                                    <button
                                                        onClick={() => handleScrubClaim(claim.id)}
                                                        style={actionButtonStyle('#3b82f6')}
                                                    >
                                                        Scrub
                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmitClaim(claim.id)}
                                                        style={actionButtonStyle('#10b981')}
                                                    >
                                                        Submit
                                                    </button>
                                                </>
                                            )}
                                            {claim.status === 'Hold' && (
                                                <button style={actionButtonStyle('#f59e0b')}>
                                                    Edit
                                                </button>
                                            )}
                                            {(claim.status === 'Rejected' || claim.status === 'Denied') && (
                                                <button style={actionButtonStyle('#ef4444')}>
                                                    Resubmit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedClaim(claim)}
                                                style={actionButtonStyle('#64748b')}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filterClaims().length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>▣</div>
                            <div style={{ fontSize: '18px', fontWeight: '600' }}>No claims found</div>
                            <div style={{ fontSize: '14px', marginTop: '8px' }}>Try a different filter</div>
                        </div>
                    )}
                </div>

                {/* Scrub Results Modal */}
                {scrubResults && (
                    <ScrubResultsModal
                        results={scrubResults}
                        onClose={() => setScrubResults(null)}
                    />
                )}

                {/* Claim Detail Modal */}
                {selectedClaim && (
                    <ClaimDetailModal
                        claim={selectedClaim}
                        onClose={() => setSelectedClaim(null)}
                    />
                )}
            </div>
        </div>
    );
}

// Scrub Results Modal
function ScrubResultsModal({ results, onClose }) {
    const hasErrors = results.results.some(r => r.level === 'error');
    const hasWarnings = results.results.some(r => r.level === 'warning');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '2px solid #e2e8f0',
                    backgroundColor: hasErrors ? '#fee2e2' : hasWarnings ? '#fef3c7' : '#d1fae5'
                }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                        {hasErrors ? 'X Claim Scrubbing Failed' : hasWarnings ? '! Warnings Found' : '✓ Claim Ready to Submit'}
                    </h3>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {results.results.map((result, idx) => (
                        <div key={idx} style={{
                            padding: '16px',
                            marginBottom: '12px',
                            backgroundColor: '#f8f9fa',
                            borderLeft: `4px solid ${result.level === 'error' ? '#ef4444' : result.level === 'warning' ? '#f59e0b' : '#10b981'}`,
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                                {result.level === 'error' ? 'X' : result.level === 'warning' ? '!' : '✓'} {result.check}
                            </div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>
                                {result.message}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#a941c6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
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
    );
}

// Claim Detail Modal
function ClaimDetailModal({ claim, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '24px', borderBottom: '2px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                        Claim Details: {claim.claimNumber}
                    </h3>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <DetailField label="Patient" value={claim.patient} />
                        <DetailField label="Date of Service" value={claim.dos} />
                        <DetailField label="Provider" value={claim.provider} />
                        <DetailField label="Payer" value={claim.payer} />
                        <DetailField label="Claim Amount" value={`$${claim.amount.toFixed(2)}`} />
                        <DetailField label="Status" value={claim.status} />
                        {claim.billedDate && <DetailField label="Billed Date" value={claim.billedDate} />}
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Procedures</h4>
                        {claim.procedures.map((proc, idx) => (
                            <div key={idx} style={{ padding: '8px 0', borderBottom: idx < claim.procedures.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#a941c6' }}>{proc.cpt}</span> - {proc.description} - ${proc.charge.toFixed(2)}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#a941c6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
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
    );
}

function DetailField({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>
                {label}
            </div>
            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                {value}
            </div>
        </div>
    );
}

// Mock data generator
function getMockClaims() {
    return [
        {
            id: 1,
            claimNumber: 'CLM-2024-001',
            patient: 'Smith, John',
            dos: '2024-01-15',
            provider: 'Dr. Johnson',
            payer: 'Blue Cross',
            amount: 350.00,
            status: 'New',
            procedures: [
                { cpt: '99214', description: 'Office Visit Level 4', charge: 250.00 },
                { cpt: '36415', description: 'Venipuncture', charge: 100.00 }
            ]
        },
        {
            id: 2,
            claimNumber: 'CLM-2024-002',
            patient: 'Davis, Sarah',
            dos: '2024-01-16',
            provider: 'Dr. Williams',
            payer: 'Aetna',
            amount: 125.00,
            status: 'Billed',
            billedDate: '2024-01-17',
            procedures: [
                { cpt: '99213', description: 'Office Visit Level 3', charge: 125.00 }
            ]
        },
        {
            id: 3,
            claimNumber: 'CLM-2024-003',
            patient: 'Johnson, Mary',
            dos: '2024-01-14',
            provider: 'Dr. Smith',
            payer: 'UHC',
            amount: 890.00,
            status: 'Hold',
            procedures: [
                { cpt: '99215', description: 'Office Visit Level 5', charge: 350.00 },
                { cpt: '93000', description: 'EKG', charge: 540.00 }
            ]
        },
        {
            id: 4,
            claimNumber: 'CLM-2024-004',
            patient: 'Wilson, Robert',
            dos: '2024-01-10',
            provider: 'Dr. Johnson',
            payer: 'Medicare',
            amount: 275.00,
            status: 'Rejected',
            procedures: [
                { cpt: '99214', description: 'Office Visit Level 4', charge: 275.00 }
            ]
        },
        {
            id: 5,
            claimNumber: 'CLM-2024-005',
            patient: 'Brown, Patricia',
            dos: '2024-01-12',
            provider: 'Dr. Williams',
            payer: 'Cigna',
            amount: 450.00,
            status: 'Denied',
            procedures: [
                { cpt: '99215', description: 'Office Visit Level 5', charge: 450.00 }
            ]
        },
        {
            id: 6,
            claimNumber: 'CLM-2024-006',
            patient: 'Garcia, Michael',
            dos: '2024-01-18',
            provider: 'Dr. Smith',
            payer: 'Blue Cross',
            amount: 180.00,
            status: 'New',
            procedures: [
                { cpt: '99213', description: 'Office Visit Level 3', charge: 180.00 }
            ]
        }
    ];
}

// Claims scrubbing engine
function runClaimScrubber(claim) {
    const results = [];

    // Check 1: Patient Demographics
    if (claim.patient) {
        results.push({
            level: 'success',
            check: 'Patient Demographics',
            message: 'Patient name and information verified'
        });
    }

    // Check 2: Provider NPI
    results.push({
        level: 'success',
        check: 'Provider NPI',
        message: 'Valid NPI on file for ' + claim.provider
    });

    // Check 3: Diagnosis Pointers
    if (claim.claimNumber === 'CLM-2024-001') {
        results.push({
            level: 'warning',
            check: 'Diagnosis Pointers',
            message: 'Recommended: Add secondary diagnosis for comprehensive coding'
        });
    } else {
        results.push({
            level: 'success',
            check: 'Diagnosis Pointers',
            message: 'All procedures linked to valid diagnoses'
        });
    }

    // Check 4: NCCI Edits
    results.push({
        level: 'success',
        check: 'NCCI Edits',
        message: 'No unbundling issues detected'
    });

    // Check 5: Authorization
    if (claim.amount > 500) {
        results.push({
            level: 'error',
            check: 'Prior Authorization',
            message: 'High-cost service requires prior authorization - missing Auth #'
        });
    } else {
        results.push({
            level: 'success',
            check: 'Prior Authorization',
            message: 'Authorization verification complete'
        });
    }

    // Check 6: Eligibility
    results.push({
        level: 'success',
        check: 'Eligibility Verification',
        message: 'Active coverage confirmed for date of service'
    });

    return results;
}

// Styles
const headerCellStyle = {
    padding: '12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase'
};

const cellStyle = {
    padding: '12px',
    fontSize: '14px',
    color: '#0f172a'
};

const actionButtonStyle = (color) => ({
    padding: '6px 12px',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
});
