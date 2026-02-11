/**
 * Break-Glass Access Logging
 * Implements emergency access controls for sensitive patient data
 * 
 * "Break-glass" refers to emergency access scenarios where a user needs to access
 * restricted patient data outside normal authorization (e.g., ER physician treating
 * unconscious patient, covering provider accessing another provider's patient)
 * 
 * HIPAA requires:
 * - All break-glass accesses must be logged
 * - Reason must be documented
 * - Access must be reviewed by compliance team
 * - Alerts must be sent to security team
 */

import { auditLog } from './auditLog.js';

// =====================================================
// BREAK-GLASS ACCESS LEVELS
// =====================================================

export const ACCESS_LEVELS = {
    NORMAL: 'normal',           // Standard access within user's permissions
    RESTRICTED: 'restricted',   // Requires justification (e.g., VIP patient)
    SENSITIVE: 'sensitive',     // Requires break-glass (e.g., employee, provider's own record)
    EMERGENCY: 'emergency'      // Emergency override (e.g., unconscious patient in ER)
};

export const BREAK_GLASS_REASONS = {
    EMERGENCY_CARE: 'Emergency medical care - patient unable to consent',
    COVERING_PROVIDER: 'Covering for another provider',
    CONTINUITY_OF_CARE: 'Continuity of care - patient transferred',
    QUALITY_REVIEW: 'Quality assurance review',
    COMPLIANCE_AUDIT: 'Compliance audit',
    LEGAL_REQUEST: 'Legal/court order',
    PATIENT_REQUEST: 'Patient requested access to their own record',
    SYSTEM_ADMIN: 'System administration/troubleshooting',
    OTHER: 'Other (see notes)'
};

// =====================================================
// ACCESS CONTROL
// =====================================================

/**
 * Check if user can access patient data
 * Returns: { allowed: boolean, requiresBreakGlass: boolean, reason: string }
 */
export function checkAccess(userId, patientId, patientData, userRole) {
    const accessLevel = patientData.access_level || ACCESS_LEVELS.NORMAL;

    // Normal access - no restrictions
    if (accessLevel === ACCESS_LEVELS.NORMAL) {
        return { allowed: true, requiresBreakGlass: false };
    }

    // Check if user is assigned provider
    const isAssignedProvider =
        patientData.pcp_provider_id === userId ||
        patientData.rendering_provider_id === userId;

    // Restricted access - requires justification but not break-glass
    if (accessLevel === ACCESS_LEVELS.RESTRICTED) {
        if (isAssignedProvider || userRole === 'admin') {
            return { allowed: true, requiresBreakGlass: false };
        }
        return {
            allowed: false,
            requiresBreakGlass: true,
            reason: 'Patient record is restricted - requires justification'
        };
    }

    // Sensitive access - always requires break-glass
    if (accessLevel === ACCESS_LEVELS.SENSITIVE) {
        return {
            allowed: false,
            requiresBreakGlass: true,
            reason: 'Sensitive patient record - break-glass access required'
        };
    }

    // Emergency access - requires break-glass with emergency reason
    if (accessLevel === ACCESS_LEVELS.EMERGENCY) {
        return {
            allowed: false,
            requiresBreakGlass: true,
            reason: 'Emergency access only - break-glass required'
        };
    }

    return { allowed: true, requiresBreakGlass: false };
}

/**
 * Request break-glass access
 * User must provide reason and justification
 */
