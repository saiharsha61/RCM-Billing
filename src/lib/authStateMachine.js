/**
 * Authorization State Machine Engine
 * Spec Section 3.1: Enforced state transitions
 * 
 * States: DRAFT → SUBMITTED → PENDING → APPROVED|DENIED → APPEALED → EXPIRED
 * All transitions are logged in the audit trail with timestamp, user, and reason.
 */

// =====================================================
// STATE DEFINITIONS
// =====================================================

export const AUTH_STATES = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DENIED: 'DENIED',
    APPEALED: 'APPEALED',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED'
};

export const AUTH_ACTIONS = {
    SUBMIT: 'submit',
    SEND: 'send',
    APPROVE: 'approve',
    DENY: 'deny',
    APPEAL: 'appeal',
    RESUBMIT: 'resubmit',
    EXPIRE: 'expire',
    CANCEL: 'cancel'
};

// =====================================================
// VALID TRANSITIONS MAP
// No state can be skipped (Section 3.1)
// =====================================================

const TRANSITIONS = {
    [AUTH_STATES.DRAFT]: {
        [AUTH_ACTIONS.SUBMIT]: AUTH_STATES.SUBMITTED,
        [AUTH_ACTIONS.CANCEL]: AUTH_STATES.CANCELLED
    },
    [AUTH_STATES.SUBMITTED]: {
        [AUTH_ACTIONS.SEND]: AUTH_STATES.PENDING,
        [AUTH_ACTIONS.CANCEL]: AUTH_STATES.CANCELLED
    },
    [AUTH_STATES.PENDING]: {
        [AUTH_ACTIONS.APPROVE]: AUTH_STATES.APPROVED,
        [AUTH_ACTIONS.DENY]: AUTH_STATES.DENIED
    },
    [AUTH_STATES.APPROVED]: {
        [AUTH_ACTIONS.EXPIRE]: AUTH_STATES.EXPIRED
    },
    [AUTH_STATES.DENIED]: {
        [AUTH_ACTIONS.APPEAL]: AUTH_STATES.APPEALED,
        [AUTH_ACTIONS.CANCEL]: AUTH_STATES.CANCELLED
    },
    [AUTH_STATES.APPEALED]: {
        [AUTH_ACTIONS.APPROVE]: AUTH_STATES.APPROVED,
        [AUTH_ACTIONS.DENY]: AUTH_STATES.DENIED,
        [AUTH_ACTIONS.RESUBMIT]: AUTH_STATES.SUBMITTED
    },
    [AUTH_STATES.EXPIRED]: {},
    [AUTH_STATES.CANCELLED]: {}
};

// =====================================================
// STATE MACHINE FUNCTIONS
// =====================================================

/**
 * Get available actions for the current state
 * @param {string} currentState - Current auth status
 * @returns {string[]} - Array of valid action names
 */
export function getAvailableActions(currentState) {
    const stateTransitions = TRANSITIONS[currentState];
    if (!stateTransitions) return [];
    return Object.keys(stateTransitions);
}

/**
 * Get the next state for a given action
 * @param {string} currentState - Current auth status
 * @param {string} action - Action to perform
 * @returns {string|null} - Next state, or null if transition is invalid
 */
export function getNextState(currentState, action) {
    const stateTransitions = TRANSITIONS[currentState];
    if (!stateTransitions) return null;
    return stateTransitions[action] || null;
}

/**
 * Validate if a transition is allowed
 * @param {string} currentState - Current auth status
 * @param {string} action - Proposed action
 * @returns {{ valid: boolean, reason?: string, nextState?: string }}
 */
export function validateTransition(currentState, action) {
    if (!AUTH_STATES[currentState]) {
        return { valid: false, reason: `Invalid state: ${currentState}` };
    }

    if (!Object.values(AUTH_ACTIONS).includes(action)) {
        return { valid: false, reason: `Invalid action: ${action}` };
    }

    const nextState = getNextState(currentState, action);
    if (!nextState) {
        return {
            valid: false,
            reason: `Cannot perform '${action}' from state '${currentState}'. Valid actions: [${getAvailableActions(currentState).join(', ')}]`
        };
    }

    return { valid: true, nextState };
}

/**
 * Execute a state transition with full audit trail
 * @param {Object} authorization - Current authorization object
 * @param {string} action - Action to perform
 * @param {Object} context - { userId, userName, userRole, reason, metadata }
 * @returns {{ success: boolean, authorization?: Object, auditEntry?: Object, error?: string }}
 */
export function transition(authorization, action, context = {}) {
    const validation = validateTransition(authorization.status, action);

    if (!validation.valid) {
        return { success: false, error: validation.reason };
    }

    const oldState = authorization.status;
    const newState = validation.nextState;

    // Build updated authorization
    const updatedAuth = {
        ...authorization,
        status: newState,
        updated_at: new Date().toISOString(),
        updated_by: context.userId
    };

    // Set timestamps based on action
    switch (action) {
        case AUTH_ACTIONS.SUBMIT:
            updatedAuth.submitted_at = new Date().toISOString();
            break;
        case AUTH_ACTIONS.APPROVE:
            updatedAuth.decided_at = new Date().toISOString();
            break;
        case AUTH_ACTIONS.DENY:
            updatedAuth.decided_at = new Date().toISOString();
            updatedAuth.denial_reason = context.reason || 'Denied by payer';
            break;
        case AUTH_ACTIONS.APPEAL:
            updatedAuth.appeal_submitted_at = new Date().toISOString();
            updatedAuth.appeal_reason = context.reason || '';
            break;
        case AUTH_ACTIONS.EXPIRE:
            updatedAuth.decided_at = new Date().toISOString();
            break;
    }

    // Build audit log entry
    const auditEntry = createAuditEntry(
        authorization.auth_id,
        `STATUS_CHANGE:${action.toUpperCase()}`,
        { status: oldState, ...context.oldSnapshot },
        { status: newState, ...context.newSnapshot },
        context
    );

    return {
        success: true,
        authorization: updatedAuth,
        auditEntry,
        previousState: oldState,
        newState
    };
}

