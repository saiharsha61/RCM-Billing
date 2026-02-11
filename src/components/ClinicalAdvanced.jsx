import React, { useState } from 'react';

/**
 * NDC VALIDATOR - Injectable Drug Validation
 * Validates NDC codes for J-codes and captures unit of measure
 */

export function NDCValidator({ onValidate, onAddCharge }) {
    const [jCode, setJCode] = useState('');
    const [ndcCode, setNdcCode] = useState('');
    const [quantity, setQuantity] = useState('');
    const [units, setUnits] = useState('ml');
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock J-Code to NDC mapping database
    const jCodeDatabase = {
        'J0696': {
            name: 'Ceftriaxone sodium',
            validNDCs: [
                { ndc: '00781-3230-95', manufacturer: 'Sandoz', strength: '1g', unitPrice: 12.50 },
                { ndc: '63323-0518-10', manufacturer: 'Fresenius Kabi', strength: '1g', unitPrice: 11.80 }
            ],
            defaultUnits: 'mg',
            allowedUOM: ['mg', 'g']
        },
        'J1100': {
            name: 'Dexamethasone sodium phosphate',
            validNDCs: [
                { ndc: '00641-6143-25', manufacturer: 'Hikma', strength: '4mg/ml', unitPrice: 3.20 },
                { ndc: '63323-0516-02', manufacturer: 'Fresenius Kabi', strength: '4mg/ml', unitPrice: 2.90 }
            ],
            defaultUnits: 'mg',
            allowedUOM: ['mg']
        },
        'J2001': {
            name: 'Lidocaine HCL',
            validNDCs: [
                { ndc: '00409-4277-01', manufacturer: 'Hospira', strength: '1%', unitPrice: 1.50 },
                { ndc: '00641-6029-01', manufacturer: 'Hikma', strength: '1%', unitPrice: 1.35 }
            ],
            defaultUnits: 'ml',
            allowedUOM: ['ml']
        },
        'J3301': {
            name: 'Triamcinolone acetonide',
            validNDCs: [
                { ndc: '00591-3009-01', manufacturer: 'Watson', strength: '40mg/ml', unitPrice: 8.75 },
                { ndc: '00517-0061-01', manufacturer: 'American Regent', strength: '40mg/ml', unitPrice: 9.20 }
            ],
            defaultUnits: 'mg',
            allowedUOM: ['mg']
        },
        'J0585': {
            name: 'Botulinum toxin type A (Botox)',
            validNDCs: [
                { ndc: '00023-1145-01', manufacturer: 'Allergan', strength: '100 units', unitPrice: 525.00 }
            ],
            defaultUnits: 'units',
            allowedUOM: ['units']
        }
    };

    const validateNDC = () => {
        if (!jCode || !ndcCode) return;

        setLoading(true);

        // Simulate API validation
        setTimeout(() => {
            const jCodeData = jCodeDatabase[jCode.toUpperCase()];

            if (!jCodeData) {
                setValidationResult({
                    valid: false,
                    error: 'Invalid J-Code',
                    message: `J-Code ${jCode} not found in database`
                });
            } else {
                const ndcMatch = jCodeData.validNDCs.find(n =>
                    n.ndc === ndcCode.replace(/-/g, '') || n.ndc === ndcCode
                );

                if (ndcMatch) {
                    setValidationResult({
                        valid: true,
                        jCode: jCode.toUpperCase(),
                        drugName: jCodeData.name,
                        ndc: ndcMatch,
                        allowedUOM: jCodeData.allowedUOM
                    });
                    setUnits(jCodeData.defaultUnits);
                } else {
                    setValidationResult({
                        valid: false,
                        error: 'NDC Mismatch',
                        message: `NDC ${ndcCode} does not match J-Code ${jCode}`,
                        validNDCs: jCodeData.validNDCs,
                        drugName: jCodeData.name
                    });
                }
            }
            setLoading(false);
        }, 500);
    };

    const calculateCharge = () => {
        if (!validationResult?.valid || !quantity) return null;
        const unitPrice = validationResult.ndc.unitPrice;
        return (parseFloat(quantity) * unitPrice).toFixed(2);
    };

    const handleAddCharge = () => {
        if (validationResult?.valid && quantity && onAddCharge) {
            onAddCharge({
                jCode: validationResult.jCode,
                ndc: validationResult.ndc.ndc,
                drugName: validationResult.drugName,
                quantity: parseFloat(quantity),
                units,
                unitPrice: validationResult.ndc.unitPrice,
                totalCharge: calculateCharge()
            });
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0004d0', marginBottom: '20px' }}>
                💉 NDC Validator
            </h2>

            {/* Input Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        J-Code *
                    </label>
                    <input
                        type="text"
                        value={jCode}
                        onChange={(e) => setJCode(e.target.value.toUpperCase())}
                        placeholder="J0696"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        NDC Code *
                    </label>
                    <input
                        type="text"
                        value={ndcCode}
                        onChange={(e) => setNdcCode(e.target.value)}
                        placeholder="00781-3230-95"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: 'monospace'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        onClick={validateNDC}
                        disabled={!jCode || !ndcCode || loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: loading ? '#e2e8f0' : '#a941c6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Checking...' : '✓ Validate'}
                    </button>
                </div>
            </div>

            {/* Validation Result */}
            {validationResult && (
                <div style={{
                    border: '2px solid',
                    borderColor: validationResult.valid ? '#10b981' : '#ef4444',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '20px'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: validationResult.valid ? '#d1fae5' : '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '24px' }}>
                            {validationResult.valid ? '✓' : '⚠️'}
                        </span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                                {validationResult.valid ? 'NDC Valid' : validationResult.error}
                            </h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                {validationResult.valid ? validationResult.drugName : validationResult.message}
                            </p>
                        </div>
                    </div>

                    {/* Valid - Show quantity entry */}
                    {validationResult.valid && (
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Manufacturer</div>
                                    <div style={{ fontWeight: '600' }}>{validationResult.ndc.manufacturer}</div>
                                </div>
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Strength</div>
                                    <div style={{ fontWeight: '600' }}>{validationResult.ndc.strength}</div>
                                </div>
                                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Unit Price</div>
                                    <div style={{ fontWeight: '600', color: '#10b981' }}>${validationResult.ndc.unitPrice.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Quantity & Units */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                        Quantity Administered
                                    </label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        step="0.1"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                        Unit of Measure
                                    </label>
                                    <select
                                        value={units}
                                        onChange={(e) => setUnits(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {validationResult.allowedUOM.map(uom => (
                                            <option key={uom} value={uom}>{uom}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#dbeafe',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#1e40af' }}>Total Charge</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                                            ${calculateCharge() || '0.00'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddCharge}
                                        disabled={!quantity}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: quantity ? '#3b82f6' : '#e2e8f0',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: quantity ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        + Add Charge
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invalid - Show valid NDCs */}
                    {!validationResult.valid && validationResult.validNDCs && (
                        <div style={{ padding: '20px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0f172a' }}>
                                Valid NDCs for {validationResult.drugName}:
                            </h4>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {validationResult.validNDCs.map((ndc, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setNdcCode(ndc.ndc)}
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{ndc.ndc}</span>
                                        <span style={{ color: '#64748b' }}>{ndc.manufacturer} - {ndc.strength}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Reference */}
            <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0f172a' }}>
                    Common J-Codes
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '13px' }}>
                    {Object.entries(jCodeDatabase).map(([code, data]) => (
                        <div
                            key={code}
                            onClick={() => setJCode(code)}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#a941c6' }}>{code}</span>
                            <span style={{ color: '#64748b', marginLeft: '8px' }}>{data.name.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * ANESTHESIA CALCULATOR
 * Calculate anesthesia time units for billing
 */

export function AnesthesiaCalculator({ onCalculate }) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [baseUnits, setBaseUnits] = useState(0);
    const [anesCode, setAnesCode] = useState('');
    const [modifiers, setModifiers] = useState([]);
    const [result, setResult] = useState(null);

    // Mock anesthesia base units database
    const anesCodeDatabase = {
        '00100': { description: 'Anesthesia for salivary gland', baseUnits: 5 },
        '00140': { description: 'Anesthesia for eye procedures', baseUnits: 5 },
        '00300': { description: 'Anesthesia for head/neck procedures', baseUnits: 5 },
        '00400': { description: 'Anesthesia for chest procedures', baseUnits: 6 },
        '00520': { description: 'Anesthesia for closed heart procedures', baseUnits: 10 },
        '00630': { description: 'Anesthesia for lumbar region', baseUnits: 8 },
        '00740': { description: 'Anesthesia for upper GI', baseUnits: 7 },
        '00810': { description: 'Anesthesia for lower intestinal', baseUnits: 6 },
        '00840': { description: 'Anesthesia for abdominal wall', baseUnits: 4 },
        '01210': { description: 'Anesthesia for hip procedures', baseUnits: 8 }
    };

    const modifierOptions = [
        { code: 'AA', description: 'Anesthesia services by anesthesiologist' },
        { code: 'AD', description: 'Medical supervision by physician' },
        { code: 'QK', description: 'Medical direction 2-4 CRNAs' },
        { code: 'QX', description: 'CRNA service with medical direction' },
        { code: 'QY', description: 'Medical direction of one CRNA' },
        { code: 'QZ', description: 'CRNA without medical direction' },
        { code: 'P1', description: 'Normal healthy patient' },
        { code: 'P2', description: 'Mild systemic disease' },
        { code: 'P3', description: 'Severe systemic disease' },
        { code: 'P4', description: 'Life-threatening disease' }
    ];

    const handleCodeChange = (code) => {
        setAnesCode(code);
        const codeData = anesCodeDatabase[code];
        if (codeData) {
            setBaseUnits(codeData.baseUnits);
        }
    };

    const calculateUnits = () => {
        if (!startTime || !endTime || !anesCode) return;

        // Parse times
        const start = new Date(`2024-01-01T${startTime}`);
        const end = new Date(`2024-01-01T${endTime}`);

        // Handle overnight cases
        let diffMs = end - start;
        if (diffMs < 0) {
            diffMs += 24 * 60 * 60 * 1000; // Add 24 hours
        }

        const diffMinutes = diffMs / (1000 * 60);
        const timeUnits = Math.ceil(diffMinutes / 15); // 1 unit per 15 minutes
        const totalUnits = baseUnits + timeUnits;

        // Apply physical status modifiers (P1-P4 add 0-3 units)
        const physicalMod = modifiers.find(m => m.startsWith('P'));
        let modifierUnits = 0;
        if (physicalMod) {
            modifierUnits = parseInt(physicalMod.charAt(1)) - 1; // P1=0, P2=1, P3=2, P4=3
        }

        setResult({
            anesCode,
            description: anesCodeDatabase[anesCode]?.description,
            startTime,
            endTime,
            totalMinutes: diffMinutes,
            baseUnits,
            timeUnits,
            modifierUnits,
            totalUnits: totalUnits + modifierUnits,
            modifiers
        });
    };

    const toggleModifier = (mod) => {
        if (modifiers.includes(mod)) {
            setModifiers(modifiers.filter(m => m !== mod));
        } else {
            // Only allow one physical status modifier (P1-P4)
            if (mod.startsWith('P')) {
                setModifiers([...modifiers.filter(m => !m.startsWith('P')), mod]);
            } else {
                setModifiers([...modifiers, mod]);
            }
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0004d0', marginBottom: '20px' }}>
                ⏱️ Anesthesia Time Calculator
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Anesthesia Code */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Anesthesia Code *
                    </label>
                    <select
                        value={anesCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">Select code...</option>
                        {Object.entries(anesCodeDatabase).map(([code, data]) => (
                            <option key={code} value={code}>
                                {code} - {data.description} (Base: {data.baseUnits})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Time */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Start Time *
                    </label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* End Time */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        End Time *
                    </label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </div>

            {/* Modifiers */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
                    Modifiers
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {modifierOptions.map(mod => (
                        <button
                            key={mod.code}
                            onClick={() => toggleModifier(mod.code)}
                            title={mod.description}
                            style={{
                                padding: '8px 14px',
                                backgroundColor: modifiers.includes(mod.code) ? '#a941c6' : 'white',
                                color: modifiers.includes(mod.code) ? 'white' : '#64748b',
                                border: `2px solid ${modifiers.includes(mod.code) ? '#a941c6' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {mod.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calculate Button */}
            <button
                onClick={calculateUnits}
                disabled={!anesCode || !startTime || !endTime}
                style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: (!anesCode || !startTime || !endTime) ? '#e2e8f0' : '#0004d0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (!anesCode || !startTime || !endTime) ? 'not-allowed' : 'pointer',
                    marginBottom: '24px'
                }}
            >
                Calculate Units
            </button>

            {/* Result */}
            {result && (
                <div style={{
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: '#d1fae5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                {result.anesCode} - {result.description}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                {result.startTime} → {result.endTime} ({Math.round(result.totalMinutes)} minutes)
                            </p>
                        </div>
                        <div style={{
                            padding: '12px 20px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>Total Units</div>
                            <div style={{ fontSize: '28px', fontWeight: '700' }}>{result.totalUnits}</div>
                        </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            <UnitBox label="Base Units" value={result.baseUnits} color="#3b82f6" />
                            <UnitBox label="Time Units" value={result.timeUnits} sublabel={`${Math.round(result.totalMinutes)} min ÷ 15`} color="#8b5cf6" />
                            <UnitBox label="Modifier Units" value={result.modifierUnits} color="#f59e0b" />
                            <UnitBox label="Total" value={result.totalUnits} color="#10b981" highlight />
                        </div>

                        {result.modifiers.length > 0 && (
                            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <strong>Applied Modifiers:</strong> {result.modifiers.join(', ')}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Formula Reference */}
            <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#64748b'
            }}>
                <strong>Formula:</strong> Total Units = Base Units + Time Units + Physical Status Modifier Units
                <br />
                <strong>Time Units:</strong> 1 unit per 15 minutes (rounded up)
            </div>
        </div>
    );
}

function UnitBox({ label, value, sublabel, color, highlight }) {
    return (
        <div style={{
            padding: '16px',
            backgroundColor: highlight ? `${color}15` : '#f8fafc',
            borderRadius: '8px',
            textAlign: 'center',
            border: highlight ? `2px solid ${color}` : 'none'
        }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                {label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: highlight ? color : '#0f172a' }}>
                {value}
            </div>
            {sublabel && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {sublabel}
                </div>
            )}
        </div>
    );
}

export default NDCValidator;
