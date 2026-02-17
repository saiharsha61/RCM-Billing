-- =====================================================
-- MIGRATION 006: AUTHORIZATION MODULE TABLES
-- Spec v1.0: Full PA lifecycle with state machine,
-- audit logging, document attachments, payer rules
-- Run in Supabase SQL Editor AFTER migrations 001-005
-- =====================================================

-- =====================================================
-- AUTHORIZATION STATES ENUM
-- Section 3.1: No state can be skipped
-- =====================================================
CREATE TYPE auth_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'PENDING',
    'APPROVED',
    'DENIED',
    'APPEALED',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE auth_service_type AS ENUM (
    'INPATIENT',
    'OUTPATIENT'
);

-- =====================================================
-- AUTHORIZATIONS TABLE (Section 5.1)
-- Full PA lifecycle with state machine
-- =====================================================
CREATE TABLE IF NOT EXISTS authorizations (
    auth_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INT REFERENCES patients(patient_id) ON DELETE CASCADE,
    payer_id VARCHAR(20),
    provider_id INT REFERENCES providers(provider_id),

    -- Payer-assigned auth number (FR-09)
    auth_number VARCHAR(50) UNIQUE,

    -- State Machine (Section 3.1)
    status auth_status NOT NULL DEFAULT 'DRAFT',

    -- Service Type (FR-04)
    service_type auth_service_type NOT NULL DEFAULT 'OUTPATIENT',

    -- Request Details
    service_description TEXT,
    cpt_codes JSONB NOT NULL DEFAULT '[]',
    diagnosis_codes JSONB NOT NULL DEFAULT '[]',

    -- Units (FR-14: partial approval tracking)
    units_requested INT NOT NULL DEFAULT 1,
    units_approved INT,

    -- Dates
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    requested_date DATE DEFAULT CURRENT_DATE,
    submitted_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,

    -- Payer Info
    payer_name VARCHAR(100),
    payer_response_code VARCHAR(20),

    -- Denial (FR-11)
    denial_reason VARCHAR(255),
    denial_code VARCHAR(20),

    -- Appeal (FR-12, FR-13)
    appeal_reason TEXT,
    appeal_submitted_at TIMESTAMPTZ,
    appeal_decided_at TIMESTAMPTZ,
    appeal_outcome VARCHAR(20),
    peer_to_peer_scheduled TIMESTAMPTZ,
    peer_to_peer_notes TEXT,

    -- Ordering / Servicing Providers
    ordering_provider_id INT REFERENCES providers(provider_id),
    servicing_provider_id INT REFERENCES providers(provider_id),
    facility_tin VARCHAR(12),

    -- X12 278 Tracking (FR-06)
    x12_278_request TEXT,
    x12_278_response TEXT,
    clearinghouse_ref VARCHAR(50),
    submission_method VARCHAR(20) DEFAULT 'EDI',

    -- Clinical Documentation (FR-03)
    clinical_notes TEXT,
    attached_document_ids JSONB DEFAULT '[]',

    -- Urgency
    urgency VARCHAR(20) DEFAULT 'routine',

    -- Audit
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_patient ON authorizations(patient_id);
CREATE INDEX idx_auth_status ON authorizations(status);
CREATE INDEX idx_auth_payer ON authorizations(payer_id);
CREATE INDEX idx_auth_expiry ON authorizations(expiry_date);
CREATE INDEX idx_auth_number ON authorizations(auth_number);
CREATE INDEX idx_auth_provider ON authorizations(provider_id);

-- =====================================================
-- AUTHORIZATION AUDIT LOG (Section 5.2)
-- Immutable log of all state changes and PHI access
-- =====================================================
CREATE TABLE IF NOT EXISTS authorization_audit_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES authorizations(auth_id) ON DELETE CASCADE,

    -- Action tracking
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,

    -- Who
    performed_by UUID,
    performed_by_name VARCHAR(100),
    performed_by_role VARCHAR(50),

    -- Security (Section 6.2)
    ip_address INET,
    user_agent TEXT,

    -- When
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_auth ON authorization_audit_log(auth_id);
CREATE INDEX idx_audit_action ON authorization_audit_log(action);
CREATE INDEX idx_audit_timestamp ON authorization_audit_log(timestamp);

-- =====================================================
-- AUTHORIZATION DOCUMENTS (FR-03)
-- Clinical doc attachments for auth requests
-- =====================================================
CREATE TABLE IF NOT EXISTS authorization_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES authorizations(auth_id) ON DELETE CASCADE,

    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INT,
    mime_type VARCHAR(100),
    storage_key VARCHAR(500),

    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),

    notes TEXT
);