// =====================================================
// AUDIT LOG FUNCTIONS
// =====================================================

/**
 * Create an immutable audit log entry (Section 5.2)
 */
export function createAuditEntry(authId, action, oldValue, newValue, context = {}) {
    return {
        log_id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        auth_id: authId,
        action,
        old_value: oldValue,
        new_value: newValue,
        performed_by: context.userId || null,
        performed_by_name: context.userName || 'System',
        performed_by_role: context.userRole || 'system',
        ip_address: context.ipAddress || null,
        timestamp: new Date().toISOString()
    };
}

// =====================================================
// STATE DISPLAY HELPERS
// =====================================================

const STATE_CONFIG = {
    [AUTH_STATES.DRAFT]: {
        label: 'Draft',
        color: '#64748b',
        bgColor: '#f1f5f9',
        icon: '📝',
        description: 'Request created, not yet submitted'
    },
    [AUTH_STATES.SUBMITTED]: {
        label: 'Submitted',
        color: '#2563eb',
        bgColor: '#dbeafe',
        icon: '📤',
        description: 'Sent to review queue'
    },
    [AUTH_STATES.PENDING]: {
        label: 'Pending',
        color: '#d97706',
        bgColor: '#fef3c7',
        icon: '⏳',
        description: 'Awaiting payer decision'
    },
    [AUTH_STATES.APPROVED]: {
        label: 'Approved',
        color: '#16a34a',
        bgColor: '#dcfce7',
        icon: '✅',
        description: 'Authorized by payer'
    },
    [AUTH_STATES.DENIED]: {
        label: 'Denied',
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: '❌',
        description: 'Denied by payer'
    },
    [AUTH_STATES.APPEALED]: {
        label: 'Appealed',
        color: '#9333ea',
        bgColor: '#f3e8ff',
        icon: '🔄',
        description: 'Appeal submitted'
    },
    [AUTH_STATES.EXPIRED]: {
        label: 'Expired',
        color: '#78716c',
        bgColor: '#f5f5f4',
        icon: '⏰',
        description: 'Authorization expired'
    },
    [AUTH_STATES.CANCELLED]: {
        label: 'Cancelled',
        color: '#a1a1aa',
        bgColor: '#f4f4f5',
        icon: '🚫',
        description: 'Cancelled by user'
    }
};

/**
 * Get display configuration for a state
 */
export function getStateConfig(state) {
    return STATE_CONFIG[state] || STATE_CONFIG[AUTH_STATES.DRAFT];
}

/**
 * Get action button configuration
 */
export function getActionConfig(action) {
    const configs = {
        [AUTH_ACTIONS.SUBMIT]: { label: 'Submit for Review', color: '#2563eb', icon: '📤' },
        [AUTH_ACTIONS.SEND]: { label: 'Send to Payer', color: '#7c3aed', icon: '🚀' },
        [AUTH_ACTIONS.APPROVE]: { label: 'Mark Approved', color: '#16a34a', icon: '✅' },
        [AUTH_ACTIONS.DENY]: { label: 'Mark Denied', color: '#dc2626', icon: '❌' },
        [AUTH_ACTIONS.APPEAL]: { label: 'File Appeal', color: '#9333ea', icon: '🔄' },
        [AUTH_ACTIONS.RESUBMIT]: { label: 'Resubmit', color: '#2563eb', icon: '📤' },
        [AUTH_ACTIONS.EXPIRE]: { label: 'Mark Expired', color: '#78716c', icon: '⏰' },
        [AUTH_ACTIONS.CANCEL]: { label: 'Cancel', color: '#a1a1aa', icon: '🚫' }
    };
    return configs[action] || { label: action, color: '#64748b', icon: '•' };
}

/**
 * Check if authorization is in a terminal state
 */
export function isTerminalState(state) {
    return [AUTH_STATES.EXPIRED, AUTH_STATES.CANCELLED].includes(state);
}

/**
 * Check if authorization needs attention (actionable states)
 */
export function needsAttention(state) {
    return [AUTH_STATES.DRAFT, AUTH_STATES.DENIED].includes(state);
}

/**
 * Calculate days until expiry
 */
export function daysUntilExpiry(expiryDate) {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

/**
 * Check if auth is expiring within N days (FR-10: 14 days)
 */
export function isExpiringSoon(expiryDate, thresholdDays = 14) {
    const days = daysUntilExpiry(expiryDate);
    return days !== null && days >= 0 && days <= thresholdDays;
}

export default {
    AUTH_STATES,
    AUTH_ACTIONS,
    getAvailableActions,
    getNextState,
    validateTransition,
    transition,
    createAuditEntry,
    getStateConfig,
    getActionConfig,
    isTerminalState,
    needsAttention,
    daysUntilExpiry,
    isExpiringSoon
};
