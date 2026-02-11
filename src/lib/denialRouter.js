/**
 * DENIAL ROUTER UTILITY
 * Routes denials to appropriate departments based on denial reason codes
 */

// Denial reason code categories and routing rules
const DENIAL_ROUTING_RULES = {
    // Eligibility/Coverage Denials -> Front Desk
    eligibility: {
        codes: ['1', '2', '3', '4', '29', '109', '170'],
        department: 'Front Desk',
        priority: 'high',
        sla: 24, // hours
        description: 'Patient eligibility or coverage issue'
    },

    // Coding Denials -> Coding/Provider
    coding: {
        codes: ['5', '6', '9', '11', '16', '18', '19', '50', '96', '97', '146', '147', '148', '149', '150', '181', '182', 'B7', 'B9', 'B13'],
        department: 'Coding',
        priority: 'medium',
        sla: 48,
        description: 'Coding or procedure-related issue'
    },

    // Medical Necessity Denials -> Provider
    medicalNecessity: {
        codes: ['50', '55', '56', '57', '58', '59', '60', '76', '150', '151', '167', 'A1', 'A5', 'A6'],
        department: 'Provider',
        priority: 'high',
        sla: 72,
        description: 'Medical necessity or clinical documentation'
    },

    // Authorization Denials -> Authorizations Team
    authorization: {
        codes: ['15', '27', '38', '39', '197', '198', '199', '227', '228'],
        department: 'Authorizations',
        priority: 'high',
        sla: 24,
        description: 'Prior authorization required or invalid'
    },

    // Duplicate/Timely Filing -> Billing
    billing: {
        codes: ['18', '19', '22', '23', '24', '26', '29', '31', '32', '33', '34', '39', 'B22'],
        department: 'Billing',
        priority: 'medium',
        sla: 48,
        description: 'Duplicate claim or timely filing issue'
    },

    // Demographics/Data Issues -> Registration
    demographics: {
        codes: ['35', '36', '37', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', 'B1', 'B2', 'B3', 'B4'],
        department: 'Registration',
        priority: 'medium',
        sla: 24,
        description: 'Patient information or data mismatch'
    },

    // Contractual/Payment Issues -> Contracting
    contractual: {
        codes: ['45', '94', '95', '102', '103', '104', '105', '106', '107', '108', '109', '110', 'P1', 'P2', 'P3'],
        department: 'Contracting',
        priority: 'low',
        sla: 72,
        description: 'Contractual adjustment or payment dispute'
    }
};

// CARC (Claim Adjustment Reason Codes) descriptions
const CARC_DESCRIPTIONS = {
    '1': 'Deductible Amount',
    '2': 'Coinsurance Amount',
    '3': 'Co-payment Amount',
    '4': 'The procedure code is inconsistent with the modifier',
    '5': 'The procedure code/bill type is inconsistent with the place of service',
    '6': 'The procedure/revenue code is inconsistent with the patient\'s age',
    '9': 'The diagnosis is inconsistent with the patient\'s age',
    '11': 'The diagnosis is inconsistent with the procedure',
    '15': 'Payment adjusted because authorization was not obtained',
    '16': 'Claim/service lacks information which is needed for adjudication',
    '18': 'Exact duplicate claim/service',
    '19': 'This is a work-related injury/illness claim',
    '22': 'This care may be covered by another payer',
    '27': 'Expenses incurred after coverage terminated',
    '29': 'The time limit for filing has expired',
    '50': 'Non-covered services',
    '96': 'Non-covered charge(s)',
    '97': 'The benefit for this service is included in the payment for another service',
    '167': 'Diagnosis is not covered',
    '197': 'Precertification/authorization/notification required',
    '227': 'Information requested from the patient/insured was not provided'
};

/**
 * Route a denial to the appropriate department
 * @param {Object} denial - The denial information
 * @returns {Object} Routing information including department and priority
 */
export function routeDenial(denial) {
    const { reasonCode, claimId, patientName, amount, denialDate } = denial;

    // Find matching routing rule
    let matchedCategory = null;
    let matchedRule = null;

    for (const [category, rule] of Object.entries(DENIAL_ROUTING_RULES)) {
        if (rule.codes.includes(reasonCode) || rule.codes.includes(String(reasonCode))) {
            matchedCategory = category;
            matchedRule = rule;
            break;
        }
    }

    // Default to billing if no match found
    if (!matchedRule) {
        matchedRule = {
            department: 'Billing',
            priority: 'medium',
            sla: 48,
            description: 'Unclassified denial - review required'
        };
        matchedCategory = 'unclassified';
    }

    // Calculate due date based on SLA
    const dueDate = new Date(denialDate || new Date());
    dueDate.setHours(dueDate.getHours() + matchedRule.sla);

    return {
        claimId,
        patientName,
        amount,
        reasonCode,
        reasonDescription: CARC_DESCRIPTIONS[reasonCode] || 'Unknown reason code',
        category: matchedCategory,
        department: matchedRule.department,
        priority: matchedRule.priority,
        sla: matchedRule.sla,
        dueDate: dueDate.toISOString(),
        categoryDescription: matchedRule.description,
        status: 'new',
        assignedTo: null,
        createdAt: new Date().toISOString()
    };
}

/**
 * Batch route multiple denials
 * @param {Array} denials - Array of denial objects
 * @returns {Object} Grouped denials by department
 */
export function batchRouteDenials(denials) {
    const routedDenials = denials.map(denial => routeDenial(denial));

    // Group by department
    const grouped = {};
    routedDenials.forEach(denial => {
        if (!grouped[denial.department]) {
            grouped[denial.department] = {
                department: denial.department,
                count: 0,
                totalAmount: 0,
                denials: [],
                highPriority: 0
            };
        }

        grouped[denial.department].count++;
        grouped[denial.department].totalAmount += denial.amount || 0;
        grouped[denial.department].denials.push(denial);

        if (denial.priority === 'high') {
            grouped[denial.department].highPriority++;
        }
    });

    return {
        summary: {
            totalDenials: denials.length,
            totalAmount: denials.reduce((sum, d) => sum + (d.amount || 0), 0),
            departments: Object.keys(grouped).length
        },
        byDepartment: grouped,
        all: routedDenials
    };
}

/**
 * Get denial statistics for dashboard
 * @param {Array} denials - Array of processed denials
 * @returns {Object} Statistics for reporting
 */
export function getDenialStatistics(denials) {
    const stats = {
        totalCount: denials.length,
        totalAmount: 0,
        byDepartment: {},
        byPriority: { high: 0, medium: 0, low: 0 },
        byCategory: {},
        overdue: 0,
        avgDaysToResolve: 0
    };

    denials.forEach(denial => {
        stats.totalAmount += denial.amount || 0;

        // By department
        if (!stats.byDepartment[denial.department]) {
            stats.byDepartment[denial.department] = { count: 0, amount: 0 };
        }
        stats.byDepartment[denial.department].count++;
        stats.byDepartment[denial.department].amount += denial.amount || 0;

        // By priority
        if (stats.byPriority[denial.priority] !== undefined) {
            stats.byPriority[denial.priority]++;
        }

        // By category
        if (!stats.byCategory[denial.category]) {
            stats.byCategory[denial.category] = 0;
        }
        stats.byCategory[denial.category]++;

        // Check overdue
        if (new Date(denial.dueDate) < new Date() && denial.status === 'new') {
            stats.overdue++;
        }
    });

    return stats;
}

/**
 * Create a task from a routed denial
 * @param {Object} routedDenial - The routed denial object
 * @returns {Object} Task object for the worklist
 */
export function createDenialTask(routedDenial) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    return {
        taskId: `TASK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'denial',
        title: `Denial - ${routedDenial.reasonDescription}`,
        description: `Claim ${routedDenial.claimId} for ${routedDenial.patientName} denied: ${routedDenial.categoryDescription}`,
        department: routedDenial.department,
        priority: routedDenial.priority,
        priorityOrder: priorityOrder[routedDenial.priority] || 2,
        dueDate: routedDenial.dueDate,
        status: 'open',
        amount: routedDenial.amount,
        claimId: routedDenial.claimId,
        reasonCode: routedDenial.reasonCode,
        createdAt: new Date().toISOString(),
        actions: getRecommendedActions(routedDenial.category),
        notes: []
    };
}

/**
 * Get recommended actions based on denial category
 */
function getRecommendedActions(category) {
    const actions = {
        eligibility: [
            'Verify patient eligibility with payer',
            'Confirm coverage dates',
            'Check for secondary insurance',
            'Contact patient if needed'
        ],
        coding: [
            'Review medical documentation',
            'Verify CPT/ICD-10 codes',
            'Check modifier usage',
            'Consult with provider if needed'
        ],
        medicalNecessity: [
            'Obtain clinical documentation',
            'Review LCD/NCD requirements',
            'Request peer-to-peer review',
            'Prepare appeal with supporting documents'
        ],
        authorization: [
            'Check authorization status',
            'Verify auth number on claim',
            'Request retroactive authorization',
            'Escalate to auth team'
        ],
        billing: [
            'Review original claim submission',
            'Check for duplicate charges',
            'Verify timely filing deadline',
            'Correct and resubmit if applicable'
        ],
        demographics: [
            'Verify patient information',
            'Cross-check with insurance card',
            'Update demographics if needed',
            'Resubmit with corrections'
        ],
        contractual: [
            'Review fee schedule',
            'Check contract terms',
            'Escalate to contracting team',
            'Document for future reference'
        ]
    };

    return actions[category] || ['Review denial and take appropriate action'];
}

/**
 * Send notification to department
 * @param {Object} task - The denial task
 * @param {string} notificationType - Type of notification (email, slack, in-app)
 */
export function sendDenialNotification(task, notificationType = 'in-app') {
    // In production, this would integrate with notification system
    console.log(`[Notification] ${notificationType}: New denial task assigned to ${task.department}`);

    return {
        sent: true,
        type: notificationType,
        department: task.department,
        taskId: task.taskId,
        timestamp: new Date().toISOString()
    };
}

export default {
    routeDenial,
    batchRouteDenials,
    getDenialStatistics,
    createDenialTask,
    sendDenialNotification,
    DENIAL_ROUTING_RULES,
    CARC_DESCRIPTIONS
};
