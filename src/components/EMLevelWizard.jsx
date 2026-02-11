import React, { useState } from 'react';

/**
 * E&M LEVEL WIZARD
 * Helper to calculate Evaluation & Management codes (99202-99215)
 * based on 2021/2023 AMA Guidelines (Time or Medical Decision Making).
 */

export function EMLevelWizard({ onSelectCode, onClose }) {
    const [method, setMethod] = useState('mdm'); // 'mdm' or 'time'
    const [patientType, setPatientType] = useState('established'); // 'new' or 'established'

    // MDM State
    const [problems, setProblems] = useState(0); // 0=Minimal, 1=Low, 2=Moderate, 3=High
    const [data, setData] = useState(0);
    const [risk, setRisk] = useState(0);

    // Time State
    const [minutes, setMinutes] = useState(0);

    // Calculate Code
    const calculateCode = () => {
        if (method === 'time') {
            if (patientType === 'new') {
                if (minutes >= 60) return '99205';
                if (minutes >= 45) return '99204';
                if (minutes >= 30) return '99203';
                if (minutes >= 15) return '99202';
                return 'Unbillable (<15m)';
            } else {
                if (minutes >= 40) return '99215';
                if (minutes >= 30) return '99214';
                if (minutes >= 20) return '99213';
                if (minutes >= 10) return '99212';
                return 'Unbillable (<10m)';
            }
        } else {
            // MDM Calculation (simplified: requires 2 of 3 elements)
            // Problems, Data, Risk
            // Sort values to find the middle one (since 2 of 3 determine level)
            const elements = [problems, data, risk].sort((a, b) => a - b);
            const level = elements[1]; // The median determines the result

            // Map level to code
            if (patientType === 'new') {
                if (level >= 3) return '99205';
                if (level >= 2) return '99204';
                if (level >= 1) return '99203';
                return '99202';
            } else {
                if (level >= 3) return '99215';
                if (level >= 2) return '99214';
                if (level >= 1) return '99213';
                return '99212';
            }
        }
    };

    const currentCode = calculateCode();

    const handleApply = () => {
        onSelectCode({
            code: currentCode,
            desc: `Office Visit, ${patientType}, Level ${currentCode.slice(-1)}`,
            fee: currentCode === '99213' ? 120 : (currentCode === '99214' ? 185 : 200), // Mock fees
            units: 1,
            modifiers: [],
            dxPointers: [1]
        });
        onClose();
    };

    return (
        <div style={{
            position: 'absolute',
            top: '50px',
            right: '20px',
            width: '320px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            zIndex: 100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ padding: '16px', backgroundColor: '#a941c6', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>E&M Coding Wizard</h3>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Config */}
            <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button
                        onClick={() => setPatientType('new')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: patientType === 'new' ? '#eff6ff' : 'white', color: patientType === 'new' ? '#1d4ed8' : '#64748b', cursor: 'pointer', fontWeight: '500' }}
                    >
                        New
                    </button>
                    <button
                        onClick={() => setPatientType('established')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: patientType === 'established' ? '#eff6ff' : 'white', color: patientType === 'established' ? '#1d4ed8' : '#64748b', cursor: 'pointer', fontWeight: '500' }}
                    >
                        Established
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setMethod('mdm')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: method === 'mdm' ? '#f0fdf4' : 'white', color: method === 'mdm' ? '#15803d' : '#64748b', cursor: 'pointer', fontWeight: '500' }}
                    >
                        MDM Based
                    </button>
                    <button
                        onClick={() => setMethod('time')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: method === 'time' ? '#f0fdf4' : 'white', color: method === 'time' ? '#15803d' : '#64748b', cursor: 'pointer', fontWeight: '500' }}
                    >
                        Time Based
                    </button>
                </div>
            </div>

            {/* Inputs */}
            <div style={{ padding: '16px', flex: 1 }}>
                {method === 'time' ? (
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500' }}>Total Time (minutes)</label>
                        <input
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(Number(e.target.value))}
                            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Include face-to-face and non-face-to-face time on DOS.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Problems</label>
                                <span style={{ fontSize: '12px', color: '#a941c6' }}>{['Minimal', 'Low', 'Moderate', 'High'][problems]}</span>
                            </div>
                            <input type="range" min="0" max="3" value={problems} onChange={(e) => setProblems(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Data Reviewed</label>
                                <span style={{ fontSize: '12px', color: '#a941c6' }}>{['Minimal', 'Limited', 'Moderate', 'Extensive'][data]}</span>
                            </div>
                            <input type="range" min="0" max="3" value={data} onChange={(e) => setData(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Risk</label>
                                <span style={{ fontSize: '12px', color: '#a941c6' }}>{['Minimal', 'Low', 'Moderate', 'High'][risk]}</span>
                            </div>
                            <input type="range" min="0" max="3" value={risk} onChange={(e) => setRisk(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Result Footer */}
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Calculated Level</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{currentCode}</div>
                </div>
                <button
                    onClick={handleApply}
                    disabled={currentCode.startsWith('Unbillable')}
                    style={{
                        padding: '12px',
                        backgroundColor: currentCode.startsWith('Unbillable') ? '#cbd5e1' : '#a941c6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: currentCode.startsWith('Unbillable') ? 'not-allowed' : 'pointer'
                    }}
                >
                    Apply Code
                </button>
            </div>
        </div>
    );
}
