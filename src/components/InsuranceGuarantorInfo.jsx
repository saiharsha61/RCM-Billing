import React, { useState } from 'react';
import { BenefitBreakdown } from './BenefitBreakdown';

/**
 * INSURANCE & GUARANTOR INFO COMPONENT
 * Phase 2 of eCW V12 Implementation
 * Manages insurance payer pyramid, subscriber workflow, and guarantor relationships
 */

export function InsuranceGuarantorInfo({
    patientId,
    onSave,
    onCancel,
    initialData = null,
    patients = []
}) {
    // Guarantor Information
    const [guarantorRelationship, setGuarantorRelationship] = useState(initialData?.guarantorRelationship || 'Self');
    const [guarantorPatientId, setGuarantorPatientId] = useState(initialData?.guarantorPatientId || '');

    // Insurance Layers
    const [primaryInsurance, setPrimaryInsurance] = useState(initialData?.primaryInsurance || {
        payerId: '',
        planName: '',
        memberId: '',
        groupNumber: '',
        effectiveDate: '',
        terminationDate: '',
        relationshipToInsured: 'Self',
        subscriberName: '',
        subscriberDob: '',
        subscriberAddress: '',
        subscriberSSN: '',
        copayPCP: '',
        copaySpecialist: '',
        deductibleRemaining: '',
        coinsurancePct: '',
        eligibilityStatus: 'Unknown'
    });

    const [secondaryInsurance, setSecondaryInsurance] = useState(initialData?.secondaryInsurance || null);
    const [tertiaryInsurance, setTertiaryInsurance] = useState(initialData?.tertiaryInsurance || null);

    const [hasSecondary, setHasSecondary] = useState(!!initialData?.secondaryInsurance);
    const [hasTertiary, setHasTertiary] = useState(!!initialData?.tertiaryInsurance);

    // Eligibility Check State
    const [eligibilityChecking, setEligibilityChecking] = useState(false);
    const [lastEligibilityCheck, setLastEligibilityCheck] = useState(null);

    // Payer List (mock data - in production, this would come from database)
    const payerList = [
        { id: '00430', name: 'Medicare', type: 'Medicare' },
        { id: '60054', name: 'Aetna', type: 'Commercial' },
        { id: 'BCBSD', name: 'Blue Cross Blue Shield', type: 'Commercial' },
        { id: 'UHC01', name: 'UnitedHealthcare', type: 'Commercial' },
        { id: 'CIG01', name: 'Cigna', type: 'Commercial' },
        { id: 'HUMANA', name: 'Humana', type: 'Commercial' },
        { id: 'MEDICAID', name: 'Medicaid', type: 'Medicaid' }
    ];

    // Real-time Eligibility Check (270/271 simulation)
    const checkEligibility = async (insuranceLayer) => {
        setEligibilityChecking(true);

        // Simulate API call delay
        setTimeout(() => {
            const mockResponse = {
                status: 'Active',
                copayPCP: 25.00,
                copaySpecialist: 50.00,
                deductibleRemaining: 1500.00,
                coinsurancePct: 20,
                verifiedDate: new Date().toISOString(),
                // Enhanced benefit data for BenefitBreakdown
                benefits: {
                    deductible: 2400.00,
                    deductible_met: 900.00,
                    max_out_of_pocket: 5500.00,
                    out_of_pocket_met: 325.00,
                    deductible_coverage_type: 'FAMILY',
                    oop_coverage_type: 'FAMILY',
                    network_type: 'IN-NETWORK',
                    copay: 25.00,
                    specialist_copay: 50.00,
                    coinsurance: 20
                }
            };

            if (insuranceLayer === 'primary') {
                setPrimaryInsurance(prev => ({
                    ...prev,
                    eligibilityStatus: mockResponse.status,
                    copayPCP: mockResponse.copayPCP,
                    copaySpecialist: mockResponse.copaySpecialist,
                    deductibleRemaining: mockResponse.deductibleRemaining,
                    coinsurancePct: mockResponse.coinsurancePct,
                    benefits: mockResponse.benefits
                }));
            }

            setLastEligibilityCheck({
                layer: insuranceLayer,
                timestamp: new Date().toLocaleString(),
                result: mockResponse
            });

            setEligibilityChecking(false);
        }, 1500);
    };

    const handleSave = () => {
        const data = {
            patientId,
            guarantorRelationship,
            guarantorPatientId: guarantorRelationship === 'Self' ? patientId : guarantorPatientId,
            primaryInsurance,
            secondaryInsurance: hasSecondary ? secondaryInsurance : null,
            tertiaryInsurance: hasTertiary ? tertiaryInsurance : null
        };

        onSave(data);
    };

    const InsuranceCard = ({ insurance, setInsurance, layer, title }) => {
        const isSubscriberSelf = insurance.relationshipToInsured === 'Self';

        return (
            <div style={{
                padding: '20px',
                backgroundColor: '#ffffff',
                border: '2px solid #e0e7ff',
                borderRadius: '10px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#4f46e5', margin: 0 }}>
                        {title}
                    </h4>
                    <button
                        onClick={() => checkEligibility(layer)}
                        disabled={eligibilityChecking || !insurance.payerId}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: eligibilityChecking ? '#cbd5e1' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: eligibilityChecking || !insurance.payerId ? 'not-allowed' : 'pointer',
                            opacity: eligibilityChecking || !insurance.payerId ? 0.5 : 1
                        }}
                    >
                        {eligibilityChecking ? '⏳ Checking...' : '✓ Check Eligibility'}
                    </button>
                </div>

                {/* Eligibility Status Banner */}
                {insurance.eligibilityStatus !== 'Unknown' && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '16px',
                        backgroundColor: insurance.eligibilityStatus === 'Active' ? '#d1fae5' : '#fee2e2',
                        border: `2px solid ${insurance.eligibilityStatus === 'Active' ? '#10b981' : '#ef4444'}`,
                        borderRadius: '6px',
                        fontSize: '13px'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                            {insurance.eligibilityStatus === 'Active' ? '● Coverage Active' : '○ Coverage Inactive'}
                        </div>
                        {insurance.eligibilityStatus === 'Active' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                                <div>
                                    <div style={{ color: '#64748b' }}>PCP Copay</div>
                                    <div style={{ fontWeight: '600' }}>${insurance.copayPCP?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b' }}>Specialist</div>
                                    <div style={{ fontWeight: '600' }}>${insurance.copaySpecialist?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b' }}>Deductible Left</div>
                                    <div style={{ fontWeight: '600' }}>${insurance.deductibleRemaining?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b' }}>Coinsurance</div>
                                    <div style={{ fontWeight: '600' }}>{insurance.coinsurancePct}%</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* INFINX Benefit Breakdown */}
                {insurance.benefits && insurance.eligibilityStatus === 'Active' && (
                    <BenefitBreakdown eligibilityData={insurance} />
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {/* Payer Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                            Insurance Plan <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            value={insurance.payerId}
                            onChange={(e) => {
                                const selectedPayer = payerList.find(p => p.id === e.target.value);
                                setInsurance({ ...insurance, payerId: e.target.value, planName: selectedPayer?.name || '' });
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '13px'
                            }}
                        >
                            <option value="">Select Plan...</option>
                            {payerList.map(payer => (
                                <option key={payer.id} value={payer.id}>
                                    {payer.name} ({payer.type})
                                </option>
                            ))}
                        </select>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Payer ID: {insurance.payerId || 'N/A'}
                        </div>
                    </div>

                    {/* Member ID */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                            Member/Policy ID <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={insurance.memberId}
                            onChange={(e) => setInsurance({ ...insurance, memberId: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontFamily: 'monospace'
                            }}
                            placeholder="ABC123456789"
                        />
                    </div>

                    {/* Group Number */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                            Group Number
                            <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#64748b', marginLeft: '4px' }}>(Box 11)</span>
                        </label>
                        <input
                            type="text"
                            value={insurance.groupNumber}
                            onChange={(e) => setInsurance({ ...insurance, groupNumber: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontFamily: 'monospace'
                            }}
                            placeholder="GRP12345"
                        />
                    </div>

                    {/* Effective Date */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                            Effective Date
                        </label>
                        <input
                            type="date"
                            value={insurance.effectiveDate}
                            onChange={(e) => setInsurance({ ...insurance, effectiveDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '13px'
                            }}
                        />
                    </div>

                    {/* Termination Date */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                            Termination Date
                        </label>
                        <input
                            type="date"
                            value={insurance.terminationDate}
                            onChange={(e) => setInsurance({ ...insurance, terminationDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '13px'
                            }}
                        />
                    </div>
                </div>

                {/* Subscriber Information Section */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <h5 style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                        Subscriber Information
                        <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b', marginLeft: '8px' }}>
                            (Box 4, Box 7 - Policyholder)
                        </span>
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {/* Relationship to Insured */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                                Relationship to Insured <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                value={insurance.relationshipToInsured}
                                onChange={(e) => setInsurance({ ...insurance, relationshipToInsured: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid #a941c6',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    backgroundColor: '#faf5ff'
                                }}
                            >
                                <option value="Self">Self</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {!isSubscriberSelf && (
                            <>
                                {/* Subscriber Name */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                                        Subscriber Name <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={insurance.subscriberName}
                                        onChange={(e) => setInsurance({ ...insurance, subscriberName: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '13px'
                                        }}
                                        placeholder="Jane Doe"
                                    />
                                </div>

                                {/* Subscriber DOB */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                                        Subscriber DOB <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={insurance.subscriberDob}
                                        onChange={(e) => setInsurance({ ...insurance, subscriberDob: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '13px'
                                        }}
                                    />
                                </div>

                                {/* Subscriber Address */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                                        Subscriber Address
                                    </label>
                                    <input
                                        type="text"
                                        value={insurance.subscriberAddress}
                                        onChange={(e) => setInsurance({ ...insurance, subscriberAddress: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '13px'
                                        }}
                                        placeholder="123 Main St, City, ST 12345"
                                    />
                                </div>
                            </>
                        )}

                        {isSubscriberSelf && (
                            <div style={{ gridColumn: '1 / -1', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #86efac' }}>
                                <div style={{ fontSize: '13px', color: '#166534' }}>
                                    ✓ Patient is the subscriber (policyholder). Subscriber details will auto-populate from patient demographics.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                    Insurance & Guarantor Information
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                    Financial responsibility and payer configuration
                </p>
            </div>

            {/* Guarantor Section */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px', border: '2px solid #f59e0b' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '16px' }}>
                    Guarantor (Financial Responsibility)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                            Relationship <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            value={guarantorRelationship}
                            onChange={(e) => setGuarantorRelationship(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '2px solid #f59e0b',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="Self">Self (Patient is responsible)</option>
                            <option value="Parent">Parent</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Guardian">Legal Guardian</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {guarantorRelationship !== 'Self' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                                Link to Guarantor Patient Record
                            </label>
                            <select
                                value={guarantorPatientId}
                                onChange={(e) => setGuarantorPatientId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '2px solid #f59e0b',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Select Patient...</option>
                                {patients.map(patient => (
                                    <option key={patient.PatientID} value={patient.PatientID}>
                                        {patient.FirstName} {patient.LastName} (DOB: {patient.DOB})
                                    </option>
                                ))}
                            </select>
                            <div style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>
                                For family billing consolidation
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Primary Insurance */}
            <InsuranceCard
                insurance={primaryInsurance}
                setInsurance={setPrimaryInsurance}
                layer="primary"
                title="Primary Insurance (Priority 1)"
            />

            {/* Add Secondary Insurance Button */}
            {!hasSecondary && (
                <button
                    onClick={() => {
                        setHasSecondary(true);
                        setSecondaryInsurance({
                            payerId: '',
                            planName: '',
                            memberId: '',
                            groupNumber: '',
                            effectiveDate: '',
                            terminationDate: '',
                            relationshipToInsured: 'Self',
                            subscriberName: '',
                            subscriberDob: '',
                            subscriberAddress: '',
                            eligibilityStatus: 'Unknown'
                        });
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        border: '2px dashed #0369a1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '20px',
                        width: '100%'
                    }}
                >
                    ➕ Add Secondary Insurance
                </button>
            )}

            {/* Secondary Insurance */}
            {hasSecondary && secondaryInsurance && (
                <>
                    <InsuranceCard
                        insurance={secondaryInsurance}
                        setInsurance={setSecondaryInsurance}
                        layer="secondary"
                        title="Secondary Insurance (Priority 2)"
                    />
                    <button
                        onClick={() => {
                            setHasSecondary(false);
                            setSecondaryInsurance(null);
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        ✕ Remove Secondary Insurance
                    </button>
                </>
            )}

            {/* Last Eligibility Check Info */}
            {lastEligibilityCheck && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: '#166534'
                }}>
                    ✓ Last eligibility check: {lastEligibilityCheck.layer} insurance at {lastEligibilityCheck.timestamp}
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!primaryInsurance.payerId || !primaryInsurance.memberId}
                    style={{
                        padding: '12px 32px',
                        backgroundColor: (!primaryInsurance.payerId || !primaryInsurance.memberId) ? '#cbd5e1' : '#a941c6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: (!primaryInsurance.payerId || !primaryInsurance.memberId) ? 'not-allowed' : 'pointer',
                        opacity: (!primaryInsurance.payerId || !primaryInsurance.memberId) ? 0.5 : 1
                    }}
                >
                    Save Insurance Info
                </button>
            </div>
        </div>
    );
}
