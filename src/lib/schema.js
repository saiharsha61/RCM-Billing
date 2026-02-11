// Database Schema - ECW-Style Data Model for RCM System

/**
 * PATIENT & DEMOGRAPHICS
 * Core patient information table
 */
export const patientSchema = {
    // Primary Keys
    PatientID: 'INTEGER PRIMARY KEY', // Unique internal ID
    AccountNo: 'VARCHAR(50) UNIQUE', // Visible account number (e.g., 1001)

    // Demographics
    FirstName: 'VARCHAR(100)',
    MiddleName: 'VARCHAR(100)',
    LastName: 'VARCHAR(100)',
    DOB: 'DATE',
    SSN: 'VARCHAR(11)', // Encrypted
    Gender: 'VARCHAR(10)',

    // Contact
    Address1: 'VARCHAR(200)',
    Address2: 'VARCHAR(200)',
    City: 'VARCHAR(100)',
    State: 'VARCHAR(2)',
    ZipCode: 'VARCHAR(10)',
    Phone: 'VARCHAR(20)',
    Email: 'VARCHAR(100)',

    // Financial
    GuarantorID: 'INTEGER', // Links to guarantor table for financial responsibility

    // ECW V12 Additional Fields
    ReferralSource: 'VARCHAR(100)', // Marketing field - tracks ROI (e.g., 'Google', 'Dr. Smith')
    UsualProvider: 'INTEGER', // Default provider for 'My Patients' lists
    PCP: 'INTEGER', // Primary Care Provider - Required for HMO Referral Logic

    // Vitals (Item Key Enabled)
    Height_cm: 'DECIMAL(5,2)', // Enabled by Item Key 1562_DMJ
    Weight_kg: 'DECIMAL(5,2)', // Enabled by Item Key 1573_DMJ
    HeadCircumference: 'DECIMAL(5,2)', // Enabled by Item Key 0833_DMJ

    // Audit
    CreatedDate: 'TIMESTAMP',
    ModifiedDate: 'TIMESTAMP',
    CreatedBy: 'INTEGER',
    ModifiedBy: 'INTEGER'
};

/**
 * INSURANCE DATA
 * Patient insurance information
 */
export const insuranceSchema = {
    // Primary Keys
    InsuranceID: 'INTEGER PRIMARY KEY',
    PatientID: 'INTEGER FOREIGN KEY',

    // Insurance Details
    InsuranceName: 'VARCHAR(200)', // e.g., "Blue Cross Blue Shield"
    PayerID: 'VARCHAR(50)', // Payer identifier
    PlanType: 'VARCHAR(50)', // PPO, HMO, EPO, etc.
    Priority: 'INTEGER', // 1=Primary, 2=Secondary, 3=Tertiary

    // Policy Information
    PolicyNumber: 'VARCHAR(100)',
    GroupNumber: 'VARCHAR(100)',
    SubscriberID: 'VARCHAR(100)',
    SubscriberName: 'VARCHAR(200)',
    SubscriberDOB: 'DATE',
    RelationshipToSubscriber: 'VARCHAR(50)', // Self, Spouse, Child, Other

    // Financial
    Copay: 'DECIMAL(10,2)', // Updated by RTE (Real-Time Eligibility)
    Deductible: 'DECIMAL(10,2)', // Updated by RTE
    DeductibleMet: 'DECIMAL(10,2)',
    OOPMax: 'DECIMAL(10,2)', // Out-of-Pocket Maximum
    OOPMet: 'DECIMAL(10,2)',

    // Effective Dates
    EffectiveDate: 'DATE',
    TerminationDate: 'DATE',

    // Audit
    LastVerified: 'TIMESTAMP', // Last RTE check
    VerifiedBy: 'INTEGER'
};

/**
 * ENCOUNTERS
 * Clinical visits/encounters
 */
