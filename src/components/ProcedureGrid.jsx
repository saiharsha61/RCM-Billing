import React, { useState, useEffect } from 'react';

/**
 * PROCEDURE GRID COMPONENT (CPT)
 * Manages CPT code selection, modifiers, fees, and diagnosis linking.
 */

// Mock CPT Database
const CPT_DATABASE = [
    { code: '99203', desc: 'Office Visit New, Level 3', fee: 180.00 },
    { code: '99204', desc: 'Office Visit New, Level 4', fee: 260.00 },
    { code: '99213', desc: 'Office Visit Est, Level 3', fee: 120.00 },
    { code: '99214', desc: 'Office Visit Est, Level 4', fee: 185.00 },
    { code: '93000', desc: 'Electrocardiogram, complete', fee: 45.00 },
    { code: '36415', desc: 'Venipuncture', fee: 15.00 },
    { code: '85025', desc: 'CBC with Differential', fee: 28.00 },
    { code: '80053', desc: 'Comprehensive Metabolic Panel', fee: 35.00 },
    { code: '90471', desc: 'Immunization admin', fee: 30.00 }
];

export function ProcedureGrid({ selectedProcedures, onAddProcedure, onRemoveProcedure, selectedDiagnoses = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = CPT_DATABASE.filter(p =>
            p.code.includes(lower) || p.desc.toLowerCase().includes(lower)
        );
        setSearchResults(filtered);
    }, [searchTerm]);

    const handleSearchSelect = (proc) => {
        // Initialize with default values
        onAddProcedure({
            ...proc,
            modifiers: [],
            dxPointers: [1], // Default point to primary dx
            units: 1
        });
        setSearchTerm(''); // Clear search
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                    Treatment Plan (CPT)
                </div>
                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Add procedure (e.g. 99213)..."
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />

                    {/* Search Dropdown */}
                    {searchResults.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            zIndex: 10,
                            marginTop: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {searchResults.map(p => (
                                <div
                                    key={p.code}
                                    onClick={() => handleSearchSelect(p)}
                                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                    <span style={{ fontWeight: '600', marginRight: '8px' }}>{p.code}</span>
                                    <span style={{ color: '#475569' }}>{p.desc}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                        <tr style={{ fontSize: '12px', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '10px 12px', width: '60px' }}>Code</th>
                            <th style={{ padding: '10px 12px' }}>Description</th>
                            <th style={{ padding: '10px 12px', width: '60px' }}>Mod</th>
                            <th style={{ padding: '10px 12px', width: '80px' }}>Fee</th>
                            <th style={{ padding: '10px 12px', width: '100px' }}>Dx Link</th>
                            <th style={{ padding: '10px 12px', width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProcedures.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                                    No procedures added.
                                </td>
                            </tr>
                        )}
                        {selectedProcedures.map((proc, idx) => (
                            <tr key={`${proc.code}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{proc.code}</td>
                                <td style={{ padding: '12px', fontSize: '14px' }}>{proc.desc}</td>
                                <td style={{ padding: '12px' }}>
                                    <input
                                        type="text"
                                        placeholder="25"
                                        style={{ width: '40px', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '12px' }}>${proc.fee.toFixed(2)}</td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[1, 2, 3, 4].map(n => {
                                            const isActive = proc.dxPointers.includes(n);
                                            // Check if we even have a diagnosis at this index
                                            const hasDxAtIndex = selectedDiagnoses[n - 1];

                                            return (
                                                <div
                                                    key={n}
                                                    title={hasDxAtIndex ? `${hasDxAtIndex.code} - ${hasDxAtIndex.desc}` : 'No Dx'}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                                                        backgroundColor: isActive ? '#eff6ff' : (hasDxAtIndex ? 'white' : '#f1f5f9'),
                                                        color: isActive ? '#2563eb' : '#94a3b8',
                                                        borderRadius: '2px',
                                                        fontSize: '11px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: hasDxAtIndex ? 'pointer' : 'default',
                                                        fontWeight: isActive ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    {n}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button
                                        onClick={() => onRemoveProcedure(idx)}
                                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
