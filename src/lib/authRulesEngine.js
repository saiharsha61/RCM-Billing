/**
 * Authorization Rules Engine
 * Spec FR-01: Auto-detect auth requirement based on CPT/HCPCS + payer rules
 * Spec FR-02: Pre-populate request from patient demographics, insurance, and order details
 * 
 * Uses mock rules when Supabase is not configured.
 */
import { isSupabaseConfigured, supabase } from './supabaseClient';

// =====================================================
// MOCK PAYER RULES (used when Supabase is not configured)
// Based on common real-world payer requirements
// =====================================================

const MOCK_PAYER_RULES = [
    // Medicare of Texas
    { payer_id: 'MEDTX', payer_name: 'Medicare of Texas', cpt_code: '70553', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 72, submission_method: 'EDI' },
    { payer_id: 'MEDTX', payer_name: 'Medicare of Texas', cpt_code: '70551', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 72, submission_method: 'EDI' },
    { payer_id: 'MEDTX', payer_name: 'Medicare of Texas', cpt_code: '73721', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 72, submission_method: 'EDI' },
    { payer_id: 'MEDTX', payer_name: 'Medicare of Texas', cpt_code: '27447', auth_required: true, service_type: 'INPATIENT', turnaround_hours: 48, submission_method: 'EDI' },
    { payer_id: 'MEDTX', payer_name: 'Medicare of Texas', cpt_code: '11042', auth_required: false },
    { payer_id: 'MEDTX', payer_name: 'Medicare of Texas', cpt_code: '97597', auth_required: false },
    // Blue Cross Blue Shield TX
    { payer_id: 'BCBSTX', payer_name: 'Blue Cross Blue Shield TX', cpt_code: '70553', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 48, submission_method: 'PORTAL' },
    { payer_id: 'BCBSTX', payer_name: 'Blue Cross Blue Shield TX', cpt_code: '27447', auth_required: true, service_type: 'INPATIENT', turnaround_hours: 24, submission_method: 'EDI' },
    { payer_id: 'BCBSTX', payer_name: 'Blue Cross Blue Shield TX', cpt_code: '43239', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 72, submission_method: 'EDI' },
    // Aetna
    { payer_id: 'AETNA', payer_name: 'Aetna', cpt_code: '70553', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 48, submission_method: 'EDI' },
    { payer_id: 'AETNA', payer_name: 'Aetna', cpt_code: '27447', auth_required: true, service_type: 'INPATIENT', turnaround_hours: 48, submission_method: 'EDI' },
    { payer_id: 'AETNA', payer_name: 'Aetna', cpt_code: '99215', auth_required: false },
    // United Healthcare
    { payer_id: 'UHC', payer_name: 'United Healthcare', cpt_code: '70553', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 24, submission_method: 'EDI' },
    { payer_id: 'UHC', payer_name: 'United Healthcare', cpt_code: '27447', auth_required: true, service_type: 'INPATIENT', turnaround_hours: 24, submission_method: 'EDI' },
    { payer_id: 'UHC', payer_name: 'United Healthcare', cpt_code: '43239', auth_required: true, service_type: 'OUTPATIENT', turnaround_hours: 48, submission_method: 'PORTAL' }
];

// CPT codes that commonly require auth (fallback when no payer-specific rule exists)
const COMMON_AUTH_REQUIRED_CPTS = [
    // Imaging
    '70553', '70551', '70552', '73721', '73720', '74177', '74178',
    // Surgery
    '27447', '27130', '29881', '63030', '22551',
    // Specialty procedures
    '43239', '43249', '45380', '45385',
    // DME
    'E0601', 'E0260', 'K0823',
    // High-cost injections
    'J0585', 'J1745', 'J2353'
];

// =====================================================
// CORE RULES ENGINE FUNCTIONS
// =====================================================

