-- =====================================================
-- MIGRATION 003: FINANCIAL TABLES
-- Payments, Denials, Authorizations, Referrals
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- =====================================================
-- PAYMENTS TABLE
-- ERA/EOB Payment Posting
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    claim_id INT REFERENCES claims(claim_id),
    patient_id INT REFERENCES patients(patient_id),

    -- Payment Info
    payment_date DATE NOT NULL,
    payment_type VARCHAR(20),
    payment_method VARCHAR(20),
    check_number VARCHAR(30),
    eft_number VARCHAR(30),

    -- Amounts
    payment_amount DECIMAL(10,2) NOT NULL,
    adjustment_amount DECIMAL(10,2) DEFAULT 0,

    -- Payer
    payer_name VARCHAR(100),
    era_number VARCHAR(30),

    -- Posting
    posted_by UUID,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    reconciled BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_claim ON payments(claim_id);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- =====================================================
-- DENIALS TABLE
-- Claim Denial Tracking & Routing
-- =====================================================
CREATE TABLE IF NOT EXISTS denials (
    denial_id SERIAL PRIMARY KEY,
    claim_id INT REFERENCES claims(claim_id),

    -- Denial Info
    denial_date DATE NOT NULL,
    denial_reason VARCHAR(200),
    carc_code VARCHAR(10),
    rarc_code VARCHAR(10),
    denial_category VARCHAR(50),

    -- Routing
    routed_to_department VARCHAR(50),
    routed_to_user UUID,
    assigned_at TIMESTAMPTZ,

    -- Resolution
    status VARCHAR(20) DEFAULT 'open',
    resolution_notes TEXT,
    appeal_date DATE,
    appeal_status VARCHAR(20),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,

    -- Amounts
    denied_amount DECIMAL(10,2),
    recovered_amount DECIMAL(10,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_denials_claim ON denials(claim_id);
CREATE INDEX idx_denials_status ON denials(status);
CREATE INDEX idx_denials_category ON denials(denial_category);

-- =====================================================
-- SERVICE AUTHORIZATIONS TABLE
-- Prior Authorization Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS service_authorizations (
    authorization_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),

    -- Auth Info
    auth_number VARCHAR(50),
    payer_name VARCHAR(100),
    authorization_type VARCHAR(30),
    status VARCHAR(20) DEFAULT 'pending',

    -- Service Details
    service_description TEXT,
    cpt_codes JSONB DEFAULT '[]',
    diagnosis_codes JSONB DEFAULT '[]',

    -- Dates
    requested_date DATE,
    approved_date DATE,
    effective_date DATE,
    expiration_date DATE,

    -- Visits
    visits_approved INT DEFAULT 0,
    visits_used INT DEFAULT 0,
    visits_remaining INT GENERATED ALWAYS AS (visits_approved - visits_used) STORED,

    -- Providers
    ordering_provider_id INT REFERENCES providers(provider_id),
    servicing_provider_id INT REFERENCES providers(provider_id),
    facility_tin VARCHAR(12),

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_patient ON service_authorizations(patient_id);
CREATE INDEX idx_auth_status ON service_authorizations(status);
CREATE INDEX idx_auth_expiration ON service_authorizations(expiration_date);

-- =====================================================
-- REFERRALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
    referral_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(patient_id),

    referring_provider_id INT REFERENCES providers(provider_id),
    referred_to_provider_id INT REFERENCES providers(provider_id),

    referral_number VARCHAR(50),
    reason TEXT,
    urgency VARCHAR(20) DEFAULT 'routine',
    status VARCHAR(20) DEFAULT 'pending',

    referral_date DATE,
    expiration_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_patient ON referrals(patient_id);
CREATE INDEX idx_referrals_status ON referrals(status);