export function requestBreakGlassAccess(accessRequest) {
    const {
        userId,
        userName,
        userRole,
        patientId,
        patientName,
        reason,
        justification,
        ipAddress,
        timestamp = new Date().toISOString()
    } = accessRequest;

    // Validate required fields
    if (!reason || !justification || justification.length < 10) {
        throw new Error('Break-glass access requires a valid reason and detailed justification (min 10 characters)');
    }

    // Create break-glass access record
    const breakGlassRecord = {
        access_id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        patient_id: patientId,
        patient_name: patientName,
        reason: reason,
        justification: justification,
        ip_address: ipAddress,
        timestamp: timestamp,
        status: 'pending_review',
        reviewed: false,
        flagged_for_review: true
    };

    // Store in break-glass access log
    storeBreakGlassAccess(breakGlassRecord);

    // Log to audit trail
    auditLog.log('BREAK_GLASS_ACCESS', 'patient', {
        patient_id: patientId,
        patient_name: patientName,
        reason: reason,
        justification: justification,
        access_id: breakGlassRecord.access_id
    });

    // Send alert to security team (in production, this would trigger email/Slack)
    sendSecurityAlert(breakGlassRecord);

    return {
        granted: true,
        access_id: breakGlassRecord.access_id,
        message: 'Break-glass access granted. This access has been logged and flagged for compliance review.',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
}

/**
 * Store break-glass access record
 */
function storeBreakGlassAccess(record) {
    try {
        const records = getBreakGlassRecords();
        records.push(record);

        // Keep last 500 records in localStorage
        if (records.length > 500) {
            records.shift();
        }

        localStorage.setItem('breakGlassAccess', JSON.stringify(records));
    } catch (error) {
        console.error('[BREAK_GLASS] Failed to store access record:', error);
    }
}

/**
 * Get all break-glass access records
 */
export function getBreakGlassRecords() {
    try {
        const records = localStorage.getItem('breakGlassAccess');
        return records ? JSON.parse(records) : [];
    } catch {
        return [];
    }
}

/**
 * Get break-glass records for a specific patient
 */
export function getPatientBreakGlassHistory(patientId) {
    const records = getBreakGlassRecords();
    return records.filter(r => r.patient_id === patientId);
}

/**
 * Get break-glass records for a specific user
 */
export function getUserBreakGlassHistory(userId) {
    const records = getBreakGlassRecords();
    return records.filter(r => r.user_id === userId);
}

/**
 * Get unreviewed break-glass accesses (for compliance team)
 */
export function getUnreviewedAccesses() {
    const records = getBreakGlassRecords();
    return records.filter(r => !r.reviewed);
}

/**
 * Mark break-glass access as reviewed
 */
export function reviewBreakGlassAccess(accessId, reviewedBy, reviewNotes, approved) {
    const records = getBreakGlassRecords();
    const record = records.find(r => r.access_id === accessId);

    if (!record) {
        throw new Error('Break-glass access record not found');
    }

    record.reviewed = true;
    record.reviewed_by = reviewedBy;
    record.reviewed_at = new Date().toISOString();
    record.review_notes = reviewNotes;
    record.approved = approved;
    record.status = approved ? 'approved' : 'denied';

    localStorage.setItem('breakGlassAccess', JSON.stringify(records));

    // Log review action
    auditLog.log('BREAK_GLASS_REVIEW', 'compliance', {
        access_id: accessId,
        reviewed_by: reviewedBy,
        approved: approved
    });

    return record;
}

// =====================================================
// SECURITY ALERTS
// =====================================================

/**
 * Send security alert for break-glass access
 * In production, this would send email/Slack/PagerDuty alert
 */
function sendSecurityAlert(breakGlassRecord) {
    console.warn('[SECURITY ALERT] Break-glass access requested:', {
        user: breakGlassRecord.user_name,
        patient: breakGlassRecord.patient_name,
        reason: breakGlassRecord.reason,
        time: breakGlassRecord.timestamp
    });

    // Store alert
    const alerts = getSecurityAlerts();
    alerts.push({
        alert_id: `alert_${Date.now()}`,
        type: 'BREAK_GLASS_ACCESS',
        severity: 'HIGH',
        message: `Break-glass access: ${breakGlassRecord.user_name} accessed ${breakGlassRecord.patient_name}`,
        details: breakGlassRecord,
        timestamp: new Date().toISOString(),
        acknowledged: false
    });

    localStorage.setItem('securityAlerts', JSON.stringify(alerts));
}

/**
 * Get all security alerts
 */
export function getSecurityAlerts() {
    try {
        const alerts = localStorage.getItem('securityAlerts');
        return alerts ? JSON.parse(alerts) : [];
    } catch {
        return [];
    }
}

/**
 * Get unacknowledged security alerts
 */
export function getUnacknowledgedAlerts() {
    const alerts = getSecurityAlerts();
    return alerts.filter(a => !a.acknowledged);
}

/**
 * Acknowledge security alert
 */
export function acknowledgeAlert(alertId, acknowledgedBy) {
    const alerts = getSecurityAlerts();
    const alert = alerts.find(a => a.alert_id === alertId);

    if (alert) {
        alert.acknowledged = true;
        alert.acknowledged_by = acknowledgedBy;
        alert.acknowledged_at = new Date().toISOString();
        localStorage.setItem('securityAlerts', JSON.stringify(alerts));
    }

    return alert;
}

// =====================================================
// VIP / SENSITIVE PATIENT FLAGGING
// =====================================================

/**
 * Flag patient as VIP/sensitive
 * Requires admin privileges
 */
export function flagPatientAsSensitive(patientId, accessLevel, reason, flaggedBy) {
    if (!Object.values(ACCESS_LEVELS).includes(accessLevel)) {
        throw new Error('Invalid access level');
    }

    const flag = {
        patient_id: patientId,
        access_level: accessLevel,
        reason: reason,
        flagged_by: flaggedBy,
        flagged_at: new Date().toISOString()
    };

    // Store flag
    const flags = getSensitivePatientFlags();
    flags.push(flag);
    localStorage.setItem('sensitivePatientFlags', JSON.stringify(flags));

    // Log action
    auditLog.log('FLAG_SENSITIVE_PATIENT', 'patient', {
        patient_id: patientId,
        access_level: accessLevel,
        reason: reason
    });

    return flag;
}

/**
 * Get all sensitive patient flags
 */
export function getSensitivePatientFlags() {
    try {
        const flags = localStorage.getItem('sensitivePatientFlags');
        return flags ? JSON.parse(flags) : [];
    } catch {
        return [];
    }
}

/**
 * Check if patient is flagged as sensitive
 */
export function isPatientSensitive(patientId) {
    const flags = getSensitivePatientFlags();
    const flag = flags.find(f => f.patient_id === patientId);
    return flag ? flag.access_level : ACCESS_LEVELS.NORMAL;
}

// =====================================================
// COMPLIANCE REPORTING
// =====================================================

/**
 * Generate break-glass access report for compliance
 */
export function generateComplianceReport(startDate, endDate) {
    const records = getBreakGlassRecords();

    let filtered = records;
    if (startDate) {
        filtered = filtered.filter(r => new Date(r.timestamp) >= new Date(startDate));
    }
    if (endDate) {
        filtered = filtered.filter(r => new Date(r.timestamp) <= new Date(endDate));
    }

    // Calculate statistics
    const stats = {
        total_accesses: filtered.length,
        by_reason: {},
        by_user: {},
        unreviewed: filtered.filter(r => !r.reviewed).length,
        approved: filtered.filter(r => r.approved).length,
        denied: filtered.filter(r => r.reviewed && !r.approved).length
    };

    // Group by reason
    filtered.forEach(r => {
        stats.by_reason[r.reason] = (stats.by_reason[r.reason] || 0) + 1;
        stats.by_user[r.user_name] = (stats.by_user[r.user_name] || 0) + 1;
    });

    return {
        report_generated: new Date().toISOString(),
        period: { start: startDate, end: endDate },
        statistics: stats,
        records: filtered
    };
}

// =====================================================
// EXPORTS
// =====================================================

export const breakGlassAccess = {
    // Access control
    checkAccess,
    requestBreakGlassAccess,

    // Records
    getBreakGlassRecords,
    getPatientBreakGlassHistory,
    getUserBreakGlassHistory,
    getUnreviewedAccesses,
    reviewBreakGlassAccess,

    // Security alerts
    getSecurityAlerts,
    getUnacknowledgedAlerts,
    acknowledgeAlert,

    // Patient flagging
    flagPatientAsSensitive,
    getSensitivePatientFlags,
    isPatientSensitive,

    // Compliance
    generateComplianceReport,

    // Constants
    ACCESS_LEVELS,
    BREAK_GLASS_REASONS
};

export default breakGlassAccess;
