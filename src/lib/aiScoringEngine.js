/**
 * AI Scoring Engine (Demo Mode)
 * Predictive analytics for RCM optimization
 * 
 * Features:
 * - No-show risk scoring (appointments)
 * - Denial risk prediction (claims)
 * - Propensity-to-pay scoring (collections)
 * - Message priority triage
 * 
 * NOTE: This is a demonstration implementation using mock algorithms.
 * For production, integrate with actual ML models (TensorFlow, scikit-learn,  or cloud AI services).
 */

// =====================================================
// NO-SHOW RISK SCORING
// =====================================================

/**
 * Calculate no-show risk for an appointment
 * @param {Object} patient - Patient data
 * @param {Object} appointment - Appointment data
 * @returns {number} Risk score (0.0 - 1.0)
 */
export function calculateNoShowRisk(patient, appointment) {
    let score = 0.15; // Base risk

    // Factor 1: Past behavior (strongest predictor - 40% weight)
    const noShowHistory = patient.no_show_history || 0;
    if (noShowHistory >= 3) {
        score += 0.35;
    } else if (noShowHistory === 2) {
        score += 0.25;
    } else if (noShowHistory === 1) {
        score += 0.15;
    }

    // Factor 2: Distance from facility (20% weight)
    const distanceMiles = patient.distance_miles || 10;
    if (distanceMiles > 30) {
        score += 0.20;
    } else if (distanceMiles > 20) {
        score += 0.12;
    } else if (distanceMiles > 10) {
        score += 0.06;
    }

    // Factor 3: Day of week (15% weight)
    const appointmentDate = new Date(appointment.date || appointment.start_time);
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 1) { // Monday
        score += 0.12;
    } else if (dayOfWeek === 5) { // Friday
        score += 0.10;
    } else if (dayOfWeek === 6 || dayOfWeek === 0) { // Weekend
        score += 0.15;
    }

    // Factor 4: Time of day (10% weight)
    const timeString = appointment.start_time || '09:00';
    const hour = parseInt(timeString.split(':')[0]);
    if (hour < 8) {
        score += 0.15; // Very early
    } else if (hour < 9) {
        score += 0.10; // Early
    } else if (hour >= 17) {
        score += 0.08; // Late afternoon
    }

    // Factor 5: Appointment type (10% weight)
    if (appointment.visit_type === 'FOLLOW-UP' || appointment.visit_type === 'CHK') {
        score += 0.08; // Follow-ups have higher no-show rate
    }

    // Factor 6: Patient demographics (5% weight)
    const age = calculateAge(patient.DateOfBirth || patient.date_of_birth);
    if (age < 25) {
        score += 0.08; // Younger patients higher risk
    } else if (age > 75) {
        score += 0.06; // Elderly patients higher risk
    }

    // Factor 7: Outstanding balance (5% weight)
    const balance = patient.PatientBalance || patient.patient_balance || 0;
    if (balance > 1000) {
        score += 0.10;
    } else if (balance > 500) {
        score += 0.05;
    }

    // Cap at 1.0
    return Math.min(score, 1.0);
}

/**
 * Get risk category for display
 */
export function getNoShowRiskCategory(score) {
    if (score >= 0.70) return { label: 'High', color: '#dc2626', icon: '⚠️' };
    if (score >= 0.40) return { label: 'Medium', color: '#f59e0b', icon: '⚡' };
    return { label: 'Low', color: '#10b981', icon: '✓' };
}

// =====================================================
// DENIAL RISK SCORING
// =====================================================

/**
 * Calculate denial risk for a claim
 * @param {Object} claim - Claim data
 * @param {Object} payer - Payer data
 * @param {Object} patient - Patient data
 * @returns {number} Risk score (0.0 - 1.0)
 */
export function calculateDenialRisk(claim, payer = {}, patient = {}) {
    let score = 0.05; // Base risk

    // Factor 1: Missing authorization (35% weight)
    if (claim.requires_authorization || claim.authorization_required) {
        if (!claim.authorization_number && !claim.auth_number) {
            score += 0.40;
        } else {
            // Check if authorization is expired
            const authExpiryDate = claim.authorization_expiry || claim.auth_expiry;
            if (authExpiryDate && new Date(authExpiryDate) < new Date()) {
                score += 0.35;
            }
        }
    }

    // Factor 2: Payer historical denial rate (25% weight)
    const payerDenialRate = payer.historical_denial_rate || 0.10;
    score += payerDenialRate * 0.25;

    // Factor 3: Missing required fields (20% weight)
    let missingFields = 0;
    if (!claim.rendering_provider_npi && !claim.provider_npi) missingFields++;
    if (!claim.referring_provider_npi && claim.requires_referral) missingFields++;
    if (!claim.place_of_service && !claim.pos_code) missingFields++;
    if (!claim.diagnosis_codes || claim.diagnosis_codes.length === 0) missingFields++;

    score += missingFields * 0.05;

    // Factor 4: Procedure-diagnosis mismatch (15% weight)
    if (claim.diagnosis_codes && claim.procedure_codes) {
        const diagCode = claim.diagnosis_codes[0] || '';
        const procCode = claim.procedure_codes[0] || '';

        // Simple mismatch detection (wound care example)
        if (diagCode.startsWith('L97') || diagCode.startsWith('E11.6')) {
            // Wound care diagnosis
            if (!procCode.startsWith('97') && !procCode.startsWith('110')) {
                score += 0.15; // Non-wound procedure with wound diagnosis
            }
        }
    }

    // Factor 5: Timely filing (10% weight)
    const serviceDate = new Date(claim.service_date || claim.date_of_service);
    const today = new Date();
    const daysSinceService = Math.floor((today - serviceDate) / (1000 * 60 * 60 * 24));
    const filingLimit = payer.timely_filing_limit_days || 90;

    if (daysSinceService > filingLimit * 0.9) {
        score += 0.15; // Close to filing limit
    } else if (daysSinceService > filingLimit * 0.75) {
        score += 0.08;
    }

    // Factor 6: Patient eligibility status (5% weight)
    if (patient.eligibility_status === 'inactive' || patient.eligibility_status === 'unknown') {
        score += 0.10;
    }

    // Cap at 1.0
    return Math.min(score, 1.0);
}

