/**
 * Workflow Automation Engine
 * Phase M: Automated eligibility verification and PA detection
 *
 * Implements Workflow 2 from product strategy:
 *   - T-48h auto-verification for upcoming appointments
 *   - Daily batch verification for next-day appointments
 *   - Auto-detect PA requirements from CPT codes + payer rules
 *   - Expiring authorization alerts (T-7d)
 *   - Auto-create PA drafts when auth is required
 *
 * All actions are logged to the automation activity log.
 */
import { verifyEligibility } from './eligibilityService';
import { getT48hQueue, getUpcomingAppointments, pushEligibilityResult } from './ecwIntegration';

// =====================================================
// AUTOMATION LOG (in-memory for demo, Supabase in prod)
// =====================================================
let automationLog = [];

function logAction(action) {
    const entry = {
        id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        ...action,
    };
    automationLog.unshift(entry);
    if (automationLog.length > 200) automationLog = automationLog.slice(0, 200);
    return entry;
}

export function getAutomationLog() {
    return [...automationLog];
}

export function clearAutomationLog() {
    automationLog = [];
}

// =====================================================
// WORKFLOW 1: T-48H AUTO-VERIFICATION
// =====================================================

/**
 * Auto-verify eligibility for patients with appointments within 48 hours.
 * This is the core automation: runs on dashboard load, can be scheduled via setInterval.
 *
 * @param {Function} onProgress - callback(current, total, result) for UI updates
 * @returns {Object} { verified, failed, skipped, results }
 */
export async function runT48hVerification(onProgress = null) {
    const queue = await getT48hQueue();

    if (queue.length === 0) {
        logAction({
            type: 'T48H_CHECK',
            status: 'SKIPPED',
            message: 'No unverified patients in T-48h window',
        });
        return { verified: 0, failed: 0, skipped: 0, results: [] };
    }

    logAction({
        type: 'T48H_START',
        status: 'RUNNING',
        message: `Starting T-48h auto-verification for ${queue.length} patients`,
    });

    let verified = 0, failed = 0;
    const results = [];

    for (let i = 0; i < queue.length; i++) {
        const appt = queue[i];
        try {
            const result = await verifyEligibility(
                { firstName: appt.firstName, lastName: appt.lastName, dateOfBirth: appt.dob, gender: appt.gender },
                { memberId: appt.memberId, payerId: appt.payerId, payerName: appt.payerName, subscriberNo: appt.memberId },
                { npi: appt.provider.npi, organizationName: 'Wound Care Clinic' }
            );

            // Push result back to eCW
            await pushEligibilityResult(appt.patientId, result);

            results.push({ appointment: appt, result, error: null });
            verified++;

            logAction({
                type: 'T48H_VERIFY',
                status: result.status === 'Active' ? 'SUCCESS' : 'WARNING',
                patientName: `${appt.firstName} ${appt.lastName}`,
                payer: appt.payerName,
                eligibilityStatus: result.status,
                appointmentDate: appt.appointmentDate,
                message: `${appt.firstName} ${appt.lastName}: ${result.status} (${appt.payerName})`,
            });

            if (onProgress) onProgress(i + 1, queue.length, result);
        } catch (e) {
            failed++;
            results.push({ appointment: appt, result: null, error: e.message });

            logAction({
                type: 'T48H_ERROR',
                status: 'ERROR',
                patientName: `${appt.firstName} ${appt.lastName}`,
                message: `Failed to verify ${appt.firstName} ${appt.lastName}: ${e.message}`,
            });
        }
    }

    logAction({
        type: 'T48H_COMPLETE',
        status: 'DONE',
        message: `T-48h complete: ${verified} verified, ${failed} failed`,
        stats: { verified, failed },
    });

    return { verified, failed, skipped: 0, results };
}

// =====================================================
// WORKFLOW 2: DAILY BATCH VERIFICATION
// =====================================================

/**
 * Batch verify all patients with appointments tomorrow (next-day check).
 */
