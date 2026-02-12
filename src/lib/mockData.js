// Mock Data - ECW-Style RCM System
// Matches schema.js structure exactly

/**
 * PROVIDERS
 */
export const providers = [
    {
        ProviderID: 1,
        FirstName: 'Sarah',
        LastName: 'Johnson',
        MiddleName: 'M',
        Credentials: 'MD',
        NPI: '1234567890',
        TaxID: '12-3456789',
        LicenseNumber: 'MD12345',
        DEA: 'BJ1234563',
        SpecialtyType: 'Internal Medicine',
        TaxonomyCode: '207R00000X',
        Phone: '(555) 123-4567',
        Fax: '(555) 123-4568',
        Email: 'sjohnson@clinic.com',
        IsActive: true,
        CreatedDate: '2023-01-15T10:00:00Z'
    },
    {
        ProviderID: 2,
        FirstName: 'Michael',
        LastName: 'Chen',
        MiddleName: 'K',
        Credentials: 'DO',
        NPI: '9876543210',
        TaxID: '98-7654321',
        LicenseNumber: 'DO54321',
        DEA: 'BC9876543',
        SpecialtyType: 'Family Medicine',
        TaxonomyCode: '207Q00000X',
        Phone: '(555) 987-6543',
        Email: 'mchen@clinic.com',
        IsActive: true,
        CreatedDate: '2023-03-20T10:00:00Z'
    },
    {
        ProviderID: 3,
        FirstName: 'Emily',
        LastName: 'Rodriguez',
        Credentials: 'NP',
        NPI: '5555555555',
        TaxID: '55-5555555',
        LicenseNumber: 'NP55555',
        SpecialtyType: 'Cardiology',
        TaxonomyCode: '207RC0000X',
        Phone: '(555) 555-5555',
        Email: 'erodriguez@cardio.com',
        IsActive: true,
        CreatedDate: '2023-06-10T10:00:00Z'
    }
];

/**
 * PATIENTS
 */
export const patients = [
    {
        PatientID: 1001,
        AccountNo: 'PT-1001',
        GuarantorID: 1001, // Self
        FirstName: 'Robert',
        MiddleName: 'J',
        LastName: 'Kowalski',
        DOB: '1985-03-15',
        SSN: '123-45-6789',
        Gender: 'M',
        Address1: '123 Main Street',
        Address2: 'Apt 4B',
        City: 'Chicago',
        State: 'IL',
        ZipCode: '60601',
        Phone: '(555) 123-4567',
        Email: 'rkowalski@email.com',
        Height_cm: 175.5,
        Weight_kg: 82.3,
        HeadCircumference: null,
        CreatedDate: '2024-01-15T09:30:00Z',
        ModifiedDate: '2024-01-20T14:15:00Z',
        CreatedBy: 1,
        ModifiedBy: 1
    },
    {
        PatientID: 1002,
        AccountNo: 'PT-1002',
        GuarantorID: 1002,
        FirstName: 'Sarah',
        MiddleName: 'Anne',
        LastName: 'Johnson',
        DOB: '1992-07-22',
        SSN: '987-65-4321',
        Gender: 'F',
        Address1: '456 Oak Avenue',
        City: 'Springfield',
        State: 'IL',
        ZipCode: '62701',
        Phone: '(555) 987-6543',
        Email: 'sjohnson@email.com',
        Height_cm: 165.0,
        Weight_kg: 68.5,
        HeadCircumference: null,
        CreatedDate: '2024-02-01T10:00:00Z',
        ModifiedDate: '2024-02-01T10:00:00Z',
        CreatedBy: 1,
        ModifiedBy: 1
    },
    {
        PatientID: 1003,
        AccountNo: 'PT-1003',
        GuarantorID: 1004, // Parent is guarantor
        FirstName: 'Emma',
        MiddleName: 'Grace',
        LastName: 'Williams',
        DOB: '2020-11-08',
        SSN: '555-44-3333',
        Gender: 'F',
        Address1: '789 Elm Street',
        City: 'Naperville',
        State: 'IL',
        ZipCode: '60540',
        Phone: '(555) 345-6789',
        Email: 'ewilliams@email.com',
        Height_cm: 95.5,
        Weight_kg: 15.2,
        HeadCircumference: 48.5, // Item Key 0833_DMJ
        CreatedDate: '2024-03-10T11:00:00Z',
        ModifiedDate: '2024-03-10T11:00:00Z',
        CreatedBy: 2,
        ModifiedBy: 2
    }
];

