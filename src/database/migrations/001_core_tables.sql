-- =====================================================
-- MIGRATION 001: CORE TABLES
-- Providers, Patients, Guarantors, Patient Insurance
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROVIDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS providers (
    provider_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    credentials VARCHAR(20),
    npi VARCHAR(10) UNIQUE,
    tax_id VARCHAR(12),
    license_number VARCHAR(30),
    specialty_type VARCHAR(50),
    taxonomy_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    facility VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_npi ON providers(npi);
CREATE INDEX idx_providers_name ON providers(last_name, first_name);
CREATE INDEX idx_providers_specialty ON providers(specialty_type);

-- =====================================================
-- PATIENTS TABLE
-- Core demographics (CMS-1500 Boxes 2, 3, 5)
-- =====================================================
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    account_no VARCHAR(20) UNIQUE NOT NULL,

    -- Demographics (Box 2)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    suffix VARCHAR(10),

    -- Box 3
    date_of_birth DATE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'U')),

    -- SSN (encrypted at rest)
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

    -- Marital / Employment
    marital_status VARCHAR(20),
    employment_status VARCHAR(20),

    -- Provider Assignment
    pcp_provider_id INT REFERENCES providers(provider_id),
    rendering_provider_id INT REFERENCES providers(provider_id),
    referring_provider_id INT REFERENCES providers(provider_id),

    -- Balances
    account_balance DECIMAL(10,2) DEFAULT 0,
    patient_balance DECIMAL(10,2) DEFAULT 0,

    -- AI Extensions (Phase F)
    propensity_to_pay_score DECIMAL(3,2),
    preferred_contact_method VARCHAR(20) DEFAULT 'phone',
    optimal_contact_time VARCHAR(20),
    no_show_history INT DEFAULT 0,
    distance_miles DECIMAL(6,1),

    -- Self-Service Flags
    patient_entered BOOLEAN DEFAULT FALSE,
    patient_entered_at TIMESTAMPTZ,
    review_status VARCHAR(20) DEFAULT 'pending',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);
CREATE INDEX idx_patients_account ON patients(account_no);
CREATE INDEX idx_patients_propensity ON patients(propensity_to_pay_score);

-- =====================================================
-- GUARANTORS TABLE
-- Responsible party for billing
-- =====================================================
CREATE TABLE IF NOT EXISTS guarantors (
    guarantor_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,

    relationship_to_patient VARCHAR(20) NOT NULL,

    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    ssn_encrypted VARCHAR(255),

    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),

    employer_name VARCHAR(100),
    employer_phone VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guarantors_patient ON guarantors(patient_id);

-- =====================================================
-- PATIENT INSURANCE TABLE
-- Payer Pyramid (Primary / Secondary / Tertiary)
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_insurance (
    insurance_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,

    -- Tier
    insurance_order VARCHAR(10) NOT NULL CHECK (insurance_order IN ('primary', 'secondary', 'tertiary')),

    -- Payer Info
    payer_name VARCHAR(100) NOT NULL,
    payer_id VARCHAR(20),
    electronic_payer_id VARCHAR(10),
    plan_name VARCHAR(100),
    plan_type VARCHAR(30),

    -- Policy Details
    member_id VARCHAR(50),
    group_number VARCHAR(50),
    policy_number VARCHAR(50),

    -- Dates
    effective_date DATE,
    termination_date DATE,

    -- Subscriber Info (Box 4)
    subscriber_relationship VARCHAR(20) DEFAULT 'self',
    subscriber_first_name VARCHAR(50),
    subscriber_last_name VARCHAR(50),
    subscriber_dob DATE,
    subscriber_gender CHAR(1),

    -- Benefits
    copay_amount DECIMAL(10,2),
    coinsurance_percent DECIMAL(5,2),
    deductible_amount DECIMAL(10,2),
    deductible_met DECIMAL(10,2) DEFAULT 0,
    oop_max DECIMAL(10,2),
    oop_met DECIMAL(10,2) DEFAULT 0,

    -- AI Extensions
    eligibility_status VARCHAR(20) DEFAULT 'unknown',
    last_verified_at TIMESTAMPTZ,
    auto_verification_enabled BOOLEAN DEFAULT TRUE,

    -- Payer-specific
    historical_denial_rate DECIMAL(5,4) DEFAULT 0.08,
    avg_reimbursement_rate DECIMAL(5,4) DEFAULT 0.85,
    timely_filing_limit_days INT DEFAULT 90,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(patient_id, insurance_order)
);

CREATE INDEX idx_insurance_patient ON patient_insurance(patient_id);
CREATE INDEX idx_insurance_payer ON patient_insurance(payer_name);
CREATE INDEX idx_insurance_eligibility ON patient_insurance(eligibility_status);