export async function runDailyBatch(onProgress = null) {
    const allAppts = await getUpcomingAppointments(1);
    const unverified = allAppts.filter(a => !a.eligibilityVerified);

    logAction({
        type: 'DAILY_BATCH_START',
        status: 'RUNNING',
        message: `Daily batch: ${unverified.length} unverified of ${allAppts.length} next-day appointments`,
    });

    let verified = 0, failed = 0;
    const results = [];

    for (let i = 0; i < unverified.length; i++) {
        const appt = unverified[i];
        try {
            const result = await verifyEligibility(
                { firstName: appt.firstName, lastName: appt.lastName, dateOfBirth: appt.dob, gender: appt.gender },
                { memberId: appt.memberId, payerId: appt.payerId, payerName: appt.payerName, subscriberNo: appt.memberId }
            );
            await pushEligibilityResult(appt.patientId, result);
            results.push({ appointment: appt, result });
            verified++;
            if (onProgress) onProgress(i + 1, unverified.length, result);
        } catch (e) {
            failed++;
            results.push({ appointment: appt, result: null, error: e.message });
        }
    }

    logAction({
        type: 'DAILY_BATCH_COMPLETE',
        status: 'DONE',
        message: `Daily batch complete: ${verified}/${unverified.length} verified`,
    });

    return { verified, failed, total: allAppts.length, results };
}

// =====================================================
// WORKFLOW 3: PRIOR AUTH REQUIREMENT DETECTION
// =====================================================

/**
 * CPT codes that typically require prior authorization per payer.
 * In production, this queries the payer_auth_rules table.
 */
const PA_REQUIRED_RULES = {
    'AETNA': {
        codes: ['97597', '97598', '97602', '97605', '97606', '29881', '27447', '63030'],
        label: 'Aetna requires PA for wound debridement and surgical codes',
    },
    'BCBSTX': {
        codes: ['97597', '97598', '97602', '97605', '97606', '29881', '27447'],
        label: 'BCBS TX requires PA for wound care procedures',
    },
    'UHC': {
        codes: ['97597', '97598', '97602', '97605', '97606', '29881', '27447', '63030', '99291'],
        label: 'UHC requires PA for wound care, surgical, and critical care',
    },
    'CIGNA': {
        codes: ['97597', '97598', '97605', '97606', '29881', '27447'],
        label: 'Cigna requires PA for wound care and orthopedic procedures',
    },
    'HUMANA': {
        codes: ['97597', '97598', '97602', '29881'],
        label: 'Humana requires PA for select wound care procedures',
    },
    'MEDTX': {
        codes: [], // Medicare generally doesn't require PA for wound care
        label: 'Medicare does not typically require PA for wound care',
    },
    'MEDICAID_TX': {
        codes: ['97597', '97598', '97602', '97605', '97606'],
        label: 'TX Medicaid requires PA for wound care procedures',
    },
};

/**
 * Detect if a CPT code requires prior authorization for a given payer.
 * @returns {Object} { required: boolean, reason: string, rule: Object }
 */
export function detectAuthRequirement(cptCode, payerId) {
    const rule = PA_REQUIRED_RULES[payerId];
    if (!rule) {
        return { required: false, reason: `No PA rules found for payer ${payerId}`, rule: null };
    }

    const required = rule.codes.includes(cptCode);
    return {
        required,
        reason: required
            ? `CPT ${cptCode} requires PA: ${rule.label}`
            : `CPT ${cptCode} does not require PA for ${payerId}`,
        rule,
    };
}

/**
 * Check all CPT codes for a patient's appointment against payer rules.
 * @returns {Array} list of CPT codes that require PA
 */
export function checkAppointmentPARequirements(appointment) {
    const cptCodes = appointment.cptCodes || [];
    const payerId = appointment.payerId;

    const required = [];
    for (const cpt of cptCodes) {
        const check = detectAuthRequirement(cpt, payerId);
        if (check.required) {
            required.push({ cptCode: cpt, ...check });
        }
    }

    if (required.length > 0) {
        logAction({
            type: 'PA_DETECTED',
            status: 'WARNING',
            patientName: `${appointment.firstName} ${appointment.lastName}`,
            message: `PA required for ${required.length} CPT code(s): ${required.map(r => r.cptCode).join(', ')}`,
            cptCodes: required.map(r => r.cptCode),
            payer: appointment.payerName,
        });
    }

    return required;
}

/**
 * Scan all upcoming appointments for PA requirements.
 * @returns {Array} appointments that need PA
 */