/**
 * INSURANCE DATA
 */
export const insurances = [
    {
        InsuranceID: 501,
        PatientID: 1001,
        InsuranceName: 'Blue Cross Blue Shield of Illinois',
        PayerID: 'BCBSIL',
        PlanType: 'PPO',
        Priority: 1,
        PolicyNumber: 'ABC123456789',
        GroupNumber: 'GRP1001',
        SubscriberID: 'ABC123456789',
        SubscriberName: 'Robert J Kowalski',
        SubscriberDOB: '1985-03-15',
        RelationshipToSubscriber: 'Self',
        Copay: 25.00,
        Deductible: 1500.00,
        DeductibleMet: 450.00,
        OOPMax: 6000.00,
        OOPMet: 750.00,
        EffectiveDate: '2024-01-01',
        TerminationDate: '2024-12-31',
        LastVerified: '2024-10-25T14:30:00Z',
        VerifiedBy: 1
    },
    {
        InsuranceID: 502,
        PatientID: 1002,
        InsuranceName: 'UnitedHealthcare',
        PayerID: 'UHC',
        PlanType: 'HMO',
        Priority: 1,
        PolicyNumber: 'UHC987654321',
        GroupNumber: 'GRP2002',
        SubscriberID: 'UHC987654321',
        SubscriberName: 'Sarah Anne Johnson',
        SubscriberDOB: '1992-07-22',
        RelationshipToSubscriber: 'Self',
        Copay: 20.00,
        Deductible: 2000.00,
        DeductibleMet: 1200.00,
        OOPMax: 5000.00,
        OOPMet: 1500.00,
        EffectiveDate: '2024-01-01',
        TerminationDate: '2024-12-31',
        LastVerified: '2024-10-28T09:15:00Z',
        VerifiedBy: 1
    },
    {
        InsuranceID: 503,
        PatientID: 1003,
        InsuranceName: 'Aetna',
        PayerID: 'AETNA',
        PlanType: 'PPO',
        Priority: 1,
        PolicyNumber: 'AET555444333',
        GroupNumber: 'GRP3003',
        SubscriberID: 'AET555444333',
        SubscriberName: 'David Williams', // Parent
        SubscriberDOB: '1988-05-12',
        RelationshipToSubscriber: 'Child',
        Copay: 15.00,
        Deductible: 1000.00,
        DeductibleMet: 200.00,
        OOPMax: 4000.00,
        OOPMet: 350.00,
        EffectiveDate: '2024-01-01',
        TerminationDate: '2024-12-31',
        LastVerified: '2024-10-29T10:00:00Z',
        VerifiedBy: 2
    }
];

/**
 * REFERRALS & AUTHORIZATIONS
 */
export const referrals = [
    {
        ReferralID: 2001,
        PatientID: 1001,
        ReferringProviderID: 1, // Dr. Johnson
        RefToID: 3, // Emily Rodriguez (Cardiologist)
        SpecialtyType: 'Cardiology',
        AuthNo: 'AUTH-2024-001234',
        AuthStatus: 'Approved',
        VisitsAllowed: 6,
        VisitsUsed: 2,
        VisitsRemaining: 4,
        StartDate: '2024-10-01',
        EndDate: '2025-03-31',
        Diagnosis: 'Chest Pain',
        ICD10Codes: ['R07.9', 'I25.10'],
        ReasonForReferral: 'Evaluate for coronary artery disease',
        ReferralStatus: 'Active',
        CreatedDate: '2024-09-25T14:00:00Z',
        ApprovedDate: '2024-09-28T10:00:00Z'
    },
    {
        ReferralID: 2002,
        PatientID: 1002,
        ReferringProviderID: 2, // Dr. Chen
        RefToID: 3,
        SpecialtyType: 'Cardiology',
        AuthNo: 'AUTH-2024-005678',
        AuthStatus: 'Approved',
        VisitsAllowed: 3,
        VisitsUsed: 0,
        VisitsRemaining: 3,
        StartDate: '2024-11-01',
        EndDate: '2025-04-30',
        Diagnosis: 'Palpitations',
        ICD10Codes: ['R00.2'],
        ReasonForReferral: 'Cardiac rhythm evaluation',
        ReferralStatus: 'Active',
        CreatedDate: '2024-10-20T11:00:00Z',
        ApprovedDate: '2024-10-25T09:00:00Z'
    }
];

