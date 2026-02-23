/**
 * Tenant Context — Multi-Tenant State Management
 * HealthOps Backoffice OS — Phase N1
 *
 * Provides tenant-aware context for the entire application:
 *   - TenantProvider wraps the app
 *   - useTenant() hook for components
 *   - tenant_id auto-injection for data queries
 *   - Per-tenant config: SLA thresholds, payer rules, enabled modules
 *
 * PRD Coverage: MT-01→06, DATA-01, SEC-15→17
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const TenantContext = createContext(null);

// =====================================================
// MOCK TENANTS (Supabase in production)
// =====================================================
const MOCK_TENANTS = [
    {
        id: 'tenant-001',
        name: 'Valley Wound Care Clinic',
        slug: 'valley-wound-care',
        plan: 'professional',
        facilityType: 'specialty_clinic',
        location: 'Mission, TX',
        npi: '1234567890',
        taxId: '12-3456789',
        enabledModules: ['eligibility', 'prior-auth'],
        config: {
            timezone: 'America/Chicago',
            defaultPayer: 'MEDTX',
            autoVerifyHours: 48,
            slaDefaults: { eligibility: 24, priorAuth: 48, followUp: 72 },
            escalationChain: ['staff', 'supervisor', 'manager'],
        },
        createdAt: '2025-01-15T00:00:00Z',
    },
    {
        id: 'tenant-002',
        name: 'Rio Grande Cardiology',
        slug: 'rio-grande-cardio',
        plan: 'standard',
        facilityType: 'specialty_clinic',
        location: 'McAllen, TX',
        npi: '2345678901',
        taxId: '23-4567890',
        enabledModules: ['eligibility', 'prior-auth', 'referral'],
        config: {
            timezone: 'America/Chicago',
            defaultPayer: 'BCBSTX',
            autoVerifyHours: 72,
            slaDefaults: { eligibility: 24, priorAuth: 72, followUp: 96 },
            escalationChain: ['staff', 'supervisor'],
        },
        createdAt: '2025-02-01T00:00:00Z',
    },
    {
        id: 'tenant-demo',
        name: 'HealthOps Demo Clinic',
        slug: 'demo',
        plan: 'enterprise',
        facilityType: 'multi_specialty',
        location: 'Austin, TX',
        npi: '9876543210',
        taxId: '98-7654321',
        enabledModules: ['eligibility', 'prior-auth', 'referral', 'scheduling', 'denial-tracking', 'financial-clearance', 'communication', 'reporting', 'workforce'],
        config: {
            timezone: 'America/Chicago',
            defaultPayer: 'UHC',
            autoVerifyHours: 48,
            slaDefaults: { eligibility: 12, priorAuth: 24, followUp: 48 },
            escalationChain: ['staff', 'lead', 'supervisor', 'manager', 'director'],
        },
        createdAt: '2025-01-01T00:00:00Z',
    },
];

// =====================================================
// TENANT PROVIDER
// =====================================================

export function TenantProvider({ children }) {
    const [currentTenant, setCurrentTenant] = useState(MOCK_TENANTS[0]);
    const [tenantLoading, setTenantLoading] = useState(false);

    const switchTenant = useCallback((tenantId) => {
        setTenantLoading(true);
        const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
        if (tenant) {
            setCurrentTenant(tenant);
        }
        setTenantLoading(false);
    }, []);

    const isModuleEnabled = useCallback((moduleId) => {
        return currentTenant?.enabledModules?.includes(moduleId) || false;
    }, [currentTenant]);

    const getTenantConfig = useCallback((key) => {
        return currentTenant?.config?.[key] ?? null;
    }, [currentTenant]);

    const getSLAThreshold = useCallback((module) => {
        return currentTenant?.config?.slaDefaults?.[module] ?? 48;
    }, [currentTenant]);

    const getEscalationChain = useCallback(() => {
        return currentTenant?.config?.escalationChain ?? ['staff', 'supervisor', 'manager'];
    }, [currentTenant]);

    const value = {
        tenant: currentTenant,
        tenantId: currentTenant?.id,
        tenantName: currentTenant?.name,
        tenantSlug: currentTenant?.slug,
        tenantPlan: currentTenant?.plan,
        enabledModules: currentTenant?.enabledModules || [],
        config: currentTenant?.config || {},
        tenantLoading,
        switchTenant,
        isModuleEnabled,
        getTenantConfig,
        getSLAThreshold,
        getEscalationChain,
        allTenants: MOCK_TENANTS,
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

// =====================================================
// HOOK
// =====================================================

export function useTenant() {
    const ctx = useContext(TenantContext);
    if (!ctx) {
        // Return safe defaults when used outside provider
        return {
            tenant: null, tenantId: null, tenantName: 'No Tenant',
            enabledModules: [], config: {},
            isModuleEnabled: () => true,
            getTenantConfig: () => null,
            getSLAThreshold: () => 48,
            getEscalationChain: () => ['staff', 'supervisor', 'manager'],
            switchTenant: () => { },
            allTenants: MOCK_TENANTS,
        };
    }
    return ctx;
}

export { MOCK_TENANTS };
export default TenantProvider;