export async function scanForPARequirements() {
    const appts = await getUpcomingAppointments(7);
    const needingPA = [];

    for (const appt of appts) {
        const required = checkAppointmentPARequirements(appt);
        if (required.length > 0) {
            needingPA.push({ appointment: appt, requiredCodes: required });
        }
    }

    logAction({
        type: 'PA_SCAN_COMPLETE',
        status: needingPA.length > 0 ? 'WARNING' : 'SUCCESS',
        message: `PA scan: ${needingPA.length} appointments need prior authorization out of ${appts.length} scanned`,
    });

    return needingPA;
}

// =====================================================
// WORKFLOW 4: EXPIRING AUTHORIZATIONS
// =====================================================

/**
 * Mock expiring authorizations (in production, queries auth table).
 */
const MOCK_AUTHORIZATIONS = [
    {
        authId: 'AUTH-001', patientName: 'Pedro Suarez', payer: 'Medicare of Texas',
        cptCodes: ['97597', '97598'], authNumber: 'MED-2025-44521',
        approvedDate: '2025-01-15', expiryDate: '2025-02-25', status: 'APPROVED', visitsApproved: 12, visitsUsed: 9,
    },
    {
        authId: 'AUTH-002', patientName: 'Maria Gonzalez', payer: 'BCBS TX',
        cptCodes: ['97602'], authNumber: 'BCX-2025-78234',
        approvedDate: '2025-01-20', expiryDate: '2025-02-22', status: 'APPROVED', visitsApproved: 8, visitsUsed: 7,
    },
    {
        authId: 'AUTH-003', patientName: 'Ana Delgado', payer: 'United Healthcare',
        cptCodes: ['97597'], authNumber: 'UHC-2025-11223',
        approvedDate: '2025-02-01', expiryDate: '2025-03-15', status: 'APPROVED', visitsApproved: 10, visitsUsed: 3,
    },
];

/**
 * Find authorizations expiring within N days.
 * @param {number} withinDays - alert window (default 7)
 * @returns {Array} expiring authorizations
 */
export function checkExpiringAuths(withinDays = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    const now = new Date();

    const expiring = MOCK_AUTHORIZATIONS.filter(a => {
        const exp = new Date(a.expiryDate);
        return exp >= now && exp <= cutoff;
    });

    if (expiring.length > 0) {
        logAction({
            type: 'AUTH_EXPIRY_ALERT',
            status: 'WARNING',
            message: `${expiring.length} authorization(s) expiring within ${withinDays} days`,
            authorizations: expiring.map(a => `${a.patientName}: ${a.authNumber} (exp ${a.expiryDate})`),
        });
    }

    return expiring;
}

/**
 * Find authorizations with visits nearly exhausted (>80% used).
 */
export function checkVisitUsage() {
    const atRisk = MOCK_AUTHORIZATIONS.filter(a => {
        const usage = a.visitsUsed / a.visitsApproved;
        return usage >= 0.8 && a.status === 'APPROVED';
    });

    if (atRisk.length > 0) {
        logAction({
            type: 'VISIT_USAGE_ALERT',
            status: 'WARNING',
            message: `${atRisk.length} authorization(s) at >80% visit usage`,
        });
    }

    return atRisk;
}

// =====================================================
// MASTER AUTOMATION RUNNER
// =====================================================

/**
 * Run all automation workflows. Called on plugin dashboard load.
 * @returns {Object} combined results
 */
export async function runAllAutomation(onProgress = null) {
    logAction({ type: 'AUTOMATION_START', status: 'RUNNING', message: 'Running all automation workflows...' });

    // 1. T-48h eligibility verification
    const t48hResults = await runT48hVerification(onProgress);

    // 2. PA requirement scan
    const paResults = await scanForPARequirements();

    // 3. Expiring auth check
    const expiringAuths = checkExpiringAuths(7);

    // 4. Visit usage check
    const visitAlerts = checkVisitUsage();

    logAction({
        type: 'AUTOMATION_COMPLETE',
        status: 'DONE',
        message: `Automation complete: ${t48hResults.verified} verified, ${paResults.length} PA needed, ${expiringAuths.length} expiring, ${visitAlerts.length} visit alerts`,
    });

    return {
        eligibility: t48hResults,
        paRequired: paResults,
        expiringAuths,
        visitAlerts,
    };
}

export default {
    runT48hVerification,
    runDailyBatch,
    detectAuthRequirement,
    checkAppointmentPARequirements,
    scanForPARequirements,
    checkExpiringAuths,
    checkVisitUsage,
    runAllAutomation,
    getAutomationLog,
    clearAutomationLog,
};