/**
 * ENCOUNTERS
 */
export const encounters = [
    {
        EncounterID: 3001,
        PatientID: 1001,
        ProviderID: 1,
        EncounterDate: '2024-10-15',
        EncounterType: 'Office Visit',
        PlaceOfService: '11', // Office
        ChiefComplaint: 'Annual physical exam',
        DiagnosisCodes: ['Z00.00', 'E11.9', 'I10'],
        EncounterStatus: 'Complete',
        SignedBy: 1,
        SignedDate: '2024-10-15T16:00:00Z'
    },
    {
        EncounterID: 3002,
        PatientID: 1002,
        ProviderID: 2,
        EncounterDate: '2024-10-20',
        EncounterType: 'Office Visit',
        PlaceOfService: '11',
        ChiefComplaint: 'Follow-up for hypertension',
        DiagnosisCodes: ['I10', 'E78.5'],
        EncounterStatus: 'Complete',
        SignedBy: 2,
        SignedDate: '2024-10-20T15:30:00Z'
    }
];

/**
 * CLAIMS (EDI Invoice)
 */
export const claims = [
    {
        InvoiceID: 4001,
        EncounterID: 3001,
        PatientID: 1001,
        ClaimNumber: 'CLM-2024-001',
        ClaimType: 'Professional',
        BillingProviderID: 1,
        RenderingProviderID: 1,
        ReferringProviderID: null,
        SupervisingProviderID: null,
        AuthorizationNo: null,
        ServiceDateFrom: '2024-10-15',
        ServiceDateTo: '2024-10-15',
        TotalCharges: 250.00,
        TotalPayments: 200.00,
        TotalAdjustments: 25.00,
        PatientBalance: 25.00,
        InsuranceBalance: 0.00,
        ClaimStatus: 'Paid',
        SubmissionDate: '2024-10-16',
        PaidDate: '2024-10-25',
        InsuranceID: 501,
        PayerID: 'BCBSIL',
        CreatedDate: '2024-10-15T17:00:00Z',
        ModifiedDate: '2024-10-25T10:00:00Z'
    },
    {
        InvoiceID: 4002,
        EncounterID: 3002,
        PatientID: 1002,
        ClaimNumber: 'CLM-2024-002',
        ClaimType: 'Professional',
        BillingProviderID: 2,
        RenderingProviderID: 2,
        ReferringProviderID: null,
        SupervisingProviderID: null,
        AuthorizationNo: null,
        ServiceDateFrom: '2024-10-20',
        ServiceDateTo: '2024-10-20',
        TotalCharges: 150.00,
        TotalPayments: 0.00,
        TotalAdjustments: 0.00,
        PatientBalance: 0.00,
        InsuranceBalance: 150.00,
        ClaimStatus: 'Submitted',
        SubmissionDate: '2024-10-21',
        PaidDate: null,
        InsuranceID: 502,
        PayerID: 'UHC',
        CreatedDate: '2024-10-20T16:00:00Z',
        ModifiedDate: '2024-10-21T09:00:00Z'
    },
    {
        InvoiceID: 4003,
        EncounterID: null,
        PatientID: 1001,
        ClaimNumber: 'CLM-2024-003',
        ClaimType: 'Professional',
        BillingProviderID: 3,
        RenderingProviderID: 3,
        ReferringProviderID: 1, // Referred by Dr. Johnson (Box 17)
        SupervisingProviderID: null,
        AuthorizationNo: 'AUTH-2024-001234', // From referral (Box 23)
        ServiceDateFrom: '2024-10-28',
        ServiceDateTo: '2024-10-28',
        TotalCharges: 450.00,
        TotalPayments: 0.00,
        TotalAdjustments: 0.00,
        PatientBalance: 0.00,
        InsuranceBalance: 450.00,
        ClaimStatus: 'Draft',
        SubmissionDate: null,
        PaidDate: null,
        InsuranceID: 501,
        PayerID: 'BCBSIL',
        CreatedDate: '2024-10-28T14:00:00Z',
        ModifiedDate: '2024-10-28T14:00:00Z'
    }
];