/**
 * Get AI scrubbing recommendations
 */
export function getClaimScrubRecommendations(claim, denialRisk) {
    const recommendations = [];

    if (denialRisk > 0.70) {
        recommendations.push({
            severity: 'high',
            message: 'High denial risk detected - review carefully before submission',
            action: 'Review all fields'
        });
    }

    if (!claim.authorization_number && claim.requires_authorization) {
        recommendations.push({
            severity: 'critical',
            message: 'Missing authorization number',
            action: 'Add authorization or mark as non-billable'
        });
    }

    if (!claim.rendering_provider_npi) {
        recommendations.push({
            severity: 'high',
            message: 'Missing rendering provider NPI',
            action: 'Add provider NPI'
        });
    }

    const serviceDate = new Date(claim.service_date);
    const daysSince = Math.floor((new Date() - serviceDate) / (1000 * 60 * 60 * 24));
    if (daysSince > 60) {
        recommendations.push({
            severity: 'medium',
            message: `Service date is ${daysSince} days old - approaching timely filing limit`,
            action: 'Submit immediately'
        });
    }

    return recommendations;
}

/**
 * Get denial risk category for display
 */
export function getDenialRiskCategory(score) {
    if (score >= 0.60) return { label: 'High', color: '#dc2626', icon: '❌' };
    if (score >= 0.30) return { label: 'Medium', color: '#f59e0b', icon: '⚠️' };
    return { label: 'Low', color: '#10b981', icon: '✓' };
}

// =====================================================
// PROPENSITY TO PAY SCORING
// =====================================================

/**
 * Calculate propensity-to-pay score for a patient
 * @param {Object} patient - Patient data
 * @param {number} balance - Current balance amount
 * @returns {number} Propensity score (0.0 - 1.0)
 */
export function calculatePropensityToPay(patient, balance = 0) {
    let score = 0.50; // Neutral baseline

    // Factor 1: Payment history (40% weight)
    const onTimeRate = patient.on_time_payment_rate || 0.70;
    if (onTimeRate > 0.90) {
        score += 0.30;
    } else if (onTimeRate > 0.70) {
        score += 0.20;
    } else if (onTimeRate > 0.50) {
        score += 0.10;
    } else if (onTimeRate < 0.30) {
        score -= 0.20;
    } else if (onTimeRate < 0.50) {
        score -= 0.10;
    }

    // Factor 2: Balance amount (25% weight)
    if (balance < 50) {
        score += 0.15; // Small balances paid more readily
    } else if (balance < 200) {
        score += 0.10;
    } else if (balance > 2000) {
        score -= 0.20; // Large balances harder to collect
    } else if (balance > 1000) {
        score -= 0.12;
    } else if (balance > 500) {
        score -= 0.06;
    }

    // Factor 3: Insurance coverage (20% weight)
    const coveragePercent = patient.insurance_coverage_percentage || 80;
    if (coveragePercent > 90) {
        score += 0.15; // Better coverage = more likely to pay smaller portion
    } else if (coveragePercent > 70) {
        score += 0.08;
    } else if (coveragePercent < 50) {
        score -= 0.10; // High patient responsibility
    }

    // Factor 4: Employment status (10% weight)
    if (patient.employment_status === 'employed') {
        score += 0.10;
    } else if (patient.employment_status === 'unemployed') {
        score -= 0.08;
    }

    // Factor 5: Age demographic (5% weight)
    const age = calculateAge(patient.DateOfBirth || patient.date_of_birth);
    if (age >= 65) {
        score += 0.08; // Medicare patients typically more reliable
    } else if (age < 25) {
        score -= 0.06; // Younger patients less reliable
    }

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(score, 1.0));
}

/**
 * Get optimal contact strategy based on propensity score
 */
