// HIPAA Audit Logging System
// Tracks all access to Protected Health Information (PHI)

/**
 * Audit Log Entry Structure
 */
class AuditLogEntry {
    constructor(action, resource, details = {}) {
        this.timestamp = new Date().toISOString();
        this.action = action; // 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'
        this.resource = resource; // 'patient', 'claim', 'payment', etc.
        this.details = details;
        this.user = this.getCurrentUser();
        this.ipAddress = 'localhost'; // In production, get real IP
        this.sessionId = this.getSessionId();
    }

    getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user ? { id: user.id, email: user.email, role: user.role } : null;
        } catch {
            return null;
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }
}

/**
 * Audit Logger
 */
export const auditLog = {
    /**
     * Log an audit event
     */
    log(action, resource, details = {}) {
        const entry = new AuditLogEntry(action, resource, details);

        // Store in localStorage (in production, send to secure backend)
        const logs = this.getLogs();
        logs.push(entry);

        // Keep only last 1000 entries in local storage
        if (logs.length > 1000) {
            logs.shift();
        }

        try {
            localStorage.setItem('auditLogs', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to store audit log:', e);
        }

        // Log to console in development
        console.log('[AUDIT]', entry);

        return entry;
    },

    /**
     * Get all audit logs
     */
    getLogs() {
        try {
            const logs = localStorage.getItem('auditLogs');
            return logs ? JSON.parse(logs) : [];
        } catch {
            return [];
        }
    },

    /**
     * Get logs for a specific resource
     */
    getLogsForResource(resource, resourceId) {
        const logs = this.getLogs();
        return logs.filter(log =>
            log.resource === resource &&
            (resourceId ? log.details.id === resourceId : true)
        );
    },

    /**
     * Get logs for current user
     */
    getUserLogs(userId) {
        const logs = this.getLogs();
        return logs.filter(log => log.user?.id === userId);
    },

    /**
     * Clear all logs (admin only)
     */
    clearLogs() {
        localStorage.removeItem('auditLogs');
        console.log('[AUDIT] Logs cleared');
    },

    /**
     * Export logs for compliance reporting
     */
    exportLogs(startDate, endDate) {
        let logs = this.getLogs();

        if (startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            logs = logs.filter(log => new Date(log.timestamp) <= new Date(endDate));
        }

        return logs;
    },

    /**
     * Common audit actions
     */
    logPatientView(patientId, patientName) {
        return this.log('VIEW', 'patient', { id: patientId, name: patientName });
    },

    logPatientCreate(patientId) {
        return this.log('CREATE', 'patient', { id: patientId });
    },

    logPatientUpdate(patientId, fields) {
        return this.log('UPDATE', 'patient', { id: patientId, fields });
    },

    logClaimView(claimId) {
        return this.log('VIEW', 'claim', { id: claimId });
    },

    logPaymentPost(paymentId, amount) {
        return this.log('CREATE', 'payment', { id: paymentId, amount });
    },

    logDataExport(resourceType, count) {
        return this.log('EXPORT', resourceType, { count });
    },

    logLogin(email) {
        return this.log('LOGIN', 'auth', { email });
    },

    logLogout(email) {
        return this.log('LOGOUT', 'auth', { email });
    }
};

export default auditLog;
