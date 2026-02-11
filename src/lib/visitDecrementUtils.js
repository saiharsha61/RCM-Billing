/**
 * VISIT DECREMENT UTILITIES
 * Automatically update referral visit counters when claims are submitted
 */

import { findMatchingReferral } from './authorizationUtils';

/**
 * Process claim submission and decrement visit counters
 * @param {Object} claim - The claim being submitted
 * @param {Array} referrals - All referrals
 * @returns {Object} - { updatedReferral, decremented: boolean, message: string }
 */
export function processClaimSubmission(claim, referrals) {
    // Find matching referral
    const matchingReferral = findMatchingReferral(claim, referrals);

    if (!matchingReferral) {
        return {
            updatedReferral: null,
            decremented: false,
            message: 'No matching referral found'
        };
    }

    // Check if visits remaining
    const visitsUsed = matchingReferral.visits_used || 0;
    const visitsRemaining = matchingReferral.num_visits - visitsUsed;

    if (visitsRemaining <= 0) {
        return {
            updatedReferral: matchingReferral,
            decremented: false,
            message: 'No visits remaining on this referral'
        };
    }

    // Increment visits_used
    const updatedReferral = {
        ...matchingReferral,
        visits_used: visitsUsed + 1
    };

    const newVisitsRemaining = updatedReferral.num_visits - updatedReferral.visits_used;

    return {
        updatedReferral,
        decremented: true,
        message: `Visit counter updated: ${newVisitsRemaining} of ${updatedReferral.num_visits} visits remaining`,
        isLastVisit: newVisitsRemaining === 0,
        warningThreshold: newVisitsRemaining <= 1
    };
}

/**
 * Batch decrement visits for multiple claims
 * @param {Array} claims - Claims to process
 * @param {Array} referrals - All referrals
 * @returns {Array} - Array of results for each claim
 */
export function batchProcessClaims(claims, referrals) {
    const results = [];
    const referralMap = new Map();

    // Initialize map with current referral states
    referrals.forEach(ref => {
        referralMap.set(ref.referral_id, { ...ref });
    });

    claims.forEach(claim => {
        const currentReferrals = Array.from(referralMap.values());
        const result = processClaimSubmission(claim, currentReferrals);

        if (result.decremented && result.updatedReferral) {
            // Update the map with new visit count
            referralMap.set(result.updatedReferral.referral_id, result.updatedReferral);
        }

        results.push({
            claim_id: claim.ClaimID,
            ...result
        });
    });

    return {
        results,
        updatedReferrals: Array.from(referralMap.values())
    };
}

/**
 * Get notification message for visit decrement
 * @param {Object} result - Result from processClaimSubmission
 * @param {Object} patient - Patient object
 * @returns {string} - Notification message
 */
export function getDecrementNotification(result, patient) {
    if (!result.decremented) {
        return null;
    }

    const patientName = `${patient.FirstName} ${patient.LastName}`;
    const visitsRemaining = result.updatedReferral.num_visits - result.updatedReferral.visits_used;

    if (result.isLastVisit) {
        return `⚠️ LAST VISIT USED: ${patientName} has used all ${result.updatedReferral.num_visits} authorized visits. Referral authorization will expire.`;
    }

    if (result.warningThreshold) {
        return `⏰ LOW VISITS: ${patientName} has ${visitsRemaining} visit(s) remaining on referral.`;
    }

    return `✅ Visit decremented: ${patientName} has ${visitsRemaining} of ${result.updatedReferral.num_visits} visits remaining.`;
}

export default {
    processClaimSubmission,
    batchProcessClaims,
    getDecrementNotification
};
