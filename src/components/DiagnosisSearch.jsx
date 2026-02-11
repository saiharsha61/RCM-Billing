import React, { useState, useEffect } from 'react';

/**
 * DIAGNOSIS SEARCH COMPONENT (ICD-10)
 * Allows searching and selecting diagnosis codes.
 * Includes "Favorites" and smart search.
 */

// Expanded Mock ICD-10 Database
const ICD10_DATABASE = [
    { code: 'J01.90', desc: 'Acute sinusitis, unspecified', category: 'ENT' },
    { code: 'J01.00', desc: 'Acute maxillary sinusitis, unspecified', category: 'ENT' },
    { code: 'R05', desc: 'Cough', category: 'General' },
    { code: 'R06.02', desc: 'Shortness of breath', category: 'General' },
    { code: 'Z00.00', desc: 'Encounter for general adult medical exam', category: 'Wellness' },
    { code: 'Z00.129', desc: 'Encounter for routine child health exam', category: 'Wellness' },
    { code: 'I10', desc: 'Essential (primary) hypertension', category: 'Cardiology' },
    { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', category: 'Endocrinology' },
    { code: 'M54.5', desc: 'Low back pain', category: 'Musculoskeletal' },
    { code: 'B34.9', desc: 'Viral infection, unspecified', category: 'General' }
];

export function DiagnosisSearch({ onSelect, selectedCodes = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [favorites, setFavorites] = useState(ICD10_DATABASE.filter(d => ['I10', 'E11.9', 'Z00.00'].includes(d.code))); // Mock favorites

    useEffect(() => {
        if (!searchTerm) {
            setResults([]);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = ICD10_DATABASE.filter(item =>
            item.code.toLowerCase().includes(lowerTerm) ||
            item.desc.toLowerCase().includes(lowerTerm)
        );
        setResults(filtered);
    }, [searchTerm]);

    const handleSelect = (diagnosis) => {
        // Prevent duplicates
        if (selectedCodes.some(c => c.code === diagnosis.code)) return;
        onSelect(diagnosis);
        setSearchTerm(''); // Optional: clear search after selection
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
            {/* Search Bar */}
            <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                    Assessments (ICD-10)
                </div>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search code or description..."
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 32px', // Space for icon
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}>🔍</span>
                </div>
            </div>

            {/* Results / Favorites List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {searchTerm ? (
                    // Search Results
                    <>
                        <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>
                            Search Results ({results.length})
                        </div>
                        {results.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                No codes found.
                            </div>
                        )}
                        {results.map(dx => (
                            <DiagnosisItem
                                key={dx.code}
                                diagnosis={dx}
                                onSelect={() => handleSelect(dx)}
                                isSelected={selectedCodes.some(c => c.code === dx.code)}
                            />
                        ))}
                    </>
                ) : (
                    // Favorites (Default View)
                    <>
                        <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                            <span>My Favorites</span>
                            <span style={{ cursor: 'pointer', color: '#a941c6' }}>Manage</span>
                        </div>
                        {favorites.map(dx => (
                            <DiagnosisItem
                                key={dx.code}
                                diagnosis={dx}
                                onSelect={() => handleSelect(dx)}
                                isSelected={selectedCodes.some(c => c.code === dx.code)}
                                isFavorite={true}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Selected Summary (Mini footer if needed, or handled by parent) */}
        </div>
    );
}

function DiagnosisItem({ diagnosis, onSelect, isSelected, isFavorite }) {
    return (
        <div
            onClick={!isSelected ? onSelect : undefined}
            style={{
                padding: '10px 12px',
                borderBottom: '1px solid #f1f5f9',
                cursor: isSelected ? 'default' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                opacity: isSelected ? 0.6 : 1,
                transition: 'background-color 0.1s'
            }}
            onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <div style={{ flex: 1, marginRight: '12px' }}>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>
                    {diagnosis.desc}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontWeight: '600', color: '#334155' }}>{diagnosis.code}</span>
                    <span>• {diagnosis.category}</span>
                </div>
            </div>
            {isFavorite && (
                <span style={{ fontSize: '12px', color: '#eab308' }} title="Favorite">★</span>
            )}
            {isSelected && (
                <span style={{ fontSize: '14px', color: '#3b82f6' }}>✓</span>
            )}
        </div>
    );
}