/**
 * CLAIM LINE ITEMS (CPT Codes)
 */
export const claimLineItems = [
    {
        LineItemID: 5001,
        InvoiceID: 4001,
        CPTCode: '99214',
        CPTDescription: 'Office visit, established patient, moderate complexity',
        Modifier1: null,
        Modifier2: null,
        Modifier3: null,
        Modifier4: null,
        ICDCodes: ['Z00.00', 'E11.9', 'I10'],
        DiagnosisPointers: '1,2,3',
        Units: 1,
        ChargeAmount: 250.00,
        ServiceDate: '2024-10-15',
        PlaceOfService: '11',
        RenderingProviderID: 1,
        AllowedAmount: 200.00,
        PaidAmount: 200.00,
        AdjustmentAmount: 25.00,
        PatientResponsibility: 25.00,
        LineStatus: 'Paid'
    },
    {
        LineItemID: 5002,
        InvoiceID: 4002,
        CPTCode: '99213',
        CPTDescription: 'Office visit, established patient, low complexity',
        Modifier1: null,
        Modifier2: null,
        Modifier3: null,
        Modifier4: null,
        ICDCodes: ['I10', 'E78.5'],
        DiagnosisPointers: '1,2',
        Units: 1,
        ChargeAmount: 150.00,
        ServiceDate: '2024-10-20',
        PlaceOfService: '11',
        RenderingProviderID: 2,
        AllowedAmount: null,
        PaidAmount: 0.00,
        AdjustmentAmount: 0.00,
        PatientResponsibility: 0.00,
        LineStatus: 'Pending'
    },
    {
        LineItemID: 5003,
        InvoiceID: 4003,
        CPTCode: '93000',
        CPTDescription: 'Electrocardiogram, routine ECG with interpretation',
        Modifier1: null,
        Modifier2: null,
        Modifier3: null,
        Modifier4: null,
        ICDCodes: ['R07.9', 'I25.10'],
        DiagnosisPointers: '1,2',
        Units: 1,
        ChargeAmount: 150.00,
        ServiceDate: '2024-10-28',
        PlaceOfService: '11',
        RenderingProviderID: 3,
        AllowedAmount: null,
        PaidAmount: 0.00,
        AdjustmentAmount: 0.00,
        PatientResponsibility: 0.00,
        LineStatus: 'Pending'
    },
    {
        LineItemID: 5004,
        InvoiceID: 4003,
        CPTCode: '93306',
        CPTDescription: 'Echocardiography, transthoracic',
        Modifier1: null,
        Modifier2: null,
        Modifier3: null,
        Modifier4: null,
        ICDCodes: ['R07.9', 'I25.10'],
        DiagnosisPointers: '1,2',
        Units: 1,
        ChargeAmount: 300.00,
        ServiceDate: '2024-10-28',
        PlaceOfService: '11',
        RenderingProviderID: 3,
        AllowedAmount: null,
        PaidAmount: 0.00,
        AdjustmentAmount: 0.00,
        PatientResponsibility: 0.00,
        LineStatus: 'Pending'
    }
];

/**
 * PAYMENTS
 */
export const payments = [
    {
        PaymentID: 6001,
        InvoiceID: 4001,
        PaymentSource: 'Insurance',
        PayerID: 'BCBSIL',
        PayerName: 'Blue Cross Blue Shield of Illinois',
        CheckNumber: 'CHK-789456',
        EFTNumber: 'EFT-001234',
        PaymentDate: '2024-10-25',
        DepositDate: '2024-10-25',
        PaymentAmount: 200.00,
        PaymentType: 'ERA',
        PaymentMethod: 'EFT',
        PostedDate: '2024-10-25T10:30:00Z',
        PostedBy: 1
    }
];

