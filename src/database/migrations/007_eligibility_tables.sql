-- =====================================================
-- MIGRATION 007: ELIGIBILITY VERIFICATION TABLES
-- Phase L: Real-time eligibility check history
-- Run in Supabase SQL Editor AFTER migration 006
-- =====================================================

-- Eligibility verification results (270/271 transaction log)
CREATE TABLE IF NOT EXISTS eligibility_verifications (
    verification_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       INT REFERENCES patients(patient_id),
    
    -- Payer info
    payer_id         VARCHAR(20) NOT NULL,
    payer_name       VARCHAR(200),
    member_id        VARCHAR(100),
    group_number     VARCHAR(50),
    
    -- Result
    status           VARCHAR(20) NOT NULL DEFAULT 'Pending'
                     CHECK (status IN ('Active', 'Inactive', 'Pending', 'Error')),
    
    -- Coverage details (JSON)
    coverage_json    JSONB,         -- { type, network, effectiveDate, terminationDate }
    benefits_json    JSONB,         -- { deductible, copay, coinsurance, oopMax, ... }
    plan_json        JSONB,         -- { name, groupNumber, planNumber }
    
    -- Raw transaction data
    raw_request      JSONB,         -- Stedi request payload
    raw_response     JSONB,         -- Stedi 271 response
    
    -- Metadata
    mode             VARCHAR(10) DEFAULT 'mock'
                     CHECK (mode IN ('live', 'mock')),
    verified_by      UUID REFERENCES auth.users(id),
    verified_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_elig_patient   ON eligibility_verifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_elig_status    ON eligibility_verifications(status);
CREATE INDEX IF NOT EXISTS idx_elig_payer     ON eligibility_verifications(payer_id);
CREATE INDEX IF NOT EXISTS idx_elig_verified  ON eligibility_verifications(verified_at DESC);

-- RLS
ALTER TABLE eligibility_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY elig_select ON eligibility_verifications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY elig_insert ON eligibility_verifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE eligibility_verifications IS 'Stores each 270/271 eligibility check result for audit and history';
COMMENT ON COLUMN eligibility_verifications.benefits_json IS 'Normalized benefit data: deductible, copay, coinsurance, OOP max/met';
COMMENT ON COLUMN eligibility_verifications.mode IS 'live = real Stedi API call, mock = simulated response';