export const encounterSchema = {
    EncounterID: 'INTEGER PRIMARY KEY',
    PatientID: 'INTEGER FOREIGN KEY',
    ProviderID: 'INTEGER FOREIGN KEY',

    // Visit Details
    EncounterDate: 'DATE',
    VisitType: 'VARCHAR(50)', // ECW: 'New Patient', 'OV', 'Follow-up' - Can auto-trigger default CPT codes
    EncounterType: 'VARCHAR(50)', // Office Visit, Hospital, Telehealth
    PlaceOfService: 'VARCHAR(10)', // 11=Office, 21=Inpatient, etc.

    // Clinical
    ChiefComplaint: 'TEXT', // ECW: Reason for Visit - Supports Medical Necessity
    DiagnosisCodes: 'TEXT[]', // Array of ICD-10 codes

    // Time-based codes (ECW V12)
    StartTime: 'TIME', // Required for Anesthesia/Psychotherapy
    StopTime: 'TIME', // Required for time-based codes

    // Status
    EncounterStatus: 'VARCHAR(50)', // Scheduled, In Progress, Complete, Billed
    SignedBy: 'INTEGER',
    SignedDate: 'TIMESTAMP'
};

/**
 * CLAIMS & BILLING (EDI Invoice)
 * Professional claims (CMS-1500)
 */
export const claimSchema = {
    // Primary Keys
    InvoiceID: 'INTEGER PRIMARY KEY', // Unique Claim ID
    EncounterID: 'INTEGER FOREIGN KEY', // Links to clinical visit
    PatientID: 'INTEGER FOREIGN KEY',

    // Claim Information
    ClaimNumber: 'VARCHAR(50)', // ICN (Internal Control Number)
    ClaimType: 'VARCHAR(10)', // Professional, Institutional, Dental

    // Box Mappings (CMS-1500)
    BillingProviderID: 'INTEGER', // Box 33
    RenderingProviderID: 'INTEGER', // Box 24J
    ReferringProviderID: 'INTEGER', // Box 17 - Referring Provider
    SupervisingProviderID: 'INTEGER', // Box 17a

    // Authorization (Box 23)
    AuthorizationNo: 'VARCHAR(50)', // Prior auth number
    CLIANumber: 'VARCHAR(50)', // ECW V12: Lab Certification ID - Mandatory for in-house lab billing (Box 23)

    // Dates
    ServiceDateFrom: 'DATE', // Box 24A (From)
    ServiceDateTo: 'DATE', // Box 24A (To)

    // Financial
    TotalCharges: 'DECIMAL(10,2)',
    TotalPayments: 'DECIMAL(10,2)',
    TotalAdjustments: 'DECIMAL(10,2)',
    PatientBalance: 'DECIMAL(10,2)',
    InsuranceBalance: 'DECIMAL(10,2)',

    // Status
    ClaimStatus: 'VARCHAR(50)', // Draft, Submitted, Accepted, Rejected, Paid, Denied
    SubmissionDate: 'DATE', // ECW V12: Proof of 'Timely Filing'
    PaidDate: 'DATE',

    // ECW V12: Batch Management
    BatchID: 'VARCHAR(50)', // Groups claims into one ANSI 837 file

    // Billing Info
    InsuranceID: 'INTEGER FOREIGN KEY',
    PayerID: 'VARCHAR(50)',

    // Audit
    CreatedDate: 'TIMESTAMP',
    ModifiedDate: 'TIMESTAMP'
};

/**
 * CLAIM LINE ITEMS (CPT Codes)
 * Individual procedure codes on claim
 */
export const claimLineItemSchema = {
    LineItemID: 'INTEGER PRIMARY KEY',
    InvoiceID: 'INTEGER FOREIGN KEY',

    // Procedure Code
    CPTCode: 'VARCHAR(10)', // e.g., 99213, 99214
    CPTDescription: 'TEXT',
    Modifier1: 'VARCHAR(2)', // e.g., 25, 59, GT
    Modifier2: 'VARCHAR(2)',
    Modifier3: 'VARCHAR(2)',
    Modifier4: 'VARCHAR(2)',

    // Diagnosis Pointers (Box 24E)
    ICDCodes: 'TEXT[]', // Array of diagnosis codes linked to this procedure
    DiagnosisPointers: 'VARCHAR(10)', // e.g., "1,2,3" - points to diagnosis codes

    // Units & Charges
    Units: 'INTEGER', // Box 24G
    ChargeAmount: 'DECIMAL(10,2)', // Box 24F

    // ECW V12: Drug Billing
    NDCCode: 'VARCHAR(20)', // National Drug Code - Mandatory for J-code billing (Medicaid)

    // Dates
    ServiceDate: 'DATE', // Box 24A

    // Place of Service
    PlaceOfService: 'VARCHAR(10)', // Box 24B - Affects reimbursement rate (Facility vs Non-Fac)

    // Provider
    RenderingProviderID: 'INTEGER', // Box 24J

    // Financial
    AllowedAmount: 'DECIMAL(10,2)',
    PaidAmount: 'DECIMAL(10,2)',
    AdjustmentAmount: 'DECIMAL(10,2)',
    PatientResponsibility: 'DECIMAL(10,2)',

    // Status
    LineStatus: 'VARCHAR(50)' // Pending, Paid, Denied, Adjusted
};

