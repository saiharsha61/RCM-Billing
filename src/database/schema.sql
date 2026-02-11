/**
 * DATABASE SCHEMA - RCM Billing Application
 * SQL Schema definitions for all tables
 * Compatible with PostgreSQL/MySQL
 */

-- =====================================================
-- PATIENTS TABLE
-- Core patient demographics (CMS-1500 Box 2, 3, 5)
-- =====================================================
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    account_no VARCHAR(20) UNIQUE NOT NULL,
    
    -- Demographics (Box 2)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    suffix VARCHAR(10),  -- Jr., Sr., III
    
    -- Box 3
    date_of_birth DATE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'U')),
    
    -- SSN (encrypted)
    ssn_encrypted VARCHAR(255),
    
    -- Contact Info (Box 5)
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip VARCHAR(10),
    county VARCHAR(50),
    phone_home VARCHAR(20),
    phone_mobile VARCHAR(20),
    phone_work VARCHAR(20),
    email VARCHAR(100),
    preferred_contact VARCHAR(20) DEFAULT 'phone',
    
    -- SOGI Data (MIPS Compliance)
    race VARCHAR(50),
    ethnicity VARCHAR(50),
    preferred_language VARCHAR(50) DEFAULT 'English',
    sexual_orientation VARCHAR(50),
    gender_identity VARCHAR(50),
    birth_sex CHAR(1),
    
    -- Provider Assignment
    pcp_provider_id INT REFERENCES providers(provider_id),
    rendering_provider_id INT REFERENCES providers(provider_id),
    referring_provider_id INT REFERENCES providers(provider_id),
    
    -- Self-Service Flags
    patient_entered BOOLEAN DEFAULT FALSE,
    patient_entered_at TIMESTAMP,
    review_status VARCHAR(20) DEFAULT 'pending',
    reviewed_by INT,
    reviewed_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);
CREATE INDEX idx_patients_account ON patients(account_no);

