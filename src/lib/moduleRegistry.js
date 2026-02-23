/**
 * Module Registry — Central Module Definition & Feature Flags
 * HealthOps Backoffice OS — Phase N1
 *
 * All 10 PRD modules defined here. Feature flags control which
 * modules are rendered per tenant at runtime.
 *
 * PRD Coverage: MOD-01→04, FF-01→04
 */

// =====================================================
// MODULE DEFINITIONS (all 10 from PRD §3.2)
// =====================================================

export const MODULE_REGISTRY = [
    {
        id: 'scheduling',
        name: 'Scheduling Management',
        shortName: 'Scheduling',
        icon: '📅',
        description: 'Pre-service coordination, appointment validation, calendar dashboard',
        category: 'pre-service',
        prdSection: '3.3',
        prdIds: ['SCH-01', 'SCH-02', 'SCH-03', 'SCH-04', 'SCH-05'],
        status: 'planned',
        dependencies: [],
        pricing: '$299/provider/mo',
    },
    {
        id: 'eligibility',
        name: 'Eligibility Verification',
        shortName: 'Eligibility',
        icon: '✓',
        description: 'Real-time 270/271, benefit capture, coverage validation, auto re-verify',
        category: 'pre-service',
        prdSection: '3.4',
        prdIds: ['ELG-01', 'ELG-02', 'ELG-03', 'ELG-04', 'ELG-05'],
        status: 'active',
        dependencies: [],
        pricing: '$249/provider/mo',
    },
    {
        id: 'referral',
        name: 'Referral Tracking',
        shortName: 'Referrals',
        icon: '↗',
        description: 'Referral intake, expiry alerts, usage limits, NPI validation',
        category: 'pre-service',
        prdSection: '3.5',
        prdIds: ['REF-01', 'REF-02', 'REF-03', 'REF-04'],
        status: 'planned',
        dependencies: [],
        pricing: '$149/provider/mo',
    },
    {
        id: 'prior-auth',
        name: 'Prior Authorization',
        shortName: 'Prior Auth',
        icon: '◆',
        description: 'CPT rule engine, 278 EDI submission, payer matrix, doc checklist',
        category: 'authorization',
        prdSection: '3.6',
        prdIds: ['PA-01', 'PA-02', 'PA-03', 'PA-04', 'PA-05', 'PA-06'],
        status: 'active',
        dependencies: ['eligibility'],
        pricing: '$249/provider/mo',
    },
    {
        id: 'auth-followup',
        name: 'Authorization Follow-Up',
        shortName: 'Follow-Up',
        icon: '⏱',
        description: 'Aging dashboard, SLA timers, escalation chains, payer comms',
        category: 'authorization',
        prdSection: '3.7',
        prdIds: ['AFU-01', 'AFU-02', 'AFU-03', 'AFU-04'],
        status: 'active',
        dependencies: ['prior-auth'],
        pricing: 'Included with Prior Auth',
    },
    {
        id: 'denial-tracking',
        name: 'Denial Tracking',
        shortName: 'Denials',
        icon: '✕',
        description: 'Denial categorization, appeal tracking, root cause analysis',
        category: 'post-service',
        prdSection: '3.8',
        prdIds: ['DEN-01', 'DEN-02', 'DEN-03', 'DEN-04'],
        status: 'planned',
        dependencies: ['prior-auth'],
        pricing: '$199/provider/mo',
    },
    {
        id: 'financial-clearance',
        name: 'Financial Clearance',
        shortName: 'Financial',
        icon: '$',
        description: 'Pre-service estimates, self-pay routing, clearance status',
        category: 'pre-service',
        prdSection: '3.9',
        prdIds: ['FIN-01', 'FIN-02', 'FIN-03'],
        status: 'planned',
        dependencies: ['eligibility'],
        pricing: '$199/provider/mo',
    },
    {
        id: 'communication',
        name: 'Communication Hub',
        shortName: 'Comms',
        icon: '💬',
        description: 'Patient/provider/payer communication audit trail',
        category: 'operations',
        prdSection: '3.10',
        prdIds: ['COM-01', 'COM-02', 'COM-03', 'COM-04'],
        status: 'planned',
        dependencies: [],
        pricing: '$149/provider/mo',
    },
    {
        id: 'reporting',
        name: 'Reporting & Analytics',
        shortName: 'Reports',
        icon: '📊',
        description: 'RCM metrics, dashboards, compliance exports',
        category: 'operations',
        prdSection: '3.11',
        prdIds: [],
        status: 'planned',
        dependencies: [],
        pricing: '$99/provider/mo',
    },
    {
        id: 'workforce',
        name: 'Workforce Marketplace',
        shortName: 'Workforce',
        icon: '👥',
        description: 'Hire shared/dedicated FTEs, productivity tracking, SLA monitoring',
        category: 'operations',
        prdSection: '3.11',
        prdIds: ['WFM-01', 'WFM-02', 'WFM-03', 'WFM-04', 'WFM-05', 'WFM-06'],
        status: 'planned',
        dependencies: [],
        pricing: 'Per FTE',
    },
];

// =====================================================
// FEATURE FLAG FUNCTIONS (FF-01→04)
// =====================================================

/**
 * Check if a module is enabled for a tenant.
 * @param {Array} enabledModules - from tenant config
 * @param {string} moduleId
 */
export function isModuleEnabled(enabledModules, moduleId) {
    if (!enabledModules || !Array.isArray(enabledModules)) return false;
    // Auth follow-up is included with prior-auth
    if (moduleId === 'auth-followup') return enabledModules.includes('prior-auth');
    return enabledModules.includes(moduleId);
}

/**
 * Get active modules for a tenant (for sidebar rendering).
 */
export function getEnabledModules(enabledModules) {
    return MODULE_REGISTRY.filter(m =>
        isModuleEnabled(enabledModules, m.id) && m.status !== 'disabled'
    );
}

/**
 * Get a module definition by ID.
 */
export function getModuleById(moduleId) {
    return MODULE_REGISTRY.find(m => m.id === moduleId) || null;
}

/**
 * Check module dependencies before enabling.
 * @returns {Object} { canEnable, missingDeps }
 */
export function checkModuleDependencies(moduleId, enabledModules) {
    const mod = getModuleById(moduleId);
    if (!mod) return { canEnable: false, missingDeps: ['Module not found'] };

    const missingDeps = (mod.dependencies || []).filter(dep => !enabledModules.includes(dep));
    return { canEnable: missingDeps.length === 0, missingDeps };
}

/**
 * Get modules grouped by category for settings UI.
 */
export function getModulesByCategory() {
    const categories = {};
    for (const mod of MODULE_REGISTRY) {
        if (!categories[mod.category]) {
            categories[mod.category] = { label: formatCategory(mod.category), modules: [] };
        }
        categories[mod.category].modules.push(mod);
    }
    return categories;
}

function formatCategory(cat) {
    const labels = {
        'pre-service': 'Pre-Service',
        'authorization': 'Authorization',
        'post-service': 'Post-Service',
        'operations': 'Operations',
    };
    return labels[cat] || cat;
}

export default {
    MODULE_REGISTRY,
    isModuleEnabled,
    getEnabledModules,
    getModuleById,
    checkModuleDependencies,
    getModulesByCategory,
};