/**
 * DENIALS
 */
export const denials = [
    {
        DenialID: 7001,
        InvoiceID: 4002,
        LineItemID: null,
        DenialCode: 'CO-50',
        DenialReason: 'These are non-covered services because this is not deemed a medical necessity by the payer',
        DenialCategory: 'Medical Necessity',
        DeniedAmount: 150.00,
        AppealStatus: 'Not Appealed',
        AppealDate: null,
        AppealDeadline: '2024-12-20',
        AppealLevel: 0,
        ResolutionDate: null,
        RecoveredAmount: 0.00,
        IdentifiedDate: '2024-10-29T09:00:00Z',
        IdentifiedBy: 1
    }
];

/**
 * ITEM KEYS (Configuration)
 */
export const itemKeys = [
    {
        ItemKeyID: 1,
        ItemKeyCode: '1562_DMJ',
        FeatureName: 'Structured Height (cm)',
        FeatureType: 'Field',
        IsEnabled: true,
        AppliesTo: 'Global',
        EnabledDate: '2024-01-01T00:00:00Z',
        EnabledBy: 1
    },
    {
        ItemKeyID: 2,
        ItemKeyCode: '1573_DMJ',
        FeatureName: 'Structured Weight (kg)',
        FeatureType: 'Field',
        IsEnabled: true,
        AppliesTo: 'Global',
        EnabledDate: '2024-01-01T00:00:00Z',
        EnabledBy: 1
    },
    {
        ItemKeyID: 3,
        ItemKeyCode: '0833_DMJ',
        FeatureName: 'Head Circumference',
        FeatureType: 'Field',
        IsEnabled: true,
        AppliesTo: 'Global',
        EnabledDate: '2024-01-01T00:00:00Z',
        EnabledBy: 1
    }
];

/**
 * ELIGIBILITY VERIFICATION DATA (270/271 Transactions)
 */
export const eligibilityData = [
    {
        eligibility_id: 'ELIG001',
        patient_id: 'P001',
        eligibility_status: 'Active',
        copay_ov: 25.00,
        copay_spec: 50.00,
        deductible_indiv: 500.00,
        deductible_family: 1500.00,
        coinsurance_pct: 80,
        payer_name: 'Medicare of Texas',
        subscriber_no: '123456789A',
        verification_date: '2025-01-30',
        verified_by: 'Front Desk'
    },
    {
        eligibility_id: 'ELIG002',
        patient_id: 'P002',
        eligibility_status: 'Active',
        copay_ov: 30.00,
        copay_spec: 60.00,
        deductible_indiv: 1000.00,
        deductible_family: 3000.00,
        coinsurance_pct: 70,
        payer_name: 'Blue Cross Blue Shield',
        subscriber_no: 'BCBS987654',
        verification_date: '2025-01-29',
        verified_by: 'System Auto'
    }
];

/**
 * SERVICE AUTHORIZATIONS (ECW: Billing > Service Authorization)
 * Maps to Loop 2300 REF02 (G1) on EDI 837 claim
 */
export const serviceAuthorizations = [
    {
        auth_id: 'SA001',
        patient_id: 'P001',
        auth_type: 'Diagnostic',
        payer: 'Medicare of Texas',
        procedure_code: '70553',
        procedure_description: 'MRI Brain with contrast',
        units_approved: 1,
        authorization_no: 'MRIAUTH2025',  // Goes to Box 23 / Loop 2300 REF02
        start_date: '2025-01-01',
        end_date: '2025-06-30',
        status: 'Approved',
        assigned_to: 'Auth Coordinator',
        requested_by: 'Dr. Sarah Johnson',
        requested_date: '2024-12-28',
        approved_date: '2025-01-02',
        notes: 'Pre-authorized for diagnostic imaging - chronic headaches'
    },
    {
        auth_id: 'SA002',
        patient_id: 'P002',
        auth_type: 'Surgical',
        payer: 'Blue Cross Blue Shield',
        procedure_code: '29881',
        procedure_description: 'Arthroscopy, knee, surgical',
        units_approved: 1,
        authorization_no: 'SURGAUTH456',
        start_date: '2025-02-01',
        end_date: '2025-02-28',
        status: 'Pending',
        assigned_to: 'Auth Coordinator',
        requested_by: 'Dr. Michael Chen',
        requested_date: '2025-01-25',
        approved_date: null,
        notes: 'Waiting for payer approval - sports injury, knee pain'
    },
    {
        auth_id: 'SA003',
        patient_id: 'P003',
        auth_type: 'Diagnostic',
        payer: 'United Healthcare',
        procedure_code: '93000',
        procedure_description: 'Electrocardiogram (ECG/EKG)',
        units_approved: 2,
        authorization_no: 'ECGAUTH789',
        start_date: '2025-01-15',
        end_date: '2025-07-15',
        status: 'Approved',
        assigned_to: 'Auth Coordinator',
        requested_by: 'Dr. Sarah Johnson',
        requested_date: '2025-01-10',
        approved_date: '2025-01-14',
        notes: 'Authorized for cardiac monitoring - 2 visits'
    }
];

