/**
 * AUTHORIZATION UTILITIES
 * Helper functions for linking authorizations to claims and validating coverage
 */

/**
 * Find matching referral authorization for a claim
 * @param {Object} claim - The claim object with patient_id and service_date
 * @param {Array} referrals - Array of referral authorizations
 * @returns {Object|null} - Matching referral or null
 */
export function findMatchingReferral(claim, referrals) {
    if (!claim || !referrals) return null;

    const serviceDate = new Date(claim.ServiceDate);

    return referrals.find(ref => {
        // Must match patient
        if (ref.patient_id !== claim.PatientID) return false;

        // Must be approved
        if (ref.status !== 'Approved') return false;

        // Must have visits remaining
        const visitsRemaining = ref.num_visits - (ref.visits_used || 0);
        if (visitsRemaining <= 0) return false;

        // Service date must be before expiration
        const expirationDate = new Date(ref.expiration_date);
        if (serviceDate > expirationDate) return false;

        // Referral date must be before or on service date
        const referralDate = new Date(ref.referral_date);
        if (serviceDate < referralDate) return false;

        return true;
    });
}

/**
 * Find matching service authorization for a claim
 * @param {Object} claim - The claim object with patient_id, service_date, and procedure codes
 * @param {Array} serviceAuths - Array of service authorizations
 * @returns {Object|null} - Matching authorization or null
 */
export function findMatchingServiceAuth(claim, serviceAuths, claimLineItems) {
    if (!claim || !serviceAuths) return null;

    const serviceDate = new Date(claim.ServiceDate);

    // Get procedure codes from this claim
    const claimProcedures = claimLineItems
        .filter(item => item.ClaimID === claim.ClaimID)
        .map(item => item.ProcedureCode);

    return serviceAuths.find(auth => {
        // Must match patient
        if (auth.patient_id !== claim.PatientID) return false;

        // Must be approved
        if (auth.status !== 'Approved') return false;

        // Service date must be within valid range
        const startDate = new Date(auth.start_date);
        const endDate = new Date(auth.end_date);
        if (serviceDate < startDate || serviceDate > endDate) return false;

        // At least one procedure code must match
        return claimProcedures.includes(auth.procedure_code);
    });
}

/**
 * Auto-populate authorization number on claim
 * @param {Object} claim - The claim to update
 * @param {Array} referrals - All referrals
 * @param {Array} serviceAuths - All service authorizations
 * @param {Array} claimLineItems - All claim line items
 * @returns {Object} - Claim with auth_number populated
 */
export function autoPopulateAuthNumber(claim, referrals, serviceAuths, claimLineItems) {
    // Priority 1: Check for service authorization (procedure-specific)
    const serviceAuth = findMatchingServiceAuth(claim, serviceAuths, claimLineItems);
    if (serviceAuth) {
        return {
            ...claim,
            auth_number: serviceAuth.authorization_no,
            auth_type: 'Service Authorization',
            auth_id: serviceAuth.auth_id
        };
    }

    // Priority 2: Check for referral authorization (general specialist visit)
    const referral = findMatchingReferral(claim, referrals);
    if (referral) {
        return {
            ...claim,
            auth_number: referral.authorization_no,
            auth_type: 'Referral',
            auth_id: referral.referral_id
        };
    }

    // No matching authorization
    return { ...claim, auth_number: null, auth_type: null, auth_id: null };
}

/**
 * Validate claim has required authorization
 * @param {Object} claim - The claim to validate
 * @param {Array} referrals - All referrals
 * @param {Array} serviceAuths - All service authorizations
 * @param {Array} claimLineItems - All claim line items  
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateClaimAuthorization(claim, referrals, serviceAuths, claimLineItems) {
    const errors = [];
    const warnings = [];

    // Get matched auth
    const serviceAuth = findMatchingServiceAuth(claim, serviceAuths, claimLineItems);
    const referral = findMatchingReferral(claim, referrals);

    // Check if auth is required (high-cost procedures or specialist referrals)
    const claimProcedures = claimLineItems
        .filter(item => item.ClaimID === claim.ClaimID)
        .map(item => item.ProcedureCode);

    // High-cost procedure codes that require auth (MRI, CT, Surgery, etc.)
    const highCostCodes = ['70553', '70552', '29881', '93000', '77065', '77066', '77067'];
    const hasHighCostProcedure = claimProcedures.some(code => highCostCodes.includes(code));

    if (hasHighCostProcedure && !serviceAuth) {
        errors.push('High-cost procedure requires prior authorization');
    }

    // Check if claim has referring provider (indicates specialist visit)
    if (claim.ReferringProviderID && !referral && !serviceAuth) {
        errors.push('Specialist visit requires referral authorization');
    }

    // Check if auth is about to expire
    if (serviceAuth) {
        const endDate = new Date(serviceAuth.end_date);
        const daysUntilExpiration = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiration <= 30) {
            warnings.push(`Authorization expires in ${daysUntilExpiration} days`);
        }
    }

    if (referral) {
        const visitsRemaining = referral.num_visits - (referral.visits_used || 0);
        if (visitsRemaining <= 1) {
            warnings.push(`Only ${visitsRemaining} referral visit(s) remaining`);
        }

        const expirationDate = new Date(referral.expiration_date);
        const daysUntilExpiration = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiration <= 30) {
            warnings.push(`Referral expires in ${daysUntilExpiration} days`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Decrement visit counter when claim is submitted
 * @param {Object} referral - The referral to update
 * @returns {Object} - Updated referral with incremented visits_used
 */
export function decrementReferralVisit(referral) {
    return {
        ...referral,
        visits_used: (referral.visits_used || 0) + 1
    };
}

/**
 * Check if authorization is about to expire (within 30 days)
 * @param {Object} auth - Referral or service authorization
 * @returns {boolean}
 */
export function isAuthExpiringSoon(auth) {
    const expirationField = auth.expiration_date || auth.end_date;
    if (!expirationField) return false;

    const expirationDate = new Date(expirationField);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

    return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
}

/**
 * Get all authorizations expiring soon
 * @param {Array} referrals - All referrals
 * @param {Array} serviceAuths - All service authorizations
 * @returns {Array} - Authorizations expiring within 30 days
 */
export function getExpiringAuthorizations(referrals, serviceAuths) {
    const expiring = [];

    referrals.forEach(ref => {
        if (ref.status === 'Approved' && isAuthExpiringSoon(ref)) {
            expiring.push({
                type: 'Referral',
                id: ref.referral_id,
                patient_id: ref.patient_id,
                expiration_date: ref.expiration_date,
                auth_number: ref.authorization_no
            });
        }
    });

    serviceAuths.forEach(auth => {
        if (auth.status === 'Approved' && isAuthExpiringSoon(auth)) {
            expiring.push({
                type: 'Service Auth',
                id: auth.auth_id,
                patient_id: auth.patient_id,
                expiration_date: auth.end_date,
                auth_number: auth.authorization_no,
                procedure: auth.procedure_description
            });
        }
    });

    return expiring;
}

export default {
    findMatchingReferral,
    findMatchingServiceAuth,
    autoPopulateAuthNumber,
    validateClaimAuthorization,
    decrementReferralVisit,
    isAuthExpiringSoon,
    getExpiringAuthorizations
};
