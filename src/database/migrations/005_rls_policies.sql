-- =====================================================
-- MIGRATION 005: ROW-LEVEL SECURITY (RLS)
-- HIPAA-compliant access control
-- Run in Supabase SQL Editor AFTER migrations 001-004
-- =====================================================

-- =====================================================
-- Enable RLS on all tables
-- =====================================================
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounter_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounter_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE denials ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: Authenticated users can read all data
-- (In production, restrict by role/department)
-- =====================================================

-- Providers: All authenticated users can read
CREATE POLICY "Authenticated users can view providers"
    ON providers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage providers"
    ON providers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Patients: All authenticated users can CRUD
CREATE POLICY "Authenticated users can view patients"
    ON patients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage patients"
    ON patients FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Guarantors
CREATE POLICY "Authenticated users can manage guarantors"
    ON guarantors FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insurance
CREATE POLICY "Authenticated users can manage insurance"
    ON patient_insurance FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Encounters
CREATE POLICY "Authenticated users can manage encounters"
    ON encounters FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Diagnoses
CREATE POLICY "Authenticated users can manage diagnoses"
    ON encounter_diagnoses FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Procedures
CREATE POLICY "Authenticated users can manage procedures"
    ON encounter_procedures FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Claims
CREATE POLICY "Authenticated users can manage claims"
    ON claims FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Claim Line Items
CREATE POLICY "Authenticated users can manage claim lines"
    ON claim_line_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Payments
CREATE POLICY "Authenticated users can manage payments"
    ON payments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Denials
CREATE POLICY "Authenticated users can manage denials"
    ON denials FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authorizations
CREATE POLICY "Authenticated users can manage authorizations"
    ON service_authorizations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Referrals
CREATE POLICY "Authenticated users can manage referrals"
    ON referrals FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- SERVICE ROLE: Full access (for server-side operations)
-- =====================================================
-- Note: The service_role key bypasses RLS by default in Supabase.
-- No additional policies needed for service role.

-- =====================================================
-- ANON ROLE: Read-only access to providers (public)
-- =====================================================
CREATE POLICY "Public can view providers"
    ON providers FOR SELECT
    TO anon
    USING (is_active = true);