/**
 * REFERRALS & AUTHORIZATIONS
 * Prior authorizations and referral tracking
 */
export const referralSchema = {
    // Primary Keys
    ReferralID: 'INTEGER PRIMARY KEY',
    PatientID: 'INTEGER FOREIGN KEY',

    // Referral Details
    ReferringProviderID: 'INTEGER', // Provider making the referral
    RefToID: 'INTEGER', // The specialist provider ID receiving the referral
    SpecialtyType: 'VARCHAR(100)', // Cardiology, Orthopedics, etc.

    // Authorization
    AuthNo: 'VARCHAR(50)', // Authorization number from insurance
    AuthStatus: 'VARCHAR(50)', // Pending, Approved, Denied, Expired

    // Visit Limits
    VisitsAllowed: 'INTEGER', // Count of approved visits
    VisitsUsed: 'INTEGER', // Count of visits completed
    VisitsRemaining: 'INTEGER', // Calculated field

    // Validity Period
    StartDate: 'DATE', // Auth start date
    EndDate: 'DATE', // Auth expiration date

    // Clinical
    Diagnosis: 'VARCHAR(100)',
    ICD10Codes: 'TEXT[]',
    ReasonForReferral: 'TEXT',

    // Status
    ReferralStatus: 'VARCHAR(50)', // Active, Completed, Cancelled, Expired

    // Audit
    CreatedDate: 'TIMESTAMP',
    ApprovedDate: 'TIMESTAMP'
};

/**
 * ITEM KEYS (Configuration Codes)
 * System configuration for enabling specific features
 */
export const itemKeySchema = {
    ItemKeyID: 'INTEGER PRIMARY KEY',
    ItemKeyCode: 'VARCHAR(20) UNIQUE', // e.g., "1562_DMJ"

    // Configuration
    FeatureName: 'VARCHAR(200)', // "Structured Height (cm)"
    FeatureType: 'VARCHAR(50)', // Field, Module, Report
    IsEnabled: 'BOOLEAN',

    // Scope
    AppliesTo: 'VARCHAR(50)', // Global, Provider, Location

    // Audit
    EnabledDate: 'TIMESTAMP',
    EnabledBy: 'INTEGER'
};

/**
 * PREDEFINED ITEM KEYS
 */
export const standardItemKeys = [
    {
        ItemKeyCode: '1562_DMJ',
        FeatureName: 'Structured Height (cm)',
        FeatureType: 'Field',
        IsEnabled: true,
        AppliesTo: 'Global'
    },
    {
        ItemKeyCode: '1573_DMJ',
        FeatureName: 'Structured Weight (kg)',
        FeatureType: 'Field',
        IsEnabled: true,
        AppliesTo: 'Global'
    },
    {
        ItemKeyCode: '0833_DMJ',
        FeatureName: 'Head Circumference',
        FeatureType: 'Field',
        IsEnabled: true,
        AppliesTo: 'Global'
    }
];

/**
 * PAYMENT POSTING
 * ERA (Electronic Remittance Advice) and manual payments
 */