-- =====================================================
-- GUARANTORS TABLE
-- Responsible party for billing
-- =====================================================
CREATE TABLE guarantors (
    guarantor_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    
    -- Guarantor Info
    relationship_to_patient VARCHAR(20) NOT NULL, -- Self, Parent, Spouse, Guardian
    
    -- If not Self
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    ssn_encrypted VARCHAR(255),
    
    -- Contact
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    
    -- Employment (for Workers Comp)
    employer_name VARCHAR(100),
    employer_phone VARCHAR(20),
    
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guarantors_patient ON guarantors(patient_id);

-- =====================================================
-- PATIENT_INSURANCE TABLE
-- Insurance coverage pyramid (Primary, Secondary, Tertiary)
-- CMS-1500 Boxes 1, 1a, 4, 7, 9, 11
-- =====================================================
CREATE TABLE patient_insurance (
    insurance_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    
    -- Priority
    coverage_order INT NOT NULL CHECK (coverage_order IN (1, 2, 3)), -- Primary=1, Secondary=2, Tertiary=3
    
    -- Payer Info (Box 1, 1a)
    payer_id VARCHAR(10) NOT NULL,  -- Electronic Payer ID
    payer_name VARCHAR(100) NOT NULL,
    plan_name VARCHAR(100),
    plan_type VARCHAR(20), -- HMO, PPO, Medicare, Medicaid
    
    -- Member Info (Box 1a, 11)
    member_id VARCHAR(50) NOT NULL,
    group_number VARCHAR(50),
    
    -- Subscriber Info (Box 4, 7)
    relationship_to_subscriber VARCHAR(20) DEFAULT 'Self',
    subscriber_first_name VARCHAR(50),
    subscriber_last_name VARCHAR(50),
    subscriber_dob DATE,
    subscriber_gender CHAR(1),
    subscriber_ssn_encrypted VARCHAR(255),
    subscriber_address_line1 VARCHAR(100),
    subscriber_address_line2 VARCHAR(100),
    subscriber_city VARCHAR(50),
    subscriber_state CHAR(2),
    subscriber_zip VARCHAR(10),
    subscriber_phone VARCHAR(20),
    
    -- Coverage Dates
    effective_date DATE,
    termination_date DATE,
    
    -- Eligibility Cache
    eligibility_status VARCHAR(20), -- Active, Inactive, Unknown
    eligibility_checked_at TIMESTAMP,
    eligibility_response JSON, -- Store 271 response
    
    -- Benefits
    copay_pcp DECIMAL(10,2),
    copay_specialist DECIMAL(10,2),
    deductible_individual DECIMAL(10,2),
    deductible_family DECIMAL(10,2),
    deductible_met DECIMAL(10,2),
    oop_max_individual DECIMAL(10,2),
    oop_max_family DECIMAL(10,2),
    oop_met DECIMAL(10,2),
    coinsurance_percent INT,
    network_status VARCHAR(20), -- IN, OUT
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insurance_patient ON patient_insurance(patient_id);
CREATE INDEX idx_insurance_payer ON patient_insurance(payer_id);
CREATE INDEX idx_insurance_member ON patient_insurance(member_id);

-- =====================================================
-- PROVIDERS TABLE
-- Rendering, Referring, Billing providers
-- =====================================================
CREATE TABLE providers (
    provider_id SERIAL PRIMARY KEY,
    
    -- Basic Info
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    credentials VARCHAR(20), -- MD, DO, NP, PA
    specialty VARCHAR(100),
    
    -- Identifiers (Box 24J, 17a, 33a)
    npi VARCHAR(10) UNIQUE NOT NULL,
    tax_id VARCHAR(11), -- TIN
    taxonomy_code VARCHAR(10),
    state_license VARCHAR(20),
    dea_number VARCHAR(20),
    
    -- Contact
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(100),
    
    -- Address
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip VARCHAR(10),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_providers_npi ON providers(npi);

-- =====================================================
-- FACILITIES TABLE
-- Service locations (Box 32)
-- =====================================================
CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    npi VARCHAR(10),
    tax_id VARCHAR(11),
    place_of_service VARCHAR(2) NOT NULL, -- 11=Office, 21=Hospital, etc.
    
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip VARCHAR(10),
    phone VARCHAR(20),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ENCOUNTERS TABLE
-- Clinical visits/encounters
-- =====================================================
CREATE TABLE encounters (
    encounter_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,
    
    -- Date/Time
    date_of_service DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    
    -- Providers
    rendering_provider_id INT REFERENCES providers(provider_id) NOT NULL,
    referring_provider_id INT REFERENCES providers(provider_id),
    supervising_provider_id INT REFERENCES providers(provider_id),
    
    -- Location
    facility_id INT REFERENCES facilities(facility_id),
    place_of_service VARCHAR(2) DEFAULT '11',
    
    -- Clinical
    chief_complaint TEXT,
    visit_type VARCHAR(50), -- New, Established, Follow-up
    
    -- Authorization
    authorization_id INT REFERENCES authorizations(authorization_id),
    authorization_number VARCHAR(50),
    
    -- Condition Related To (Box 10)
    is_work_related BOOLEAN DEFAULT FALSE,
    is_auto_accident BOOLEAN DEFAULT FALSE,
    auto_accident_state CHAR(2),
    is_other_accident BOOLEAN DEFAULT FALSE,
    
    -- Dates (Box 14, 15, 16, 18)
    illness_onset_date DATE,
    similar_illness_date DATE,
    disability_from_date DATE,
    disability_to_date DATE,
    hospitalization_from DATE,
    hospitalization_to DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'open', -- open, signed, billed, closed
    signed_at TIMESTAMP,
    signed_by INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_dos ON encounters(date_of_service);
CREATE INDEX idx_encounters_provider ON encounters(rendering_provider_id);
CREATE INDEX idx_encounters_status ON encounters(status);

-- =====================================================
-- ENCOUNTER_DIAGNOSES TABLE
-- ICD-10 codes for encounters (Box 21)
-- =====================================================
CREATE TABLE encounter_diagnoses (
    diagnosis_id SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounters(encounter_id) NOT NULL,
    
    pointer CHAR(1) NOT NULL, -- A, B, C, D... (Box 21)
    icd10_code VARCHAR(10) NOT NULL,
    description VARCHAR(255),
    
    is_primary BOOLEAN DEFAULT FALSE,
    is_hcc BOOLEAN DEFAULT FALSE, -- Hierarchical Condition Category
    
    display_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnoses_encounter ON encounter_diagnoses(encounter_id);
CREATE INDEX idx_diagnoses_code ON encounter_diagnoses(icd10_code);

-- =====================================================
-- ENCOUNTER_PROCEDURES TABLE
-- CPT/HCPCS codes for encounters (Box 24)
-- =====================================================
CREATE TABLE encounter_procedures (
    procedure_id SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounters(encounter_id) NOT NULL,
    
    -- Line Number
    line_number INT NOT NULL,
    
    -- Dates (Box 24A)
    service_date_from DATE NOT NULL,
    service_date_to DATE,
    
    -- Place of Service (Box 24B)
    place_of_service VARCHAR(2),
    
    -- Procedure (Box 24D)
    cpt_code VARCHAR(10) NOT NULL,
    description VARCHAR(255),
    
    -- Modifiers (Box 24D)
    modifier1 VARCHAR(2),
    modifier2 VARCHAR(2),
    modifier3 VARCHAR(2),
    modifier4 VARCHAR(2),
    
    -- Diagnosis Pointers (Box 24E)
    diagnosis_pointers VARCHAR(20), -- A,B,C format
    
    -- Charges (Box 24F)
    charge_amount DECIMAL(10,2) NOT NULL,
    
    -- Units (Box 24G)
    units INT DEFAULT 1,
    
    -- NDC for Injectables
    ndc_code VARCHAR(11),
    ndc_quantity DECIMAL(10,3),
    ndc_unit VARCHAR(10), -- ml, mg, units
    
    -- Rendering Provider (Box 24J)
    rendering_provider_id INT REFERENCES providers(provider_id),
    
    -- Anesthesia
    anesthesia_start_time TIME,
    anesthesia_end_time TIME,
    anesthesia_base_units INT,
    anesthesia_time_units INT,
    
    display_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_procedures_encounter ON encounter_procedures(encounter_id);
CREATE INDEX idx_procedures_cpt ON encounter_procedures(cpt_code);

-- =====================================================
-- AUTHORIZATIONS TABLE
-- Prior Authorizations/Referrals (Box 23)
-- =====================================================
CREATE TABLE authorizations (
    authorization_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,
    
    -- Type
    auth_type VARCHAR(20) NOT NULL, -- Prior Auth, Referral
    
    -- Auth Details
    authorization_number VARCHAR(50) NOT NULL,
    payer_id VARCHAR(10),
    payer_name VARCHAR(100),
    
    -- Services
    procedure_code VARCHAR(10),
    procedure_description VARCHAR(255),
    
    -- Provider Info
    ordering_provider_id INT REFERENCES providers(provider_id),
    servicing_provider_id INT REFERENCES providers(provider_id),
    facility_id INT REFERENCES facilities(facility_id),
    
    -- Visits/Units
    authorized_visits INT,
    used_visits INT DEFAULT 0,
    remaining_visits INT GENERATED ALWAYS AS (authorized_visits - used_visits) STORED,
    
    -- Dates
    effective_date DATE,
    expiration_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Denied, Expired
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_patient ON authorizations(patient_id);
CREATE INDEX idx_auth_number ON authorizations(authorization_number);
CREATE INDEX idx_auth_expiration ON authorizations(expiration_date);
CREATE INDEX idx_auth_status ON authorizations(status);

-- =====================================================
-- CLAIMS TABLE
-- Generated claims from encounters
-- =====================================================
CREATE TABLE claims (
    claim_id SERIAL PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    encounter_id INT REFERENCES encounters(encounter_id) NOT NULL,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,
    
    -- Payer
    payer_id VARCHAR(10) NOT NULL,
    payer_name VARCHAR(100),
    
    -- Amounts
    total_charges DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    amount_adjusted DECIMAL(10,2) DEFAULT 0,
    amount_due DECIMAL(10,2) GENERATED ALWAYS AS (total_charges - amount_paid - amount_adjusted) STORED,
    
    -- Status
    status VARCHAR(20) DEFAULT 'Draft', -- Draft, Scrubbed, Ready, Submitted, Paid, Denied
    
    -- Submission
    submitted_at TIMESTAMP,
    submitted_by INT,
    edi_batch_id VARCHAR(50),
    
    -- Response
    payer_claim_id VARCHAR(50),
    paid_at TIMESTAMP,
    denial_reason_code VARCHAR(10),
    denial_reason_description VARCHAR(255),
    
    -- Routing
    routed_to_department VARCHAR(50),
    routed_at TIMESTAMP,
    assigned_to INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claims_encounter ON claims(encounter_id);
CREATE INDEX idx_claims_patient ON claims(patient_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_payer ON claims(payer_id);

-- =====================================================
-- CLAIM_SCRUB_RESULTS TABLE
-- Validation errors from claim scrubber
-- =====================================================
CREATE TABLE claim_scrub_results (
    result_id SERIAL PRIMARY KEY,
    claim_id INT REFERENCES claims(claim_id) NOT NULL,
    
    error_type VARCHAR(50) NOT NULL, -- Demographics, Coding, Payer, Authorization
    error_code VARCHAR(20),
    error_message VARCHAR(255) NOT NULL,
    severity VARCHAR(10) NOT NULL, -- Error, Warning
    field_name VARCHAR(50),
    
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scrub_claim ON claim_scrub_results(claim_id);

-- =====================================================
-- DENIALS TABLE
-- Denial management tracking
-- =====================================================
CREATE TABLE denials (
    denial_id SERIAL PRIMARY KEY,
    claim_id INT REFERENCES claims(claim_id) NOT NULL,
    
    -- Reason
    reason_code VARCHAR(10) NOT NULL, -- CARC code
    reason_description VARCHAR(255),
    remark_code VARCHAR(10), -- RARC code
    
    -- Amount
    denied_amount DECIMAL(10,2),
    
    -- Routing
    department VARCHAR(50) NOT NULL,
    category VARCHAR(50), -- eligibility, coding, authorization, etc.
    priority VARCHAR(10) DEFAULT 'medium',
    sla_hours INT,
    due_date TIMESTAMP,
    
    -- Assignment
    assigned_to INT,
    assigned_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'new', -- new, in_progress, appealed, resolved, written_off
    
    -- Resolution
    resolution_action VARCHAR(50),
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_denials_claim ON denials(claim_id);
CREATE INDEX idx_denials_department ON denials(department);
CREATE INDEX idx_denials_status ON denials(status);
CREATE INDEX idx_denials_due ON denials(due_date);

-- =====================================================
-- AUDIT_LOG TABLE
-- Track all changes for HIPAA compliance
-- =====================================================
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE, VIEW
    
    user_id INT,
    user_name VARCHAR(100),
    ip_address VARCHAR(50),
    
    old_values JSON,
    new_values JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_date ON audit_log(created_at);

-- =====================================================
-- USERS TABLE
-- System users
-- =====================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    
    role VARCHAR(20) NOT NULL, -- admin, billing, clinical, front_desk
    department VARCHAR(50),
    
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- PROGRESS_NOTES TABLE (mobiledoc.progressnotes)
-- Encrypted clinical documentation per encounter
-- Per eCW spec: "Progress Note content is stored as
-- encrypted XML data, not plain text"
-- =====================================================
CREATE TABLE progress_notes (
    note_id SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounters(encounter_id) NOT NULL,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,
    provider_id INT REFERENCES providers(provider_id) NOT NULL,

    -- Encrypted Content (AES-256)
    note_content_encrypted BYTEA NOT NULL,       -- Encrypted XML blob
    encryption_key_id VARCHAR(100),              -- Reference to KMS key ID
    encryption_algorithm VARCHAR(20) DEFAULT 'AES-256-GCM',

    -- Note Metadata (not encrypted - used for indexing)
    note_type VARCHAR(30) NOT NULL,              -- SOAP, H&P, Progress, Consult, Procedure
    note_status VARCHAR(20) DEFAULT 'draft',     -- draft, signed, addended, amended
    template_id VARCHAR(50),                     -- SmartForm template used

    -- Sections Present (flags for quick filtering)
    has_hpi BOOLEAN DEFAULT FALSE,
    has_ros BOOLEAN DEFAULT FALSE,
    has_exam BOOLEAN DEFAULT FALSE,
    has_assessment BOOLEAN DEFAULT FALSE,
    has_plan BOOLEAN DEFAULT FALSE,
    has_orders BOOLEAN DEFAULT FALSE,

    -- E&M Level Documentation
    em_level VARCHAR(10),                        -- 99211-99215, 99201-99205
    em_method VARCHAR(10),                       -- MDM, Time
    total_time_minutes INT,
    mdm_complexity VARCHAR(20),                  -- Straightforward, Low, Moderate, High

    -- Signing
    signed_at TIMESTAMP,
    signed_by INT REFERENCES users(user_id),
    co_signed_by INT REFERENCES users(user_id),
    co_signed_at TIMESTAMP,

    -- Addendum
    is_addendum BOOLEAN DEFAULT FALSE,
    parent_note_id INT REFERENCES progress_notes(note_id),
    addendum_reason TEXT,

    -- Access Control (break-glass logging)
    access_level VARCHAR(20) DEFAULT 'normal',   -- normal, restricted, sensitive
    last_accessed_at TIMESTAMP,
    last_accessed_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_notes_encounter ON progress_notes(encounter_id);
CREATE INDEX idx_progress_notes_patient ON progress_notes(patient_id);
CREATE INDEX idx_progress_notes_provider ON progress_notes(provider_id);
CREATE INDEX idx_progress_notes_type ON progress_notes(note_type);
CREATE INDEX idx_progress_notes_status ON progress_notes(note_status);

-- =====================================================
-- ITEM_NOTES TABLE (mobiledoc.item_notes)
-- Individual clinical items within a progress note
-- Stores HPI elements, ROS items, Exam findings, etc.
-- =====================================================
CREATE TABLE item_notes (
    item_id SERIAL PRIMARY KEY,
    note_id INT REFERENCES progress_notes(note_id) NOT NULL,
    encounter_id INT REFERENCES encounters(encounter_id) NOT NULL,

    -- Section & Content
    section VARCHAR(30) NOT NULL,                -- HPI, ROS, EXAM, ASSESSMENT, PLAN, ORDERS
    item_key VARCHAR(50) NOT NULL,               -- e.g., "chest_pain", "lungs_clear"
    item_value TEXT,                             -- The actual finding/note text
    item_value_encrypted BYTEA,                  -- Encrypted version for PHI content

    -- Clinical Attributes
    is_normal BOOLEAN DEFAULT TRUE,              -- Normal vs. abnormal finding
    is_pertinent_negative BOOLEAN DEFAULT FALSE,
    severity VARCHAR(20),                        -- Mild, Moderate, Severe
    laterality VARCHAR(10),                      -- Left, Right, Bilateral

    -- Ordering
    display_order INT DEFAULT 0,

    -- Template Reference
    template_item_id VARCHAR(50),                -- From SmartForm template

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_notes_note ON item_notes(note_id);
CREATE INDEX idx_item_notes_encounter ON item_notes(encounter_id);
CREATE INDEX idx_item_notes_section ON item_notes(section);

-- =====================================================
-- VITALS TABLE (mobiledoc.vitals)
-- Patient vital signs per encounter
-- =====================================================
CREATE TABLE vitals (
    vital_id SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounters(encounter_id) NOT NULL,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,

    -- Timestamp
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT REFERENCES users(user_id),

    -- Core Vitals
    height_inches DECIMAL(5,1),
    weight_lbs DECIMAL(6,1),
    bmi DECIMAL(5,1),                            -- Auto-calculated
    temperature_f DECIMAL(5,1),
    temp_method VARCHAR(20),                     -- Oral, Tympanic, Axillary, Rectal, Temporal

    -- Blood Pressure
    bp_systolic INT,
    bp_diastolic INT,
    bp_position VARCHAR(20),                     -- Sitting, Standing, Supine
    bp_site VARCHAR(20),                         -- Left Arm, Right Arm

    -- Pulse & Respiration
    pulse_rate INT,
    pulse_rhythm VARCHAR(20),                    -- Regular, Irregular
    pulse_site VARCHAR(20),                      -- Radial, Apical
    respiratory_rate INT,

    -- Oxygen
    oxygen_saturation DECIMAL(5,1),              -- SpO2 %
    oxygen_supplemental BOOLEAN DEFAULT FALSE,
    oxygen_flow_rate DECIMAL(4,1),               -- L/min

    -- Pain
    pain_scale INT CHECK (pain_scale >= 0 AND pain_scale <= 10),
    pain_location VARCHAR(100),

    -- Pediatric
    head_circumference_cm DECIMAL(5,1),

    -- Growth Percentiles (auto-calculated)
    height_percentile DECIMAL(5,1),
    weight_percentile DECIMAL(5,1),
    bmi_percentile DECIMAL(5,1),

    -- Smoking Status (MIPS)
    smoking_status VARCHAR(30),                  -- Current, Former, Never, Unknown

    -- Flags
    is_abnormal BOOLEAN DEFAULT FALSE,
    abnormal_flags JSON,                         -- {"bp": "high", "temp": "fever"}

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vitals_encounter ON vitals(encounter_id);
CREATE INDEX idx_vitals_patient ON vitals(patient_id);
CREATE INDEX idx_vitals_recorded ON vitals(recorded_at);

-- =====================================================
-- MEDICATIONS TABLE (mobiledoc.medication)
-- Current and historical medications
-- =====================================================
CREATE TABLE medications (
    medication_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,
    encounter_id INT REFERENCES encounters(encounter_id),  -- Encounter when prescribed

    -- Drug Info
    drug_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    ndc_code VARCHAR(11),
    rxnorm_code VARCHAR(20),                     -- RxNorm CUI for interoperability
    drug_class VARCHAR(100),
    controlled_schedule VARCHAR(5),              -- II, III, IV, V or NULL

    -- Prescription
    dosage VARCHAR(50),                          -- e.g., "500mg"
    dosage_form VARCHAR(50),                     -- Tablet, Capsule, Injection, etc.
    route VARCHAR(30),                           -- Oral, IV, IM, Topical, etc.
    frequency VARCHAR(50),                       -- BID, TID, QID, PRN, etc.
    quantity INT,
    refills INT DEFAULT 0,
    days_supply INT,
    sig TEXT,                                    -- Full prescription directions

    -- Provider
    prescribing_provider_id INT REFERENCES providers(provider_id),
    pharmacy_name VARCHAR(100),
    pharmacy_ncpdp VARCHAR(10),                  -- NCPDP pharmacy ID

    -- Dates
    start_date DATE,
    end_date DATE,
    discontinued_date DATE,
    discontinued_reason VARCHAR(100),

    -- Status
    status VARCHAR(20) DEFAULT 'active',         -- active, discontinued, completed, on_hold
    is_prn BOOLEAN DEFAULT FALSE,

    -- Safety
    allergies_checked BOOLEAN DEFAULT FALSE,
    interactions_checked BOOLEAN DEFAULT FALSE,
    formulary_status VARCHAR(20),                -- Covered, PA Required, Non-Formulary, Step Therapy

    -- e-Prescribing
    erx_message_id VARCHAR(50),                  -- NCPDP e-Rx message ID
    erx_status VARCHAR(20),                      -- sent, received, filled, denied

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_medications_status ON medications(status);
CREATE INDEX idx_medications_drug ON medications(drug_name);
CREATE INDEX idx_medications_ndc ON medications(ndc_code);

-- =====================================================
-- LAB_ORDERS TABLE (mobiledoc.laborders)
-- Outgoing lab and imaging orders
-- =====================================================
CREATE TABLE lab_orders (
    order_id SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounters(encounter_id) NOT NULL,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,

    -- Order Info
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_type VARCHAR(20) NOT NULL,             -- Lab, Imaging, Pathology
    order_status VARCHAR(20) DEFAULT 'ordered',  -- ordered, sent, in_progress, completed, cancelled

    -- Test Details
    test_code VARCHAR(20) NOT NULL,              -- LOINC code
    test_name VARCHAR(200) NOT NULL,
    test_description TEXT,
    specimen_type VARCHAR(50),                   -- Blood, Urine, Tissue, etc.
    specimen_source VARCHAR(50),                 -- Venipuncture, Clean Catch, etc.

    -- Priority
    priority VARCHAR(20) DEFAULT 'routine',      -- stat, urgent, routine

    -- Provider
    ordering_provider_id INT REFERENCES providers(provider_id) NOT NULL,
    ordering_provider_npi VARCHAR(10),

    -- Lab/Facility
    performing_lab VARCHAR(100),                 -- Quest, LabCorp, In-House
    performing_lab_id VARCHAR(20),
    performing_lab_address TEXT,

    -- Diagnosis
    icd10_code VARCHAR(10),                      -- Medical necessity
    icd10_description VARCHAR(255),

    -- ABN (Advance Beneficiary Notice)
    abn_required BOOLEAN DEFAULT FALSE,
    abn_signed BOOLEAN DEFAULT FALSE,
    abn_date DATE,

    -- HL7 Integration
    hl7_message_id VARCHAR(50),                  -- ORM message ID
    hl7_status VARCHAR(20),                      -- sent, acknowledged, error

    -- Scheduling
    scheduled_date DATE,
    fasting_required BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,

    -- Dates
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lab_orders_encounter ON lab_orders(encounter_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(order_status);
CREATE INDEX idx_lab_orders_number ON lab_orders(order_number);
CREATE INDEX idx_lab_orders_provider ON lab_orders(ordering_provider_id);

-- =====================================================
-- LAB_RESULTS TABLE (mobiledoc.labresults)
-- Inbound test results with values and reference ranges
-- =====================================================
CREATE TABLE lab_results (
    result_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES lab_orders(order_id),
    patient_id INT REFERENCES patients(patient_id) NOT NULL,

    -- Result Identity
    result_code VARCHAR(20) NOT NULL,            -- LOINC code
    result_name VARCHAR(200) NOT NULL,

    -- Value
    result_value VARCHAR(100),                   -- The actual result
    result_unit VARCHAR(30),                     -- mg/dL, mmol/L, etc.
    result_type VARCHAR(20) DEFAULT 'numeric',   -- numeric, text, coded

    -- Reference Range
    reference_range_low DECIMAL(10,3),
    reference_range_high DECIMAL(10,3),
    reference_range_text VARCHAR(100),           -- For non-numeric ranges

    -- Interpretation
    abnormal_flag VARCHAR(5),                    -- H, L, HH, LL, A, N
    critical_flag BOOLEAN DEFAULT FALSE,
    interpretation VARCHAR(50),                  -- Normal, Abnormal, Critical

    -- Status
    result_status VARCHAR(20) DEFAULT 'final',   -- preliminary, final, corrected, cancelled

    -- Performing Lab
    performing_lab VARCHAR(100),
    lab_director VARCHAR(100),

    -- HL7 Integration
    hl7_message_id VARCHAR(50),                  -- ORU message ID
    observation_datetime TIMESTAMP,

    -- Provider Review
    reviewed_by INT REFERENCES providers(provider_id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    is_reviewed BOOLEAN DEFAULT FALSE,

    -- Patient Notification
    patient_notified BOOLEAN DEFAULT FALSE,
    patient_notified_at TIMESTAMP,
    patient_visible BOOLEAN DEFAULT TRUE,        -- Show on patient portal

    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lab_results_order ON lab_results(order_id);
CREATE INDEX idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX idx_lab_results_code ON lab_results(result_code);
CREATE INDEX idx_lab_results_abnormal ON lab_results(abnormal_flag);
CREATE INDEX idx_lab_results_reviewed ON lab_results(is_reviewed);

-- =====================================================
-- DOCUMENTS TABLE (mobiledoc.document)
-- Scanned documents, uploaded files, OCR metadata
-- =====================================================
CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,
    encounter_id INT REFERENCES encounters(encounter_id),

    -- File Info
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,              -- PDF, JPG, PNG, TIFF, DICOM
    file_size_bytes BIGINT,
    file_path VARCHAR(500),                      -- Encrypted storage path
    file_hash VARCHAR(64),                       -- SHA-256 for integrity

    -- Classification
    document_type VARCHAR(50) NOT NULL,          -- Insurance Card, Referral, Lab Report, etc.
    document_category VARCHAR(30),               -- Clinical, Administrative, Financial, Legal
    document_date DATE,                          -- Date on the document itself
    description TEXT,

    -- Source
    source VARCHAR(30) DEFAULT 'upload',         -- upload, scan, fax, portal, interface
    scanned_by INT REFERENCES users(user_id),
    scanner_device VARCHAR(100),

    -- OCR
    ocr_processed BOOLEAN DEFAULT FALSE,
    ocr_text TEXT,                               -- Extracted text from OCR
    ocr_confidence DECIMAL(5,2),                 -- OCR confidence %
    ocr_processed_at TIMESTAMP,

    -- Review
    is_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by INT REFERENCES users(user_id),
    reviewed_at TIMESTAMP,

    -- Security
    is_confidential BOOLEAN DEFAULT FALSE,       -- Extra access controls
    access_level VARCHAR(20) DEFAULT 'normal',   -- normal, restricted, provider_only

    -- Retention
    retention_date DATE,                         -- When doc can be purged per policy
    is_archived BOOLEAN DEFAULT FALSE,

    -- Versioning
    version INT DEFAULT 1,
    parent_document_id INT REFERENCES documents(document_id),

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_documents_encounter ON documents(encounter_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_category ON documents(document_category);

-- =====================================================
-- PATIENT_CONTACTS TABLE (mobiledoc.patient_contact)
-- Emergency contacts and additional contact records
-- =====================================================
CREATE TABLE patient_contacts (
    contact_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) NOT NULL,

    -- Contact Type
    contact_type VARCHAR(20) NOT NULL,           -- Emergency, Next of Kin, Guardian, Power of Attorney
    is_primary BOOLEAN DEFAULT FALSE,

    -- Contact Info
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    relationship VARCHAR(30),                    -- Parent, Spouse, Sibling, Child, Friend, Other
    phone_home VARCHAR(20),
    phone_mobile VARCHAR(20),
    phone_work VARCHAR(20),
    email VARCHAR(100),

    -- Address
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip VARCHAR(10),

    -- Legal
    has_legal_authority BOOLEAN DEFAULT FALSE,   -- Healthcare proxy, POA
    legal_document_id INT REFERENCES documents(document_id),

    -- Notes
    notes TEXT,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patient_contacts_patient ON patient_contacts(patient_id);
CREATE INDEX idx_patient_contacts_type ON patient_contacts(contact_type);

-- =====================================================
-- PAYMENTS TABLE
-- Payment posting and reconciliation (ERA/EOB)
-- =====================================================
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    claim_id INT REFERENCES claims(claim_id),
    patient_id INT REFERENCES patients(patient_id) NOT NULL,

    -- Payment Info
    payment_number VARCHAR(50),
    payment_date DATE NOT NULL,
    payment_type VARCHAR(20) NOT NULL,           -- Insurance, Patient, ERA, EOB
    payment_method VARCHAR(20),                  -- Check, EFT, Credit Card, Cash

    -- Amounts
    payment_amount DECIMAL(10,2) NOT NULL,
    adjustment_amount DECIMAL(10,2) DEFAULT 0,
    copay_amount DECIMAL(10,2) DEFAULT 0,
    coinsurance_amount DECIMAL(10,2) DEFAULT 0,
    deductible_amount DECIMAL(10,2) DEFAULT 0,

    -- Payer Info
    payer_id VARCHAR(10),
    payer_name VARCHAR(100),
    check_number VARCHAR(50),
    eft_trace_number VARCHAR(50),

    -- ERA/Remittance
    era_id VARCHAR(50),                          -- 835 remittance ID
    era_received_at TIMESTAMP,

    -- Line-Level Detail
    procedure_code VARCHAR(10),
    service_date DATE,
    billed_amount DECIMAL(10,2),
    allowed_amount DECIMAL(10,2),
    adjustment_reason_code VARCHAR(10),          -- CARC
    adjustment_reason_desc VARCHAR(255),
    remark_code VARCHAR(10),                     -- RARC

    -- Posting
    posted_by INT REFERENCES users(user_id),
    posted_at TIMESTAMP,
    is_posted BOOLEAN DEFAULT FALSE,

    -- Reconciliation
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMP,
    reconciled_by INT REFERENCES users(user_id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_claim ON payments(claim_id);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_payer ON payments(payer_id);