/**
 * FR-01: Check if authorization is required for a given CPT + payer combination
 * @param {string} cptCode - CPT/HCPCS code
 * @param {string} payerId - Payer identifier
 * @returns {Promise<{ required: boolean, rule?: Object, source: string }>}
 */
export async function checkAuthRequired(cptCode, payerId) {
    if (!cptCode || !payerId) {
        return { required: false, source: 'missing_input' };
    }

    // Try Supabase first
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('payer_auth_rules')
            .select('*')
            .eq('payer_id', payerId)
            .eq('cpt_code', cptCode)
            .eq('is_active', true)
            .single();

        if (!error && data) {
            return {
                required: data.auth_required,
                rule: data,
                source: 'payer_rule'
            };
        }
    }

    // Fallback to mock rules
    const mockRule = MOCK_PAYER_RULES.find(
        r => r.payer_id === payerId && r.cpt_code === cptCode
    );

    if (mockRule) {
        return {
            required: mockRule.auth_required,
            rule: mockRule,
            source: 'mock_payer_rule'
        };
    }

    // Last resort: check common list
    if (COMMON_AUTH_REQUIRED_CPTS.includes(cptCode)) {
        return {
            required: true,
            rule: {
                cpt_code: cptCode,
                payer_id: payerId,
                auth_required: true,
                turnaround_hours: 72,
                submission_method: 'EDI',
                service_type: 'OUTPATIENT'
            },
            source: 'common_list'
        };
    }

    return { required: false, source: 'no_rule_found' };
}

/**
 * Check multiple CPT codes at once for auth requirements
 * @param {string[]} cptCodes - Array of CPT/HCPCS codes
 * @param {string} payerId - Payer identifier
 * @returns {Promise<Object[]>} - Array of results per CPT code
 */
export async function checkBulkAuthRequired(cptCodes, payerId) {
    const results = await Promise.all(
        cptCodes.map(cpt => checkAuthRequired(cpt, payerId))
    );

    return cptCodes.map((cpt, i) => ({
        cpt_code: cpt,
        ...results[i]
    }));
}

/**
 * Get all payer rules for a specific payer
 * @param {string} payerId - Payer identifier
 * @returns {Promise<{ data: Object[], error: string|null }>}
 */
export async function getPayerRules(payerId) {
    if (isSupabaseConfigured()) {
        return await supabase
            .from('payer_auth_rules')
            .select('*')
            .eq('payer_id', payerId)
            .eq('is_active', true)
            .order('cpt_code');
    }

    return {
        data: MOCK_PAYER_RULES.filter(r => r.payer_id === payerId),
        error: null
    };
}

/**
 * Get all available payers with their rule counts
 * @returns {Promise<Object[]>}
 */