CREATE INDEX idx_auth_docs ON authorization_documents(auth_id);

-- =====================================================
-- PAYER AUTH RULES (FR-01)
-- CPT/payer-based auto-detection of auth requirements
-- =====================================================
CREATE TABLE IF NOT EXISTS payer_auth_rules (
    rule_id SERIAL PRIMARY KEY,

    payer_id VARCHAR(20) NOT NULL,
    payer_name VARCHAR(100),

    -- CPT/HCPCS matching
    cpt_code VARCHAR(10),
    cpt_range_start VARCHAR(10),
    cpt_range_end VARCHAR(10),
    code_type VARCHAR(10) DEFAULT 'CPT',

    -- Rule config
    auth_required BOOLEAN NOT NULL DEFAULT TRUE,
    service_type auth_service_type DEFAULT 'OUTPATIENT',
    turnaround_hours INT DEFAULT 72,
    submission_method VARCHAR(20) DEFAULT 'EDI',
    max_units INT DEFAULT 1,

    -- SLA by state
    state_code CHAR(2),
    state_specific_hours INT,

    -- Validity
    effective_date DATE DEFAULT CURRENT_DATE,
    termination_date DATE,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rules_payer ON payer_auth_rules(payer_id);
CREATE INDEX idx_rules_cpt ON payer_auth_rules(cpt_code);
CREATE INDEX idx_rules_active ON payer_auth_rules(is_active);

-- =====================================================
-- SEED: PAYER AUTH RULES (Common scenarios)
-- =====================================================
INSERT INTO payer_auth_rules (payer_id, payer_name, cpt_code, auth_required, service_type, turnaround_hours, submission_method) VALUES
-- Medicare rules
('MEDTX', 'Medicare of Texas', '70553', true, 'OUTPATIENT', 72, 'EDI'),
('MEDTX', 'Medicare of Texas', '70551', true, 'OUTPATIENT', 72, 'EDI'),
('MEDTX', 'Medicare of Texas', '73721', true, 'OUTPATIENT', 72, 'EDI'),
('MEDTX', 'Medicare of Texas', '27447', true, 'INPATIENT', 48, 'EDI'),
('MEDTX', 'Medicare of Texas', '11042', false, 'OUTPATIENT', NULL, NULL),
('MEDTX', 'Medicare of Texas', '97597', false, 'OUTPATIENT', NULL, NULL),
-- BCBS rules
('BCBSTX', 'Blue Cross Blue Shield TX', '70553', true, 'OUTPATIENT', 48, 'PORTAL'),
('BCBSTX', 'Blue Cross Blue Shield TX', '27447', true, 'INPATIENT', 24, 'EDI'),
('BCBSTX', 'Blue Cross Blue Shield TX', '43239', true, 'OUTPATIENT', 72, 'EDI'),
-- Aetna rules
('AETNA', 'Aetna', '70553', true, 'OUTPATIENT', 48, 'EDI'),
('AETNA', 'Aetna', '27447', true, 'INPATIENT', 48, 'EDI'),
('AETNA', 'Aetna', '99215', false, 'OUTPATIENT', NULL, NULL),
-- UHC rules
('UHC', 'United Healthcare', '70553', true, 'OUTPATIENT', 24, 'EDI'),
('UHC', 'United Healthcare', '27447', true, 'INPATIENT', 24, 'EDI'),
('UHC', 'United Healthcare', '43239', true, 'OUTPATIENT', 48, 'PORTAL');

-- =====================================================
-- RLS POLICIES FOR AUTH TABLES
-- =====================================================
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payer_auth_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth access for authenticated" ON authorizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Audit log access for authenticated" ON authorization_audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth docs access for authenticated" ON authorization_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth rules readable by all" ON payer_auth_rules FOR SELECT TO authenticated, anon USING (is_active = true);