// =====================================================
// PHASE F: REAL-WORLD DATA (Mission, TX Wound Care Clinic)
// =====================================================

/**
 * WOUND CARE PROVIDERS (Real providers from Mission, TX clinic)
 */
export const woundCareProviders = [
    {
        ProviderID: 101,
        FirstName: 'Jose',
        LastName: 'Farias-Jimenez',
        Credentials: 'MD',
        NPI: '1234701890',
        TaxID: '74-1234567',
        LicenseNumber: 'TX-WC-12345',
        SpecialtyType: 'Wound Care',
        TaxonomyCode: '207R00000X',
        Phone: '(956) 555-0101',
        Email: 'jfarias@vsrwoundcare.com',
        IsActive: true,
        facility: 'VSR Luis M Reyes M',
        city: 'Mission',
        state: 'TX',
        CreatedDate: '2023-01-01T08:00:00Z'
    },
    {
        ProviderID: 102,
        FirstName: 'Ernesto M',
        LastName: 'Garza Jr',
        Credentials: 'MD',
        NPI: '1234702891',
        TaxID: '74-1234568',
        LicenseNumber: 'TX-WC-12346',
        SpecialtyType: 'Wound Care',
        TaxonomyCode: '207R00000X',
        Phone: '(956) 555-0102',
        Email: 'egarza@vsrwoundcare.com',
        IsActive: true,
        facility: 'VSR Luis M Reyes M',
        city: 'Mission',
        state: 'TX',
        CreatedDate: '2023-02-01T08:00:00Z'
    },
    {
        ProviderID: 103,
        FirstName: 'Reinaldo II',
        LastName: 'Morales',
        Credentials: 'MD',
        NPI: '1234703892',
        TaxID: '74-1234569',
        LicenseNumber: 'TX-WC-12347',
        SpecialtyType: 'Wound Care',
        TaxonomyCode: '207R00000X',
        Phone: '(956) 555-0103',
        Email: 'rmorales@vsrwoundcare.com',
        IsActive: true,
        facility: 'VSR Luis M Reyes M',
        city: 'Mission',
        state: 'TX',
        CreatedDate: '2023-03-01T08:00:00Z'
    },
    {
        ProviderID: 104,
        FirstName: 'Luis M',
        LastName: 'Reyes',
        Credentials: 'MD',
        NPI: '1234704893',
        TaxID: '74-1234570',
        LicenseNumber: 'TX-WC-12348',
        SpecialtyType: 'Wound Care',
        TaxonomyCode: '207R00000X',
        Phone: '(956) 585-4357',
        Email: 'lreyes@vsrwoundcare.com',
        IsActive: true,
        facility: 'VSR Luis M Reyes M',
        city: 'Mission',
        state: 'TX',
        CreatedDate: '2023-01-01T08:00:00Z'
    }
];

/**
 * PEDRO SUAREZ PATIENT (Real patient case from Mission, TX)
 */
