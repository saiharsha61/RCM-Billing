import React, { useState } from 'react';
import { DiagnosisSearch } from './DiagnosisSearch';
import { ProcedureGrid } from './ProcedureGrid';
import { EMLevelWizard } from './EMLevelWizard';

/**
 * TREATMENT WINDOW (Electronic Superbill)
 * Core clinical encounter interface for capturing charges, diagnoses, and procedures.
 * Replicates the eCW "Treatment" screen functionality.
 */

export function TreatmentWindow({ patient, encounterId, onSave }) {
    const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
    const [selectedProcedures, setSelectedProcedures] = useState([]);
    const [visitType, setVisitType] = useState('99213'); // Default E&M
    const [showEMWizard, setShowEMWizard] = useState(false);

    const handleCheckDiagnosis = (diagnosis) => {
        // Toggle selection
        if (selectedDiagnoses.some(d => d.code === diagnosis.code)) {
            setSelectedDiagnoses(prev => prev.filter(d => d.code !== diagnosis.code));
        } else {
            setSelectedDiagnoses(prev => [...prev, diagnosis]);
        }
    };

    const handleAddProcedure = (proc) => {
        setSelectedProcedures(prev => [...prev, proc]);
    };

    const handleRemoveProcedure = (index) => {
        setSelectedProcedures(prev => prev.filter((_, i) => i !== index));
    };

    // Calculate Total Real-time
    const totalCharges = selectedProcedures.reduce((sum, item) => sum + item.fee, 0);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#f8fafc',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* 1. Encounter Header */}
            <div style={{
                padding: '16px 24px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Clinical Encounter</h2>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
                        <span><strong>Patient:</strong> {patient?.FirstName} {patient?.LastName}</span>
                        <span><strong>DOB:</strong> {patient?.DOB}</span>
                        <span><strong>DOS:</strong> {new Date().toLocaleDateString()}</span>
                        <span><strong>Provider:</strong> Dr. Cara Erkut</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div
                        onClick={() => setShowEMWizard(!showEMWizard)}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            border: '1px solid #dbeafe',
                            cursor: 'pointer',
                            position: 'relative',
                            userSelect: 'none'
                        }}>
                        Visit: {visitType}
                        {showEMWizard && (
                            <EMLevelWizard
                                onClose={(e) => {
                                    e.stopPropagation();
                                    setShowEMWizard(false);
                                }}
                                onSelectCode={(result) => {
                                    setVisitType(result.code);
                                    handleAddProcedure(result); // Auto-add the E&M code to the grid
                                    // Don't close immediately in case they want to adjust
                                    // But typically we would close
                                }}
                            />
                        )}
                    </div>
                    <button style={{
                        padding: '8px 16px',
                        backgroundColor: '#a941c6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        Sign & Lock
                    </button>
                </div>
            </div>

            {/* 2. Main Workspace (3-Pane Layout) */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Left Pane: Diagnosis (ICD-10) */}
                <div style={{
                    flex: '1',
                    minWidth: '300px',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#fff'
                }}>
                    <DiagnosisSearch
                        onSelect={handleCheckDiagnosis}
                        selectedCodes={selectedDiagnoses}
                    />
                </div>

                <div style={{
                    flex: '1.5',
                    minWidth: '400px',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#fff'
                }}>
                    <ProcedureGrid
                        selectedProcedures={selectedProcedures}
                        onAddProcedure={handleAddProcedure}
                        onRemoveProcedure={handleRemoveProcedure}
                        selectedDiagnoses={selectedDiagnoses}
                    />
                </div>

                {/* Right Pane: Summary & E&M Helper */}
                <div style={{
                    flex: '0.8',
                    minWidth: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#334155' }}>
                        Charge Summary
                    </div>
                    <div style={{ padding: '16px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#64748b' }}>Procedures:</span>
                            <span style={{ fontWeight: '600' }}>{selectedProcedures.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#64748b' }}>Diagnoses:</span>
                            <span style={{ fontWeight: '600' }}>{selectedDiagnoses.length}</span>
                        </div>
                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '16px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '18px' }}>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>Total:</span>
                            <span style={{ fontWeight: '700', color: '#16a34a' }}>
                                ${totalCharges.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TreatmentWindow;
