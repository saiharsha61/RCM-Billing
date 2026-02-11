import React, { useState } from 'react';

/**
 * PATIENT DEMOGRAPHICS COMPONENT
 * Phase 1 of eCW V12 Implementation
 */

export function PatientDemographics({
    onSave,
    onCancel,
    initialData = null,
    registrationVector = 'patient_hub',
    providers = [],
    mandatoryConfig = {}
}) {
    // Core Identifiers
    const [lastName, setLastName] = useState(initialData?.LastName || '');
    const [firstName, setFirstName] = useState(initialData?.FirstName || '');
    const [dob, setDob] = useState(initialData?.DOB || '');
    const [gender, setGender] = useState(initialData?.Gender || '');
    const [ssn, setSSN] = useState(initialData?.SSN || '');

    // Contact Information
    const [address1, setAddress1] = useState(initialData?.Address1 || '');
    const [city, setCity] = useState(initialData?.City || '');
    const [state, setState] = useState(initialData?.State || '');
    const [zip, setZip] = useState(initialData?.ZIP || '');
    const [phoneMobile, setPhoneMobile] = useState(initialData?.PhoneMobile || '');
    const [email, setEmail] = useState(initialData?.Email || '');

    // SOGI Data
    const [race, setRace] = useState(initialData?.Race || []);
    const [ethnicity, setEthnicity] = useState(initialData?.Ethnicity || '');
    const [language, setLanguage] = useState(initialData?.Language || 'English');

    // Provider Assignment
    const [pcpNPI, setPcpNPI] = useState(initialData?.PCP_NPI || '');

    const mandatory = {
        lastName: true,
        firstName: true,
        dob: true,
        gender: true,
        ...mandatoryConfig
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    };

    const formatSSN = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
    };

    const handleRaceToggle = (raceValue) => {
        setRace(prev =>
            prev.includes(raceValue)
                ? prev.filter(r => r !== raceValue)
                : [...prev, raceValue]
        );
    };

    const handleSave = () => {
        const patientData = {
            LastName: lastName,
            FirstName: firstName,
            DOB: dob,
            Gender: gender,
            SSN: ssn.replace(/\D/g, ''),
            Address1: address1,
            City: city,
            State: state,
            ZIP: zip,
            PhoneMobile: phoneMobile.replace(/\D/g, ''),
            Email: email,
            Race: race,
            Ethnicity: ethnicity,
            Language: language,
            PCP_NPI: pcpNPI,
            RegistrationVector: registrationVector
        };
        onSave(patientData);
    };

    const isSaveDisabled = () => {
        return !lastName || !firstName || !dob || !gender;
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
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                    {initialData ? 'Edit Patient Demographics' : 'New Patient Registration'}
                </h2>
                <span style={{
                    padding: '4px 12px',
                    backgroundColor: registrationVector === 'scheduler' ? '#fef3c7' : '#e0f2fe',
                    color: registrationVector === 'scheduler' ? '#92400e' : '#075985',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                }}>
                    {registrationVector === 'scheduler' ? 'Quick Registration' : 'Full Registration'}
                </span>
            </div>

            {/* Core Identifiers */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                    Patient Identification <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>(Box 2, Box 3)</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {/* Last Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Last Name {mandatory.lastName && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="Smith"
                        />
                    </div>

                    {/* First Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            First Name {mandatory.firstName && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="John"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Date of Birth {mandatory.dob && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Gender {mandatory.gender && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select...</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                        </select>
                    </div>

                    {/* SSN */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Social Security Number
                        </label>
                        <input
                            type="text"
                            value={ssn}
                            onChange={(e) => setSSN(formatSSN(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'monospace'
                            }}
                            placeholder="###-##-####"
                            maxLength={11}
                        />
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                    Contact Information <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>(Box 5)</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {/* Address */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Address Line 1
                        </label>
                        <input
                            type="text"
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="123 Main Street"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            City
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="New York"
                        />
                    </div>

                    {/* State */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            State
                        </label>
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select...</option>
                            <option value="NY">New York</option>
                            <option value="CA">California</option>
                            <option value="TX">Texas</option>
                            <option value="FL">Florida</option>
                        </select>
                    </div>

                    {/* ZIP */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            ZIP Code
                        </label>
                        <input
                            type="text"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="10001"
                            maxLength={10}
                        />
                    </div>

                    {/* Mobile Phone */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Mobile Phone
                        </label>
                        <input
                            type="tel"
                            value={phoneMobile}
                            onChange={(e) => setPhoneMobile(formatPhone(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'monospace'
                            }}
                            placeholder="(555) 123-4567"
                            maxLength={14}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="john.smith@example.com"
                        />
                    </div>
                </div>
            </div>

            {/* SOGI Data */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f8f9ff', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#4f46e5', margin: 0 }}>
                        SOGI Data (MIPS Compliance)
                    </h3>
                    <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '4px', fontWeight: '600' }}>
                        REQUIRED FOR MIPS
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Race */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Race <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>(Select all that apply)</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                            {['White', 'Black or African American', 'Asian', 'American Indian or Alaska Native', 'Native Hawaiian or Pacific Islander', 'Other'].map((raceOption) => (
                                <label key={raceOption} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={race.includes(raceOption)}
                                        onChange={() => handleRaceToggle(raceOption)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '13px' }}>{raceOption}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Ethnicity */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Ethnicity
                        </label>
                        <select
                            value={ethnicity}
                            onChange={(e) => setEthnicity(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">Select...</option>
                            <option value="Hispanic or Latino">Hispanic or Latino</option>
                            <option value="Not Hispanic or Latino">Not Hispanic or Latino</option>
                            <option value="Declined to Specify">Declined to Specify</option>
                        </select>
                    </div>

                    {/* Language */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Preferred Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="Mandarin">Mandarin</option>
                            <option value="French">French</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Provider Assignment */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                    Provider Assignment
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                            Primary Care Provider (PCP)
                        </label>
                        <select
                            value={pcpNPI}
                            onChange={(e) => setPcpNPI(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select Provider...</option>
                            {providers.map(provider => (
                                <option key={provider.ProviderID} value={provider.NPI}>
                                    {provider.FirstName} {provider.LastName}, {provider.Credentials}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

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
                    disabled={isSaveDisabled()}
                    style={{
                        padding: '12px 32px',
                        backgroundColor: isSaveDisabled() ? '#cbd5e1' : '#a941c6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isSaveDisabled() ? 'not-allowed' : 'pointer',
                        opacity: isSaveDisabled() ? 0.5 : 1
                    }}
                >
                    {isSaveDisabled() ? '! Complete Required Fields' : 'Save Patient'}
                </button>
            </div>
        </div>
    );
}
