import React, { useState } from 'react';

/**
 * SMART FORMS - Template-based charge capture
 * Auto-drops diagnoses and procedures based on common clinical scenarios
 */

// Pre-configured smart form templates
const SMART_FORM_TEMPLATES = {
    strep: {
        id: 'strep',
        name: 'Strep Throat',
        category: 'Infection',
        icon: '🦠',
        diagnoses: [
            { code: 'J02.0', description: 'Streptococcal pharyngitis' }
        ],
        procedures: [
            { code: '99213', description: 'Office visit - established, level 3', fee: 125 },
            { code: '87880', description: 'Rapid strep test', fee: 25 }
        ]
    },
    uti: {
        id: 'uti',
        name: 'UTI (Urinary Tract Infection)',
        category: 'Infection',
        icon: '💧',
        diagnoses: [
            { code: 'N39.0', description: 'Urinary tract infection, site not specified' }
        ],
        procedures: [
            { code: '99213', description: 'Office visit - established, level 3', fee: 125 },
            { code: '81003', description: 'Urinalysis, automated', fee: 15 }
        ]
    },
    wellness: {
        id: 'wellness',
        name: 'Annual Wellness Visit',
        category: 'Preventive',
        icon: '🏥',
        diagnoses: [
            { code: 'Z00.00', description: 'Encounter for general adult medical exam without abnormal findings' }
        ],
        procedures: [
            { code: '99395', description: 'Preventive visit, 18-39 years', fee: 195 },
            { code: '36415', description: 'Venipuncture', fee: 12 }
        ]
    },
    diabetes: {
        id: 'diabetes',
        name: 'Diabetes Follow-up',
        category: 'Chronic',
        icon: '🩸',
        diagnoses: [
            { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' }
        ],
        procedures: [
            { code: '99214', description: 'Office visit - established, level 4', fee: 175 },
            { code: '83036', description: 'Hemoglobin A1C', fee: 35 }
        ]
    },
    hypertension: {
        id: 'hypertension',
        name: 'Hypertension Follow-up',
        category: 'Chronic',
        icon: '❤️',
        diagnoses: [
            { code: 'I10', description: 'Essential (primary) hypertension' }
        ],
        procedures: [
            { code: '99213', description: 'Office visit - established, level 3', fee: 125 }
        ]
    },
    backPain: {
        id: 'backPain',
        name: 'Low Back Pain',
        category: 'Musculoskeletal',
        icon: '🦴',
        diagnoses: [
            { code: 'M54.5', description: 'Low back pain' }
        ],
        procedures: [
            { code: '99213', description: 'Office visit - established, level 3', fee: 125 },
            { code: '20552', description: 'Trigger point injection, 1-2 muscles', fee: 85 }
        ]
    },
    flu: {
        id: 'flu',
        name: 'Influenza',
        category: 'Infection',
        icon: '🤒',
        diagnoses: [
            { code: 'J11.1', description: 'Influenza with other respiratory manifestations' }
        ],
        procedures: [
            { code: '99213', description: 'Office visit - established, level 3', fee: 125 },
            { code: '87804', description: 'Rapid flu test', fee: 30 }
        ]
    },
    allergies: {
        id: 'allergies',
        name: 'Allergic Rhinitis',
        category: 'Allergy',
        icon: '🤧',
        diagnoses: [
            { code: 'J30.9', description: 'Allergic rhinitis, unspecified' }
        ],
        procedures: [
            { code: '99213', description: 'Office visit - established, level 3', fee: 125 }
        ]
    }
};

export function SmartForms({ onApplyTemplate, patient }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const categories = ['all', 'Infection', 'Preventive', 'Chronic', 'Musculoskeletal', 'Allergy'];

    const templates = Object.values(SMART_FORM_TEMPLATES);

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleApply = (template) => {
        if (onApplyTemplate) {
            onApplyTemplate({
                diagnoses: template.diagnoses,
                procedures: template.procedures,
                templateName: template.name
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
                📋 Smart Forms
            </h2>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: selectedCategory === cat ? '#a941c6' : 'white',
                                color: selectedCategory === cat ? 'white' : '#64748b',
                                border: `2px solid ${selectedCategory === cat ? '#a941c6' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {filteredTemplates.map(template => (
                    <div
                        key={template.id}
                        onClick={() => setPreviewTemplate(template)}
                        style={{
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '2px solid',
                            borderColor: previewTemplate?.id === template.id ? '#a941c6' : '#e2e8f0',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{template.icon}</div>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: '#0f172a' }}>
                            {template.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                            {template.category}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {template.diagnoses.length} Dx • {template.procedures.length} CPT
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Panel */}
            {previewTemplate && (
                <div style={{
                    marginTop: '24px',
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px solid #a941c6'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                            {previewTemplate.icon} {previewTemplate.name}
                        </h3>
                        <button
                            onClick={() => handleApply(previewTemplate)}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ✓ Apply Template
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Diagnoses */}
                        <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                                Diagnoses (ICD-10)
                            </h4>
                            {previewTemplate.diagnoses.map((dx, idx) => (
                                <div key={idx} style={{
                                    padding: '10px 14px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#a941c6' }}>{dx.code}</span>
                                    <span style={{ marginLeft: '12px', color: '#0f172a' }}>{dx.description}</span>
                                </div>
                            ))}
                        </div>

                        {/* Procedures */}
                        <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                                Procedures (CPT)
                            </h4>
                            {previewTemplate.procedures.map((proc, idx) => (
                                <div key={idx} style={{
                                    padding: '10px 14px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#0004d0' }}>{proc.code}</span>
                                        <span style={{ marginLeft: '12px', color: '#0f172a' }}>{proc.description}</span>
                                    </div>
                                    <span style={{ fontWeight: '600', color: '#10b981' }}>${proc.fee}</span>
                                </div>
                            ))}
                            <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '8px',
                                textAlign: 'right'
                            }}>
                                <span style={{ color: '#1e40af' }}>Total: </span>
                                <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>
                                    ${previewTemplate.procedures.reduce((sum, p) => sum + p.fee, 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * SMART FORM ADMIN - Create/Edit Templates
 */
export function SmartFormAdmin({ templates = SMART_FORM_TEMPLATES, onSave }) {
    const [editingTemplate, setEditingTemplate] = useState(null);

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0004d0', margin: 0 }}>
                    ⚙️ Smart Form Templates
                </h2>
                <button style={{
                    padding: '10px 20px',
                    backgroundColor: '#a941c6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    + New Template
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                        <th style={{ padding: '14px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Template</th>
                        <th style={{ padding: '14px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '14px', textAlign: 'center', color: '#0004d0', fontWeight: '600' }}>Dx</th>
                        <th style={{ padding: '14px', textAlign: 'center', color: '#0004d0', fontWeight: '600' }}>CPT</th>
                        <th style={{ padding: '14px', textAlign: 'right', color: '#0004d0', fontWeight: '600' }}>Est. Charge</th>
                        <th style={{ padding: '14px', textAlign: 'center', color: '#0004d0', fontWeight: '600' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(templates).map(template => (
                        <tr key={template.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px' }}>
                                <span style={{ marginRight: '10px' }}>{template.icon}</span>
                                <span style={{ fontWeight: '600' }}>{template.name}</span>
                            </td>
                            <td style={{ padding: '14px', color: '#64748b' }}>{template.category}</td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>{template.diagnoses.length}</td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>{template.procedures.length}</td>
                            <td style={{ padding: '14px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                                ${template.procedures.reduce((sum, p) => sum + p.fee, 0)}
                            </td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>
                                <button style={{
                                    padding: '6px 12px',
                                    marginRight: '8px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}>
                                    Edit
                                </button>
                                <button style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { SMART_FORM_TEMPLATES };
export default SmartForms;
