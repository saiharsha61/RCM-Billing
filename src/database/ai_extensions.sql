
-- =====================================================
-- AI EXTENSION FIELDS (Phase F)
-- =====================================================

-- Appointments/Encounters AI Extensions
ALTER TABLE encounters ADD COLUMN no_show_risk_score DECIMAL(3,2) DEFAULT NULL;
ALTER TABLE encounters ADD COLUMN ai_recommended_slot BOOLEAN DEFAULT FALSE;
ALTER TABLE encounters ADD COLUMN optimal_scheduling_rank INT DEFAULT NULL;

-- Claims AI Extensions
ALTER TABLE claims ADD COLUMN denial_risk_score DECIMAL(3,2) DEFAULT NULL;
ALTER TABLE claims ADD COLUMN ai_scrub_recommendations JSON DEFAULT NULL;
ALTER TABLE claims ADD COLUMN confidence_score DECIMAL(3,2) DEFAULT NULL;
ALTER TABLE claims ADD COLUMN predicted_reimbursement DECIMAL(10,2) DEFAULT NULL;

-- Insurance/Eligibility AI Extensions
ALTER TABLE patient_insurance ADD COLUMN eligibility_status VARCHAR(20) DEFAULT 'unknown';
ALTER TABLE patient_insurance ADD COLUMN last_verified_at TIMESTAMP DEFAULT NULL;
ALTER TABLE patient_insurance ADD COLUMN auto_verification_enabled BOOLEAN DEFAULT TRUE;

-- Patient Collections AI
ALTER TABLE patients ADD COLUMN propensity_to_pay_score DECIMAL(3,2) DEFAULT NULL;
ALTER TABLE patients ADD COLUMN preferred_contact_method VARCHAR(20) DEFAULT 'phone';
ALTER TABLE patients ADD COLUMN optimal_contact_time VARCHAR(20) DEFAULT NULL;

-- Indexes for AI Queries
CREATE INDEX idx_encounters_no_show_risk ON encounters(no_show_risk_score);
CREATE INDEX idx_claims_denial_risk ON claims(denial_risk_score);
CREATE INDEX idx_patients_propensity ON patients(propensity_to_pay_score);