export const paymentSchema = {
    PaymentID: 'INTEGER PRIMARY KEY',
    InvoiceID: 'INTEGER FOREIGN KEY',

    // Payment Source
    PaymentSource: 'VARCHAR(50)', // Insurance, Patient, Third Party
    PayerID: 'VARCHAR(50)',
    PayerName: 'VARCHAR(200)',

    // ECW V12: Payment Details (ERA/EOB Screen)
    CheckNumber: 'VARCHAR(50)', // Check / EFT Trace Number - Proof of payment
    CheckDate: 'DATE', // Date of funds transfer - Used for bank reconciliation
    EFTNumber: 'VARCHAR(50)',
    PaymentDate: 'DATE',
    DepositDate: 'DATE',

    // ECW V12: Payer Control Number
    PayerControlNumber: 'VARCHAR(50)', // ICN / Claim ID from Payer - Links payment to original claim

    // Amounts
    PaymentAmount: 'DECIMAL(10,2)', // Actual Cash Received - The check amount
    AllowedAmount: 'DECIMAL(10,2)', // ECW V12: Contracted Rate - The max amount the payer allows
    AdjustmentCode: 'VARCHAR(10)', // ECW V12: 'CO-45' (Contractual Obligation) - The write-off amount
    PatientResponsibility: 'DECIMAL(10,2)', // ECW V12: PR-1, PR-2 (Ded, Co-ins) - Moves balance to Patient Bucket
    CARCCode: 'VARCHAR(10)', // ECW V12: Claim Adjustment Reason Code - Explains why (e.g., 'Denied - Timely Filing')

    // Type
    PaymentType: 'VARCHAR(50)', // ERA, Manual, Patient Payment
    PaymentMethod: 'VARCHAR(50)', // Check, EFT, Credit Card, Cash

    // Audit
    PostedDate: 'TIMESTAMP',
    PostedBy: 'INTEGER'
};

/**
 * DENIALS
 * Claim denials and rejections
 */
export const denialSchema = {
    DenialID: 'INTEGER PRIMARY KEY',
    InvoiceID: 'INTEGER FOREIGN KEY',
    LineItemID: 'INTEGER FOREIGN KEY',

    // Denial Information
    DenialCode: 'VARCHAR(10)', // CO-50, PR-1, OA-23, etc.
    DenialReason: 'TEXT',
    DenialCategory: 'VARCHAR(100)', // Medical Necessity, Auth, Timely Filing

    // Financial Impact
    DeniedAmount: 'DECIMAL(10,2)',

    // Appeal Tracking
    AppealStatus: 'VARCHAR(50)', // Not Appealed, Appealed, Won, Lost
    AppealDate: 'DATE',
    AppealDeadline: 'DATE',
    AppealLevel: 'INTEGER', // 1st, 2nd, 3rd level appeal

    // Resolution
    ResolutionDate: 'DATE',
    RecoveredAmount: 'DECIMAL(10,2)',

    // Audit
    IdentifiedDate: 'TIMESTAMP',
    IdentifiedBy: 'INTEGER'
};

/**
 * PROVIDERS
 * Healthcare providers (physicians, NPPs, etc.)
 */
export const providerSchema = {
    ProviderID: 'INTEGER PRIMARY KEY',

    // Provider Information
    FirstName: 'VARCHAR(100)',
    LastName: 'VARCHAR(100)',
    MiddleName: 'VARCHAR(100)',
    Credentials: 'VARCHAR(50)', // MD, DO, NP, PA

    // Identifiers
    NPI: 'VARCHAR(10) UNIQUE', // National Provider Identifier (Type 1)
    NPIType2: 'VARCHAR(10)', // Organization NPI (if applicable)
    TaxID: 'VARCHAR(20)', // ECW V12: EIN - Corporate Tax ID for 1099s
    LicenseNumber: 'VARCHAR(50)', // ECW V12: State License - Required for eRx
    DEA: 'VARCHAR(20)', // ECW V12: Required for eRx and controlled substances

    // Specialty
    SpecialtyType: 'VARCHAR(100)',
    TaxonomyCode: 'VARCHAR(20)', // NUCC taxonomy code

    // Contact
    Phone: 'VARCHAR(20)',
    Fax: 'VARCHAR(20)',
    Email: 'VARCHAR(100)',

    // ECW V12: Signature
    SignatureImage: 'VARCHAR(500)', // Digitized signature for Box 31 (file path or base64)

    // Status
    IsActive: 'BOOLEAN',

    // Audit
    CreatedDate: 'TIMESTAMP'
};

// Export all schemas
export const schemas = {
    patient: patientSchema,
    insurance: insuranceSchema,
    encounter: encounterSchema,
    claim: claimSchema,
    claimLineItem: claimLineItemSchema,
    referral: referralSchema,
    itemKey: itemKeySchema,
    payment: paymentSchema,
    denial: denialSchema,
    provider: providerSchema
};

export default schemas;