export async function getAvailablePayers() {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('payer_auth_rules')
            .select('payer_id, payer_name')
            .eq('is_active', true);

        if (!error && data) {
            const payerMap = {};
            data.forEach(r => {
                if (!payerMap[r.payer_id]) {
                    payerMap[r.payer_id] = { payer_id: r.payer_id, payer_name: r.payer_name, rule_count: 0 };
                }
                payerMap[r.payer_id].rule_count++;
            });
            return Object.values(payerMap);
        }
    }

    const payerMap = {};
    MOCK_PAYER_RULES.forEach(r => {
        if (!payerMap[r.payer_id]) {
            payerMap[r.payer_id] = { payer_id: r.payer_id, payer_name: r.payer_name, rule_count: 0 };
        }
        payerMap[r.payer_id].rule_count++;
    });
    return Object.values(payerMap);
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Validate an authorization request before submission
 * @param {Object} authData - Authorization request data
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateAuthRequest(authData) {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!authData.patient_id) errors.push('Patient is required');
    if (!authData.payer_id) errors.push('Payer is required');
    if (!authData.provider_id) errors.push('Ordering provider is required');
    if (!authData.cpt_codes || authData.cpt_codes.length === 0) errors.push('At least one CPT/HCPCS code is required');
    if (!authData.units_requested || authData.units_requested < 1) errors.push('Units requested must be at least 1');
    if (!authData.effective_date) errors.push('Effective date is required');
    if (!authData.service_type) errors.push('Service type (INPATIENT/OUTPATIENT) is required');

    // Date validations
    if (authData.effective_date && authData.expiry_date) {
        if (new Date(authData.expiry_date) <= new Date(authData.effective_date)) {
            errors.push('Expiry date must be after effective date');
        }
    }

    // Diagnosis codes
    if (!authData.diagnosis_codes || authData.diagnosis_codes.length === 0) {
        warnings.push('No diagnosis codes provided — payer may deny without supporting diagnoses');
    }

    // Clinical documentation
    if (!authData.clinical_notes && (!authData.attached_document_ids || authData.attached_document_ids.length === 0)) {
        warnings.push('No clinical documentation attached — strongly recommended for approval');
    }

    // Urgent requests
    if (authData.urgency === 'urgent' && !authData.clinical_notes) {
        errors.push('Clinical justification is required for urgent authorization requests');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// =====================================================
// PRE-POPULATION (FR-02)
// =====================================================

/**
 * FR-02: Pre-populate auth request from patient data
 * @param {Object} patient - Patient record
 * @param {Object} insurance - Insurance record
 * @param {Object} encounter - Encounter/order details
 * @returns {Object} - Pre-populated auth request
 */
export function prePopulateAuthRequest(patient, insurance, encounter = {}) {
    return {
        patient_id: patient.patient_id || patient.PatientID,
        payer_id: insurance?.payer_id || insurance?.PayerID || '',
        payer_name: insurance?.payer_name || insurance?.PayerName || '',
        provider_id: encounter?.provider_id || patient?.pcp_provider_id || '',
        service_type: 'OUTPATIENT',
        cpt_codes: encounter?.procedure_codes ? JSON.parse(encounter.procedure_codes) : [],
        diagnosis_codes: encounter?.diagnosis_codes ? JSON.parse(encounter.diagnosis_codes) : [],
        units_requested: 1,
        effective_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        urgency: 'routine',
        clinical_notes: '',
        service_description: encounter?.chief_complaint || ''
    };
}

// =====================================================
// SLA MANAGEMENT
// =====================================================

/**
 * Get SLA turnaround time based on state and payer
 * @param {string} stateCode - US state code (e.g., 'TX')
 * @param {string} payerId - Payer identifier
 * @returns {{ standardHours: number, urgentHours: number }}
 */
export function getStateSLARules(stateCode = 'TX') {
    const STATE_SLA = {
        TX: { standardHours: 72, urgentHours: 24 },
        CA: { standardHours: 72, urgentHours: 24 },
        NY: { standardHours: 48, urgentHours: 24 },
        FL: { standardHours: 72, urgentHours: 24 },
        DEFAULT: { standardHours: 72, urgentHours: 48 }
    };
    return STATE_SLA[stateCode] || STATE_SLA.DEFAULT;
}

/**
 * Calculate SLA deadline for an authorization
 * @param {Date} submittedAt - When the auth was submitted
 * @param {number} turnaroundHours - Expected turnaround in hours
 * @returns {{ deadline: Date, isOverdue: boolean, hoursRemaining: number }}
 */
export function calculateSLADeadline(submittedAt, turnaroundHours = 72) {
    const deadline = new Date(submittedAt);
    deadline.setHours(deadline.getHours() + turnaroundHours);

    const now = new Date();
    const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

    return {
        deadline,
        isOverdue: hoursRemaining < 0,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10
    };
}

// =====================================================
// EXPORT
// =====================================================

export default {
    checkAuthRequired,
    checkBulkAuthRequired,
    getPayerRules,
    getAvailablePayers,
    validateAuthRequest,
    prePopulateAuthRequest,
    getStateSLARules,
    calculateSLADeadline,
    COMMON_AUTH_REQUIRED_CPTS
};
