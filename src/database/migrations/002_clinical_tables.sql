-- =====================================================
-- MIGRATION 002: CLINICAL TABLES
-- Encounters, Diagnoses, Procedures, Claims, Claim Lines
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- =====================================================
-- ENCOUNTERS TABLE
-- Appointments / Visits
-- =====================================================
CREATE TABLE IF NOT EXISTS encounters (
    encounter_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
    provider_id INT REFERENCES providers(provider_id),

    -- Visit Info
    encounter_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    visit_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'scheduled',
    place_of_service VARCHAR(5) DEFAULT '11',

    -- Clinical
    chief_complaint TEXT,
    visit_notes TEXT,

    -- E&M Level
    em_code VARCHAR(10),
    em_level INT,
    mdm_complexity VARCHAR(20),
    total_time_minutes INT,

    -- AI Extensions (Phase F)
    no_show_risk_score DECIMAL(3,2),
    ai_recommended_slot BOOLEAN DEFAULT FALSE,
    optimal_scheduling_rank INT,

    -- Authorization
    authorization_number VARCHAR(50),
    authorization_required BOOLEAN DEFAULT FALSE,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_provider ON encounters(provider_id);
CREATE INDEX idx_encounters_date ON encounters(encounter_date);
CREATE INDEX idx_encounters_status ON encounters(status);
CREATE INDEX idx_encounters_no_show ON encounters(no_show_risk_score);

-- =====================================================
-- ENCOUNTER DIAGNOSES TABLE
-- ICD-10 Codes linked to encounters
-- =====================================================
CREATE TABLE IF NOT EXISTS encounter_diagnoses (
    diagnosis_id SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounters(encounter_id) ON DELETE CASCADE,

    icd10_code VARCHAR(10) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,
    is_hcc BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnoses_encounter ON encounter_diagnoses(encounter_id);
CREATE INDEX idx_diagnoses_code ON encounter_diagnoses(icd10_code);

-- =====================================================
-- ENCOUNTER PROCEDURES TABLE
-- CPT Codes linked to encounters
-- =====================================================
CREATE TABLE IF NOT EXISTS encounter_procedures (
    procedure_id SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounters(encounter_id) ON DELETE CASCADE,

    cpt_code VARCHAR(10) NOT NULL,
    description TEXT,
    quantity INT DEFAULT 1,
    fee DECIMAL(10,2),
    
    -- Modifiers (up to 4)
    modifier1 VARCHAR(5),
    modifier2 VARCHAR(5),
    modifier3 VARCHAR(5),
    modifier4 VARCHAR(5),

    -- Diagnosis pointers (Box 24E)
    diagnosis_pointer VARCHAR(20),

    -- NDC for injectables
    ndc_code VARCHAR(15),
    ndc_unit VARCHAR(10),
    ndc_quantity DECIMAL(10,3),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procedures_encounter ON encounter_procedures(encounter_id);
CREATE INDEX idx_procedures_cpt ON encounter_procedures(cpt_code);

-- =====================================================
-- CLAIMS TABLE
-- 837P Professional Claims
-- =====================================================
CREATE TABLE IF NOT EXISTS claims (
    claim_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),
    encounter_id INT REFERENCES encounters(encounter_id),
    provider_id INT REFERENCES providers(provider_id),

    -- Claim Info
    claim_number VARCHAR(30) UNIQUE,
    claim_type VARCHAR(10) DEFAULT 'professional',
    status VARCHAR(20) DEFAULT 'draft',
    submission_date DATE,
    service_date DATE,

    -- Providers
    rendering_provider_npi VARCHAR(10),
    referring_provider_npi VARCHAR(10),
    billing_provider_npi VARCHAR(10),

    -- Payer
    payer_name VARCHAR(100),
    payer_id VARCHAR(20),
    member_id VARCHAR(50),

    -- Authorization
    authorization_number VARCHAR(50),
    requires_authorization BOOLEAN DEFAULT FALSE,
    authorization_expiry DATE,

    -- Amounts
    total_charge DECIMAL(10,2),
    allowed_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2) DEFAULT 0,
    patient_responsibility DECIMAL(10,2) DEFAULT 0,
    adjustment_amount DECIMAL(10,2) DEFAULT 0,

    -- Diagnosis codes (JSON array)
    diagnosis_codes JSONB DEFAULT '[]',
    -- Procedure codes (JSON array)
    procedure_codes JSONB DEFAULT '[]',

    -- AI Extensions (Phase F)
    denial_risk_score DECIMAL(3,2),
    ai_scrub_recommendations JSONB,
    confidence_score DECIMAL(3,2),
    predicted_reimbursement DECIMAL(10,2),

    -- Place of Service
    place_of_service VARCHAR(5) DEFAULT '11',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    created_by UUID
);

CREATE INDEX idx_claims_patient ON claims(patient_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_number ON claims(claim_number);
CREATE INDEX idx_claims_service_date ON claims(service_date);
CREATE INDEX idx_claims_denial_risk ON claims(denial_risk_score);

-- =====================================================
-- CLAIM LINE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS claim_line_items (
    line_id SERIAL PRIMARY KEY,
    claim_id INT REFERENCES claims(claim_id) ON DELETE CASCADE,

    line_number INT NOT NULL,
    cpt_code VARCHAR(10) NOT NULL,
    description TEXT,
    quantity INT DEFAULT 1,
    charge_amount DECIMAL(10,2),
    allowed_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2) DEFAULT 0,

    modifier1 VARCHAR(5),
    modifier2 VARCHAR(5),

    diagnosis_pointer VARCHAR(20),
    place_of_service VARCHAR(5) DEFAULT '11',

    ndc_code VARCHAR(15),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claim_lines_claim ON claim_line_items(claim_id);