export const pedroSuarezPatient = {
    PatientID: 9609,
    AccountNumber: 'MRN-9609',
    FirstName: 'Pedro',
    LastName: 'Suarez',
    DateOfBirth: '1974-06-23',
    Gender: 'Male',
    SSN: '453-61-1518',
    AddressLine1: '5505 LUCY DR',
    City: 'MISSION',
    State: 'TX',
    ZipCode: '78574-6225',
    County: 'Hidalgo',
    PhoneHome: '956-569-5822',
    MaritalStatus: 'Married',
    PreferredLanguage: 'English',
    Race: 'White',
    Ethnicity: 'Hispanic Or Latino',
    PrimaryCareProvider: 101, // Dr. Farias-Jimenez
    AccountBalance: 1228.00,
    PatientBalance: 724.08,
    // AI Extension Fields
    propensity_to_pay_score: 0.72,
    preferred_contact_method: 'phone',
    optimal_contact_time: 'morning',
    CreatedDate: '2024-01-15T09:00:00Z'
};

/**
 * WOUND CARE VISIT TYPES
 */
export const woundCareVisitTypes = [
    {
        visit_type_code: 'WOUND',
        description: 'Wound Care Visit',
        default_duration_minutes: 30,
        pos_code: '11', // Office
        requires_authorization: false,
        category: 'Wound Care'
    },
    {
        visit_type_code: 'CHK',
        description: 'Check Out / Follow-up',
        default_duration_minutes: 15,
        pos_code: '11',
        requires_authorization: false,
        category: 'Follow-up'
    },
    {
        visit_type_code: 'FOLLOW-UP',
        description: 'Follow-up with Results',
        default_duration_minutes: 20,
        pos_code: '11',
        requires_authorization: false,
        category: 'Follow-up'
    },
    {
        visit_type_code: 'WOUND-DBRD',
        description: 'Wound Debridement',
        default_duration_minutes: 45,
        pos_code: '11',
        requires_authorization: true,
        category: 'Procedure'
    }
];

/**
 * MEDICARE OF TEXAS PAYER
 */
export const medicareOfTexasPayer = {
    payer_id: 'MEDTX',
    payer_name: 'Medicare of Texas',
    payer_type: 'Medicare',
    electronic_payer_id: '00590',
    address: '7400 W Detroit St, Chandler, AZ 85226',
    phone: '1-800-633-4227',
    timely_filing_limit_days: 365,
    supports_electronic_claims: true,
    supports_electronic_era: true,
    supports_270_271: true,
    historical_denial_rate: 0.08, // 8% denial rate
    average_reimbursement_rate: 0.85 // 85% of charges
};

/**
 * WOUND CARE DIAGNOSES (Common ICD-10 codes)
 */
export const woundCareDiagnoses = [
    { code: 'L97.429', description: 'Non-pressure chronic ulcer of unspecified heel and midfoot with unspecified severity' },
    { code: 'L97.919', description: 'Non-pressure chronic ulcer of unspecified part of unspecified lower leg with unspecified severity' },
    { code: 'E11.621', description: 'Type 2 diabetes mellitus with foot ulcer' },
    { code: 'I96', description: 'Gangrene, not elsewhere classified' },
    { code: 'L89.154', description: 'Pressure ulcer of sacral region, stage 4' }
];

/**
 * WOUND CARE PROCEDURES (Common CPT codes)
 */
export const woundCareProcedures = [
    { code: '97597', description: 'Debridement, open wound, first 20 sq cm or less' },
    { code: '97598', description: 'Debridement, open wound, each additional 20 sq cm' },
    { code: '97602', description: 'Removal of devitalized tissue from wound(s), non-selective' },
    { code: '11042', description: 'Debridement, subcutaneous tissue, first 20 sq cm or less' },
    { code: '99213', description: 'Office/outpatient visit, est patient, level 3' },
    { code: '99214', description: 'Office/outpatient visit, est patient, level 4' }
];

// Export all mock data
export default {
    providers,
    patients,
    insurances,
    referrals,
    encounters,
    claims,
    claimLineItems,
    payments,
    denials,
    itemKeys,
    eligibilityData,
    serviceAuthorizations,
    // Phase F: Real-World Data
    woundCareProviders,
    pedroSuarezPatient,
    woundCareVisitTypes,
    medicareOfTexasPayer,
    woundCareDiagnoses,
    woundCareProcedures
};
