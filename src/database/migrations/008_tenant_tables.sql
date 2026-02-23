-- =====================================================
-- HealthOps Backoffice OS — Multi-Tenant Tables
-- Phase N1: Tenant infrastructure
-- PRD Coverage: MT-01→06, DATA-01, SEC-15→19
-- =====================================================

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'standard', -- standard | professional | enterprise
    facility_type VARCHAR(100),
    location VARCHAR(255),
    npi VARCHAR(10),
    tax_id VARCHAR(20),
    enabled_modules TEXT[] NOT NULL DEFAULT '{"eligibility","prior-auth"}',
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TENANT USERS (links auth.users to tenants with roles)
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin | supervisor | staff | viewer
    permissions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 3. MODULE CONFIGS (per-tenant module settings)
CREATE TABLE IF NOT EXISTS module_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}', -- module-specific settings
    activated_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, module_id)
);

-- 4. PAYER RULES (per-tenant CPT/payer authorization rules)
-- PRD PA-01, PA-02, WF-05
CREATE TABLE IF NOT EXISTS payer_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payer_id VARCHAR(50) NOT NULL,
    payer_name VARCHAR(255) NOT NULL,
    cpt_code VARCHAR(10) NOT NULL,
    requires_auth BOOLEAN NOT NULL DEFAULT false,
    sla_hours INTEGER NOT NULL DEFAULT 48,
    doc_checklist TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, payer_id, cpt_code)
);

-- 5. SLA CONFIGURATIONS (per-tenant, per-payer SLA thresholds)
-- PRD AFU-02, WF-02
CREATE TABLE IF NOT EXISTS sla_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payer_id VARCHAR(50),           -- NULL = default for all payers
    module_id VARCHAR(50) NOT NULL, -- 'eligibility', 'prior-auth', etc.
    threshold_hours INTEGER NOT NULL DEFAULT 48,
    warning_hours INTEGER NOT NULL DEFAULT 24, -- yellow alert
    critical_hours INTEGER NOT NULL DEFAULT 6, -- red alert
    escalation_chain TEXT[] DEFAULT '{"staff","supervisor","manager"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, payer_id, module_id)
);

-- 6. COMMUNICATION LOG (payer/provider/patient comms audit trail)
-- PRD COM-01→04, AFU-04
CREATE TABLE IF NOT EXISTS communication_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id VARCHAR(50),
    auth_id VARCHAR(50),
    comm_type VARCHAR(50) NOT NULL, -- 'payer_call' | 'provider_fax' | 'patient_msg' | 'email'
    direction VARCHAR(10) NOT NULL DEFAULT 'outbound', -- inbound | outbound
    payer_name VARCHAR(255),
    reference_number VARCHAR(100),
    contact_name VARCHAR(255),
    summary TEXT NOT NULL,
    outcome VARCHAR(50), -- 'info_received' | 'pending' | 'escalated' | 'resolved'
    logged_by UUID,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (DATA-01, SEC-15→19)
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payer_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

-- Tenant isolation: users only see their tenant's data
CREATE POLICY tenant_select ON tenants FOR SELECT TO authenticated
    USING (id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY tenant_users_select ON tenant_users FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY module_configs_select ON module_configs FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY payer_rules_select ON payer_rules FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY sla_configs_select ON sla_configs FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY comm_log_select ON communication_log FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

-- Insert policies (same tenant check)
CREATE POLICY payer_rules_insert ON payer_rules FOR INSERT TO authenticated
    WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY comm_log_insert ON communication_log FOR INSERT TO authenticated
    WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX idx_module_configs_tenant ON module_configs(tenant_id);
CREATE INDEX idx_payer_rules_tenant_payer ON payer_rules(tenant_id, payer_id);
CREATE INDEX idx_sla_configs_tenant ON sla_configs(tenant_id);
CREATE INDEX idx_comm_log_tenant ON communication_log(tenant_id);
CREATE INDEX idx_comm_log_auth ON communication_log(auth_id);
