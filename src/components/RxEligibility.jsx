import React, { useState } from 'react';

/**
 * RX ELIGIBILITY - PBM/Formulary Check
 * Verifies prescription coverage and displays formulary information
 */

export function RxEligibility({ patientId, insuranceData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [eligibilityResult, setEligibilityResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock drug database
    const drugDatabase = [
        { id: 1, name: 'Lisinopril', generic: true, ndc: '00093-7180-01', strength: '10mg', class: 'ACE Inhibitor' },
        { id: 2, name: 'Metformin', generic: true, ndc: '00093-7214-01', strength: '500mg', class: 'Antidiabetic' },
        { id: 3, name: 'Lipitor', generic: false, ndc: '00071-0155-23', strength: '20mg', class: 'Statin', brandName: 'Atorvastatin' },
        { id: 4, name: 'Ozempic', generic: false, ndc: '00169-4771-11', strength: '0.5mg', class: 'GLP-1 Agonist' },
        { id: 5, name: 'Eliquis', generic: false, ndc: '00003-0893-21', strength: '5mg', class: 'Anticoagulant' },
        { id: 6, name: 'Amoxicillin', generic: true, ndc: '00093-4157-01', strength: '500mg', class: 'Antibiotic' }
    ];

    const filteredDrugs = searchTerm.length >= 2
        ? drugDatabase.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const checkEligibility = (drug) => {
        setLoading(true);
        setSelectedDrug(drug);

        // Simulate API call
        setTimeout(() => {
            const result = generateMockEligibility(drug);
            setEligibilityResult(result);
            setLoading(false);
        }, 800);
    };

    const generateMockEligibility = (drug) => {
        // Mock formulary tiers and coverage
        const tiers = {
            1: { name: 'Preferred Generic', copay: 10, coinsurance: null, covered: true },
            2: { name: 'Non-Preferred Generic', copay: 25, coinsurance: null, covered: true },
            3: { name: 'Preferred Brand', copay: 50, coinsurance: null, covered: true },
            4: { name: 'Non-Preferred Brand', copay: null, coinsurance: 30, covered: true },
            5: { name: 'Specialty', copay: null, coinsurance: 25, covered: true, priorAuth: true },
            6: { name: 'Not Covered', copay: null, coinsurance: null, covered: false }
        };

        let tier;
        if (drug.generic) {
            tier = drug.class === 'Antibiotic' ? 1 : 2;
        } else if (drug.name === 'Ozempic' || drug.name === 'Eliquis') {
            tier = 5;
        } else {
            tier = 3;
        }

        const tierInfo = tiers[tier];

        return {
            drug,
            tier,
            tierInfo,
            alternatives: drug.generic ? [] : [
                { name: drug.brandName || `Generic ${drug.class}`, tier: 1, savings: '$40+' }
            ],
            quantityLimit: drug.name === 'Ozempic' ? '4 pens per 30 days' : null,
            stepTherapy: drug.name === 'Eliquis' ? 'Warfarin trial required' : null,
            priorAuth: tierInfo.priorAuth || false,
            deductibleApplies: tier >= 4
        };
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0004d0', marginBottom: '20px' }}>
                💊 Rx Eligibility Check
            </h2>

            {/* Drug Search */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                    Search Medication
                </label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type drug name (e.g., Lisinopril)..."
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px'
                    }}
                />

                {/* Search Results */}
                {filteredDrugs.length > 0 && (
                    <div style={{
                        marginTop: '8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        {filteredDrugs.map(drug => (
                            <div
                                key={drug.id}
                                onClick={() => checkEligibility(drug)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: 'white'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                <div>
                                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{drug.name} {drug.strength}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{drug.class}</div>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    backgroundColor: drug.generic ? '#d1fae5' : '#fef3c7',
                                    color: drug.generic ? '#059669' : '#d97706',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {drug.generic ? 'Generic' : 'Brand'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    Checking formulary coverage...
                </div>
            )}

            {/* Eligibility Result */}
            {eligibilityResult && !loading && (
                <div style={{
                    border: '2px solid',
                    borderColor: eligibilityResult.tierInfo.covered ? '#10b981' : '#ef4444',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: eligibilityResult.tierInfo.covered ? '#d1fae5' : '#fee2e2',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                {eligibilityResult.drug.name} {eligibilityResult.drug.strength}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                NDC: {eligibilityResult.drug.ndc}
                            </p>
                        </div>
                        <div style={{
                            padding: '8px 16px',
                            backgroundColor: eligibilityResult.tierInfo.covered ? '#10b981' : '#ef4444',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: '700'
                        }}>
                            {eligibilityResult.tierInfo.covered ? '✓ COVERED' : '✕ NOT COVERED'}
                        </div>
                    </div>

                    {/* Details */}
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                            <ResultBox
                                label="Formulary Tier"
                                value={`Tier ${eligibilityResult.tier}`}
                                subtitle={eligibilityResult.tierInfo.name}
                            />
                            <ResultBox
                                label="Patient Cost"
                                value={
                                    eligibilityResult.tierInfo.copay
                                        ? `$${eligibilityResult.tierInfo.copay}`
                                        : eligibilityResult.tierInfo.coinsurance
                                            ? `${eligibilityResult.tierInfo.coinsurance}%`
                                            : 'N/A'
                                }
                                subtitle={eligibilityResult.tierInfo.copay ? 'Copay' : 'Coinsurance'}
                            />
                            <ResultBox
                                label="Deductible"
                                value={eligibilityResult.deductibleApplies ? 'Applies' : 'Waived'}
                                subtitle={eligibilityResult.deductibleApplies ? 'Must meet deductible first' : 'No deductible required'}
                            />
                        </div>

                        {/* Restrictions */}
                        {(eligibilityResult.priorAuth || eligibilityResult.stepTherapy || eligibilityResult.quantityLimit) && (
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '8px',
                                marginBottom: '16px'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                                    ⚠️ Coverage Restrictions
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '14px' }}>
                                    {eligibilityResult.priorAuth && <li>Prior Authorization Required</li>}
                                    {eligibilityResult.stepTherapy && <li>Step Therapy: {eligibilityResult.stepTherapy}</li>}
                                    {eligibilityResult.quantityLimit && <li>Quantity Limit: {eligibilityResult.quantityLimit}</li>}
                                </ul>
                            </div>
                        )}

                        {/* Alternatives */}
                        {eligibilityResult.alternatives.length > 0 && (
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '8px'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                                    💡 Lower-Cost Alternatives
                                </h4>
                                {eligibilityResult.alternatives.map((alt, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#1e40af' }}>{alt.name} (Tier {alt.tier})</span>
                                        <span style={{ fontWeight: '600', color: '#059669' }}>Save {alt.savings}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ResultBox({ label, value, subtitle }) {
    return (
        <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                {label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                {value}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {subtitle}
            </div>
        </div>
    );
}

/**
 * ELIGIBILITY BATCH PROCESSING
 * Run eligibility checks for multiple patients overnight
 */

export function EligibilityBatch({ patients = [], onRunBatch }) {
    const [batchStatus, setBatchStatus] = useState('idle'); // idle, running, complete
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [scheduleTime, setScheduleTime] = useState('02:00');

    // Mock patients for demo
    const mockPatients = patients.length ? patients : [
        { id: 1, name: 'Smith, John', insurance: 'Blue Cross', lastCheck: '2024-01-15' },
        { id: 2, name: 'Johnson, Sarah', insurance: 'Aetna', lastCheck: '2024-01-10' },
        { id: 3, name: 'Williams, Robert', insurance: 'UHC', lastCheck: '2024-01-12' },
        { id: 4, name: 'Brown, Patricia', insurance: 'Medicare', lastCheck: '2024-01-08' },
        { id: 5, name: 'Davis, Michael', insurance: 'Cigna', lastCheck: '2024-01-14' }
    ];

    const runBatch = () => {
        setBatchStatus('running');
        setProgress(0);
        setResults([]);

        // Simulate batch processing
        let processed = 0;
        const interval = setInterval(() => {
            processed++;
            setProgress((processed / mockPatients.length) * 100);

            // Add result
            const patient = mockPatients[processed - 1];
            const status = Math.random() > 0.2 ? 'Active' : Math.random() > 0.5 ? 'Inactive' : 'Error';
            setResults(prev => [...prev, {
                ...patient,
                status,
                checkedAt: new Date().toISOString()
            }]);

            if (processed >= mockPatients.length) {
                clearInterval(interval);
                setBatchStatus('complete');
            }
        }, 600);
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0004d0', margin: 0 }}>
                        📋 Batch Eligibility Processing
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        Run eligibility checks for upcoming appointments
                    </p>
                </div>

                {batchStatus === 'idle' && (
                    <button
                        onClick={runBatch}
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
                        ▶ Run Now
                    </button>
                )}
            </div>

            {/* Schedule Settings */}
            {batchStatus === 'idle' && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>Scheduled Run Time:</span>
                    <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    />
                    <span style={{ color: '#64748b', fontSize: '13px' }}>
                        (Runs daily for next day's appointments)
                    </span>
                </div>
            )}

            {/* Progress Bar */}
            {batchStatus === 'running' && (
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>Processing...</span>
                        <span style={{ color: '#64748b' }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            backgroundColor: '#a941c6',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            )}

            {/* Results Table */}
            {results.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#0f172a' }}>
                        Results
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Patient</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Insurance</th>
                                <th style={{ padding: '12px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{result.name}</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{result.insurance}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: result.status === 'Active' ? '#d1fae5' : result.status === 'Inactive' ? '#fee2e2' : '#fef3c7',
                                            color: result.status === 'Active' ? '#059669' : result.status === 'Inactive' ? '#dc2626' : '#d97706'
                                        }}>
                                            {result.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    {batchStatus === 'complete' && (
                        <div style={{
                            marginTop: '16px',
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            display: 'flex',
                            gap: '24px'
                        }}>
                            <div>
                                <span style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                                    {results.filter(r => r.status === 'Active').length}
                                </span>
                                <span style={{ marginLeft: '6px', color: '#64748b' }}>Active</span>
                            </div>
                            <div>
                                <span style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                                    {results.filter(r => r.status === 'Inactive').length}
                                </span>
                                <span style={{ marginLeft: '6px', color: '#64748b' }}>Inactive</span>
                            </div>
                            <div>
                                <span style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                                    {results.filter(r => r.status === 'Error').length}
                                </span>
                                <span style={{ marginLeft: '6px', color: '#64748b' }}>Errors</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Patients Queue */}
            {batchStatus === 'idle' && (
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#0f172a' }}>
                        Patients to Check ({mockPatients.length})
                    </h3>
                    <div style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {mockPatients.map(patient => (
                            <div key={patient.id} style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{ fontWeight: '500' }}>{patient.name}</span>
                                <span style={{ color: '#64748b', fontSize: '13px' }}>
                                    Last check: {patient.lastCheck}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RxEligibility;
