import React, { useState } from 'react';

/**
 * PATIENT KIOSK - Self-Service Data Entry
 * Allows patients to enter/verify their own information
 * Patient-entered data is flagged with orange highlighting for staff review
 */

export function PatientKiosk({ onSubmit, onCancel }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Demographics
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        phone: '',
        email: '',
        // Address
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        // Insurance
        insuranceName: '',
        memberId: '',
        groupNumber: '',
        subscriberName: '',
        subscriberDob: '',
        relationship: 'Self',
        // Emergency Contact
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: ''
    });

    const totalSteps = 4;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        // Mark all data as patient-entered for staff review
        const submissionData = {
            ...formData,
            _patientEntered: true,
            _enteredAt: new Date().toISOString(),
            _reviewStatus: 'pending'
        };
        onSubmit(submissionData);
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '16px',
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#0f172a',
        fontSize: '15px'
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f7f9ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,4,208,0.1)',
                width: '100%',
                maxWidth: '700px',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '32px',
                    background: 'linear-gradient(135deg, #a941c6 0%, #0004d0 100%)',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                        Patient Check-In
                    </h1>
                    <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
                        Please verify your information
                    </p>
                </div>

                {/* Progress Bar */}
                <div style={{ padding: '20px 32px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        {['Demographics', 'Address', 'Insurance', 'Review'].map((label, idx) => (
                            <div key={idx} style={{
                                flex: 1,
                                textAlign: 'center',
                                color: step > idx ? '#10b981' : step === idx + 1 ? '#a941c6' : '#94a3b8',
                                fontWeight: step === idx + 1 ? '700' : '500',
                                fontSize: '13px'
                            }}>
                                {step > idx + 1 ? '✓ ' : ''}{label}
                            </div>
                        ))}
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${(step / totalSteps) * 100}%`,
                            backgroundColor: '#a941c6',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>

                {/* Form Content */}
                <div style={{ padding: '32px' }}>
                    {/* Step 1: Demographics */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                Personal Information
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>First Name *</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        style={inputStyle}
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name *</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Smith"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleChange('dob', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Gender *</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleChange('gender', e.target.value)}
                                        style={inputStyle}
                                    >
                                        <option value="">Select...</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                        <option value="O">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        style={inputStyle}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        style={inputStyle}
                                        placeholder="john@email.com"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Address */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                Address Information
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Street Address *</label>
                                    <input
                                        type="text"
                                        value={formData.address1}
                                        onChange={(e) => handleChange('address1', e.target.value)}
                                        style={inputStyle}
                                        placeholder="123 Main Street"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Apartment, Suite, etc.</label>
                                    <input
                                        type="text"
                                        value={formData.address2}
                                        onChange={(e) => handleChange('address2', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Apt 4B"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>City *</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => handleChange('city', e.target.value)}
                                            style={inputStyle}
                                            placeholder="Charleston"
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>State *</label>
                                        <select
                                            value={formData.state}
                                            onChange={(e) => handleChange('state', e.target.value)}
                                            style={inputStyle}
                                        >
                                            <option value="">...</option>
                                            <option value="AL">AL</option>
                                            <option value="CA">CA</option>
                                            <option value="FL">FL</option>
                                            <option value="GA">GA</option>
                                            <option value="NY">NY</option>
                                            <option value="SC">SC</option>
                                            <option value="TX">TX</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>ZIP *</label>
                                        <input
                                            type="text"
                                            value={formData.zip}
                                            onChange={(e) => handleChange('zip', e.target.value)}
                                            style={inputStyle}
                                            placeholder="29401"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Insurance */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                Insurance Information
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Insurance Company *</label>
                                        <input
                                            type="text"
                                            value={formData.insuranceName}
                                            onChange={(e) => handleChange('insuranceName', e.target.value)}
                                            style={inputStyle}
                                            placeholder="Blue Cross Blue Shield"
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Member ID *</label>
                                        <input
                                            type="text"
                                            value={formData.memberId}
                                            onChange={(e) => handleChange('memberId', e.target.value)}
                                            style={inputStyle}
                                            placeholder="ABC123456789"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Group Number</label>
                                        <input
                                            type="text"
                                            value={formData.groupNumber}
                                            onChange={(e) => handleChange('groupNumber', e.target.value)}
                                            style={inputStyle}
                                            placeholder="GRP12345"
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Relationship to Subscriber</label>
                                        <select
                                            value={formData.relationship}
                                            onChange={(e) => handleChange('relationship', e.target.value)}
                                            style={inputStyle}
                                        >
                                            <option value="Self">Self</option>
                                            <option value="Spouse">Spouse</option>
                                            <option value="Child">Child</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                {formData.relationship !== 'Self' && (
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#fef3c7',
                                        borderRadius: '10px',
                                        border: '1px solid #f59e0b'
                                    }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
                                            Subscriber Information
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '13px' }}>Subscriber Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.subscriberName}
                                                    onChange={(e) => handleChange('subscriberName', e.target.value)}
                                                    style={{ ...inputStyle, padding: '10px 14px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '13px' }}>Subscriber DOB</label>
                                                <input
                                                    type="date"
                                                    value={formData.subscriberDob}
                                                    onChange={(e) => handleChange('subscriberDob', e.target.value)}
                                                    style={{ ...inputStyle, padding: '10px 14px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                Review Your Information
                            </h2>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <ReviewField label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                                    <ReviewField label="Date of Birth" value={formData.dob} />
                                    <ReviewField label="Phone" value={formData.phone} />
                                    <ReviewField label="Email" value={formData.email || 'Not provided'} />
                                    <ReviewField label="Address" value={`${formData.address1}, ${formData.city}, ${formData.state} ${formData.zip}`} />
                                    <ReviewField label="Insurance" value={formData.insuranceName} />
                                    <ReviewField label="Member ID" value={formData.memberId} />
                                    <ReviewField label="Relationship" value={formData.relationship} />
                                </div>
                            </div>
                            <div style={{
                                marginTop: '20px',
                                padding: '16px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '10px',
                                border: '1px solid #3b82f6',
                                fontSize: '14px',
                                color: '#1e40af'
                            }}>
                                <strong>📝 Note:</strong> A staff member will verify this information before your appointment.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div style={{
                    padding: '24px 32px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc'
                }}>
                    <button
                        onClick={step === 1 ? onCancel : handleBack}
                        style={{
                            padding: '14px 28px',
                            backgroundColor: 'white',
                            color: '#64748b',
                            border: '2px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {step === 1 ? 'Cancel' : '← Back'}
                    </button>
                    <button
                        onClick={step === totalSteps ? handleSubmit : handleNext}
                        style={{
                            padding: '14px 32px',
                            backgroundColor: '#a941c6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(169,65,198,0.3)'
                        }}
                    >
                        {step === totalSteps ? 'Submit ✓' : 'Continue →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReviewField({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                {label}
            </div>
            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>
                {value || '-'}
            </div>
        </div>
    );
}

/**
 * PATIENT REVIEW QUEUE - Staff Interface
 * Shows patient-entered data with orange highlighting for review
 */
export function PatientReviewQueue({ submissions = [], onAccept, onReject, onEdit }) {
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // Mock submissions data
    const mockSubmissions = submissions.length ? submissions : [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Smith',
            dob: '1985-03-15',
            phone: '(555) 123-4567',
            insuranceName: 'Blue Cross',
            memberId: 'BCX123456',
            _enteredAt: '2024-01-20T14:30:00',
            _reviewStatus: 'pending'
        },
        {
            id: 2,
            firstName: 'Sarah',
            lastName: 'Johnson',
            dob: '1990-07-22',
            phone: '(555) 987-6543',
            insuranceName: 'Aetna',
            memberId: 'AET789012',
            _enteredAt: '2024-01-20T15:45:00',
            _reviewStatus: 'pending'
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 8px 0' }}>
                        Patient Self-Service Review
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Review and approve patient-entered information
                    </p>
                </div>
                <div style={{
                    padding: '8px 16px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                }}>
                    {mockSubmissions.filter(s => s._reviewStatus === 'pending').length} Pending Review
                </div>
            </div>

            {/* Submissions Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Patient</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>DOB</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Insurance</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Submitted</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockSubmissions.map(sub => (
                            <tr key={sub.id} style={{
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: sub._reviewStatus === 'pending' ? '#fffbeb' : 'white'
                            }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f59e0b'
                                        }} />
                                        <span style={{ fontWeight: '600', color: '#0f172a' }}>
                                            {sub.firstName} {sub.lastName}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', color: '#64748b' }}>{sub.dob}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '500' }}>{sub.insuranceName}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{sub.memberId}</div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                                    {new Date(sub._enteredAt).toLocaleString()}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onAccept && onAccept(sub)}
                                            style={{
                                                padding: '6px 14px',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✓ Accept
                                        </button>
                                        <button
                                            onClick={() => onEdit && onEdit(sub)}
                                            style={{
                                                padding: '6px 14px',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✎ Edit
                                        </button>
                                        <button
                                            onClick={() => onReject && onReject(sub)}
                                            style={{
                                                padding: '6px 14px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '3px' }} />
                    Patient-entered (needs review)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '3px' }} />
                    Reviewed/Approved
                </span>
            </div>
        </div>
    );
}

export default PatientKiosk;