export function getContactStrategy(propensityScore, patient) {
    if (propensityScore > 0.75) {
        return {
            strategy: 'Standard Reminder',
            method: patient.preferred_contact_method || 'email',
            frequency: 'once',
            priority: 'low'
        };
    } else if (propensityScore > 0.50) {
        return {
            strategy: 'Multiple Reminders',
            method: 'phone',
            frequency: 'twice',
            priority: 'medium'
        };
    } else {
        return {
            strategy: 'Aggressive Collection',
            method: 'phone + letter',
            frequency: 'weekly',
            priority: 'high',
            escalate: true
        };
    }
}

/**
 * Get propensity category for display
 */
export function getPropensityCategory(score) {
    if (score >= 0.70) return { label: 'High', color: '#10b981', icon: '💰' };
    if (score >= 0.40) return { label: 'Medium', color: '#f59e0b', icon: '💵' };
    return { label: 'Low', color: '#dc2626', icon: '⚠️' };
}

// =====================================================
// MESSAGE PRIORITY TRIAGE
// =====================================================

/**
 * Calculate priority score for a message
 * @param {Object} message - Message data
 * @returns {Object} Priority data with level and score
 */
export function calculateMessagePriority(message) {
    let score = 0;

    // Urgent keywords
    const urgentKeywords = ['urgent', 'stat', 'emergency', 'asap', 'critical', 'immediate'];
    const complianceKeywords = ['audit', 'compliance', 'hipaa', 'breach', 'violation', 'ocr'];
    const denialKeywords = ['denial', 'denied', 'rejected', 'appeal'];

    const subject = (message.subject || '').toLowerCase();
    const body = (message.body || '').toLowerCase();
    const combined = subject + ' ' + body;

    // Check for urgent keywords (40 points)
    if (urgentKeywords.some(kw => combined.includes(kw))) {
        score += 40;
    }

    // Check for compliance keywords (30 points)
    if (complianceKeywords.some(kw => combined.includes(kw))) {
        score += 30;
    }

    // Check for denial keywords (25 points)
    if (denialKeywords.some(kw => combined.includes(kw))) {
        score += 25;
    }

    // Sender type (20 points)
    if (message.sender_type === 'payer') {
        score += 20;
    } else if (message.sender_type === 'patient') {
        score += 15;
    } else if (message.sender_type === 'provider') {
        score += 10;
    }

    // Has attachments (10 points)
    if (message.has_attachments || message.attachments?.length > 0) {
        score += 10;
    }

    // Time sensitivity - recent messages
    const messageDate = new Date(message.received_at || message.created_at);
    const hoursSince = (new Date() - messageDate) / (1000 * 60 * 60);
    if (hoursSince < 2) {
        score += 15; // Very recent
    } else if (hoursSince < 24) {
        score += 8;
    }

    // Determine priority level
    let priority = 'normal';
    if (score >= 60) {
        priority = 'urgent';
    } else if (score >= 30) {
        priority = 'high';
    } else if (score < 15) {
        priority = 'low';
    }

    return {
        priority,
        score: score / 100, // Normalize to 0-1
        rawScore: score
    };
}

/**
 * Get priority category for display
 */
export function getMessagePriorityCategory(priority) {
    const categories = {
        urgent: { label: 'Urgent', color: '#dc2626', icon: '🚨', badge: 'bg-red-600' },
        high: { label: 'High', color: '#f59e0b', icon: '⚡', badge: 'bg-orange-500' },
        normal: { label: 'Normal', color: '#3b82f6', icon: '📧', badge: 'bg-blue-500' },
        low: { label: 'Low', color: '#64748b', icon: '📪', badge: 'bg-gray-400' }
    };
    return categories[priority] || categories.normal;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 40; // Default assumption

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
}

/**
 * Batch score multiple items
 */
export function batchScoreAppointments(appointments, patients) {
    return appointments.map(appt => {
        const patient = patients.find(p => p.PatientID === appt.patient_id || p.patient_id === appt.patient_id);
        return {
            ...appt,
            no_show_risk_score: calculateNoShowRisk(patient || {}, appt),
            ai_scored: true
        };
    });
}

export function batchScoreClaims(claims, payers, patients) {
    return claims.map(claim => {
        const payer = payers.find(p => p.payer_id === claim.payer_id);
        const patient = patients.find(p => p.PatientID === claim.patient_id || p.patient_id === claim.patient_id);
        const denialRisk = calculateDenialRisk(claim, payer, patient);

        return {
            ...claim,
            denial_risk_score: denialRisk,
            ai_scrub_recommendations: getClaimScrubRecommendations(claim, denialRisk),
            ai_scored: true
        };
    });
}

// =====================================================
// EXPORTS
// =====================================================

export const aiScoring = {
    // No-show risk
    calculateNoShowRisk,
    getNoShowRiskCategory,

    // Denial risk
    calculateDenialRisk,
    getDenialRiskCategory,
    getClaimScrubRecommendations,

    // Propensity to pay
    calculatePropensityToPay,
    getPropensityCategory,
    getContactStrategy,

    // Message priority
    calculateMessagePriority,
    getMessagePriorityCategory,

    // Batch operations
    batchScoreAppointments,
    batchScoreClaims
};

export default aiScoring;
