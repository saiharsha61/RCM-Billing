// Validation Functions for ECW-Style RCM System

/**
 * PATIENT VALIDATION
 */
export function validatePatient(patient) {
    const errors = [];

    // Required fields
    if (!patient.FirstName || patient.FirstName.trim() === '') {
        errors.push('First Name is required');
    }
    if (!patient.LastName || patient.LastName.trim() === '') {
        errors.push('Last Name is required');
    }
    if (!patient.DOB) {
        errors.push('Date of Birth is required');
    }
    if (!patient.Gender) {
        errors.push('Gender is required');
    }

    // DOB validation (must be in the past)
    if (patient.DOB) {
        const dob = new Date(patient.DOB);
        if (dob > new Date()) {
            errors.push('Date of Birth cannot be in the future');
        }
    }

    // SSN format validation (XXX-XX-XXXX)
    if (patient.SSN) {
        const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
        if (!ssnPattern.test(patient.SSN)) {
            errors.push('SSN must be in format XXX-XX-XXXX');
        }
    }

    // Phone validation
    if (patient.Phone) {
        const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;
        if (!phonePattern.test(patient.Phone)) {
            errors.push('Phone must be in format (XXX) XXX-XXXX');
        }
    }

    // Email validation
    if (patient.Email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(patient.Email)) {
            errors.push('Invalid email format');
        }
    }

    // ZIP code validation
    if (patient.ZipCode) {
        const zipPattern = /^\d{5}(-\d{4})?$/;
        if (!zipPattern.test(patient.ZipCode)) {
            errors.push('ZIP code must be 5 or 9 digits (XXXXX or XXXXX-XXXX)');
        }
    }

    // Height validation (if Item Key 1562_DMJ enabled)
    if (patient.Height_cm !== null && patient.Height_cm !== undefined) {
        if (patient.Height_cm < 30 || patient.Height_cm > 250) {
            errors.push('Height must be between 30-250 cm');
        }
    }

    // Weight validation (if Item Key 1573_DMJ enabled)
    if (patient.Weight_kg !== null && patient.Weight_kg !== undefined) {
        if (patient.Weight_kg < 0.5 || patient.Weight_kg > 500) {
            errors.push('Weight must be between 0.5-500 kg');
        }
    }

    // Head Circumference validation (if Item Key 0833_DMJ enabled)
    if (patient.HeadCircumference !== null && patient.HeadCircumference !== undefined) {
        if (patient.HeadCircumference < 20 || patient.HeadCircumference > 70) {
            errors.push('Head Circumference must be between 20-70 cm');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * INSURANCE VALIDATION
 */
export function validateInsurance(insurance) {
    const errors = [];

    // Required fields
    if (!insurance.InsuranceName || insurance.InsuranceName.trim() === '') {
        errors.push('Insurance Name is required');
    }
    if (!insurance.PolicyNumber || insurance.PolicyNumber.trim() === '') {
        errors.push('Policy Number is required');
    }
    if (!insurance.Priority) {
        errors.push('Priority is required');
    }

    // Priority must be 1, 2, or 3
    if (insurance.Priority && ![1, 2, 3].includes(insurance.Priority)) {
        errors.push('Priority must be 1 (Primary), 2 (Secondary), or 3 (Tertiary)');
    }

    // Effective Date validation
    if (insurance.EffectiveDate && insurance.TerminationDate) {
        const effective = new Date(insurance.EffectiveDate);
        const termination = new Date(insurance.TerminationDate);
        if (effective > termination) {
            errors.push('Effective Date must be before Termination Date');
        }
    }

    // Financial amounts must be non-negative
    if (insurance.Copay && insurance.Copay < 0) {
        errors.push('Copay cannot be negative');
    }
    if (insurance.Deductible && insurance.Deductible < 0) {
        errors.push('Deductible cannot be negative');
    }
    if (insurance.DeductibleMet && insurance.DeductibleMet < 0) {
        errors.push('Deductible Met cannot be negative');
    }

    // Deductible Met cannot exceed Deductible
    if (insurance.DeductibleMet > insurance.Deductible) {
        errors.push('Deductible Met cannot exceed Total Deductible');
    }

    // OOP Met cannot exceed OOP Max
    if (insurance.OOPMet > insurance.OOPMax) {
        errors.push('Out-of-Pocket Met cannot exceed Out-of-Pocket Maximum');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * REFERRAL VALIDATION
 */
export function validateReferral(referral) {
    const errors = [];

    // Required fields
    if (!referral.RefToID) {
        errors.push('Specialist (Referred To) is required');
    }
    if (!referral.SpecialtyType || referral.SpecialtyType.trim() === '') {
        errors.push('Specialty Type is required');
    }
    if (!referral.StartDate) {
        errors.push('Start Date is required');
    }
    if (!referral.EndDate) {
        errors.push('End Date is required');
    }

    // Date validation
    if (referral.StartDate && referral.EndDate) {
        const start = new Date(referral.StartDate);
        const end = new Date(referral.EndDate);
        if (start > end) {
            errors.push('Start Date must be before End Date');
        }
    }

    // Visits validation
    if (referral.VisitsAllowed && referral.VisitsAllowed < 1) {
        errors.push('Visits Allowed must be at least 1');
    }
    if (referral.VisitsUsed && referral.VisitsUsed < 0) {
        errors.push('Visits Used cannot be negative');
    }
    if (referral.VisitsUsed > referral.VisitsAllowed) {
        errors.push('Visits Used cannot exceed Visits Allowed');
    }

    // Authorization number format (if provided)
    if (referral.AuthNo) {
        if (referral.AuthNo.length < 5 || referral.AuthNo.length > 50) {
            errors.push('Authorization Number must be between 5-50 characters');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * CLAIM VALIDATION
 */
export function validateClaim(claim) {
    const errors = [];

    // Required fields
    if (!claim.PatientID) {
        errors.push('Patient is required');
    }
    if (!claim.BillingProviderID) {
        errors.push('Billing Provider is required');
    }
    if (!claim.RenderingProviderID) {
        errors.push('Rendering Provider is required');
    }
    if (!claim.ServiceDateFrom) {
        errors.push('Service Date From is required');
    }
    if (!claim.ServiceDateTo) {
        errors.push('Service Date To is required');
    }
    if (!claim.InsuranceID) {
        errors.push('Insurance is required');
    }

    // Date validation
    if (claim.ServiceDateFrom && claim.ServiceDateTo) {
        const from = new Date(claim.ServiceDateFrom);
        const to = new Date(claim.ServiceDateTo);
        if (from > to) {
            errors.push('Service Date From must be before or equal to Service Date To');
        }
    }

    // Financial validation
    if (claim.TotalCharges && claim.TotalCharges < 0) {
        errors.push('Total Charges cannot be negative');
    }
    if (claim.TotalPayments && claim.TotalPayments < 0) {
        errors.push('Total Payments cannot be negative');
    }
    if (claim.TotalPayments > claim.TotalCharges) {
        errors.push('Total Payments cannot exceed Total Charges');
    }

    // Authorization required for certain services (business rule)
    if (claim.ReferringProviderID && !claim.AuthorizationNo) {
        errors.push('Authorization Number is required for referred services');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * CLAIM LINE ITEM VALIDATION
 */
export function validateClaimLineItem(lineItem) {
    const errors = [];

    // Required fields
    if (!lineItem.CPTCode || lineItem.CPTCode.trim() === '') {
        errors.push('CPT Code is required');
    }
    if (!lineItem.ServiceDate) {
        errors.push('Service Date is required');
    }
    if (!lineItem.Units || lineItem.Units < 1) {
        errors.push('Units must be at least 1');
    }
    if (!lineItem.ChargeAmount || lineItem.ChargeAmount <= 0) {
        errors.push('Charge Amount must be greater than 0');
    }
    if (!lineItem.PlaceOfService) {
        errors.push('Place of Service is required');
    }

    // CPT Code format validation (XXXXX or XXXXX-XX)
    if (lineItem.CPTCode) {
        const cptPattern = /^\d{5}(-[A-Z0-9]{2})?$/;
        if (!cptPattern.test(lineItem.CPTCode)) {
            errors.push('CPT Code must be 5 digits (e.g., 99213)');
        }
    }

    // Modifier validation (2 characters, alphanumeric)
    const modifierPattern = /^[A-Z0-9]{2}$/;
    if (lineItem.Modifier1 && !modifierPattern.test(lineItem.Modifier1)) {
        errors.push('Modifier 1 must be 2 alphanumeric characters');
    }
    if (lineItem.Modifier2 && !modifierPattern.test(lineItem.Modifier2)) {
        errors.push('Modifier 2 must be 2 alphanumeric characters');
    }
    if (lineItem.Modifier3 && !modifierPattern.test(lineItem.Modifier3)) {
        errors.push('Modifier 3 must be 2 alphanumeric characters');
    }
    if (lineItem.Modifier4 && !modifierPattern.test(lineItem.Modifier4)) {
        errors.push('Modifier 4 must be 2 alphanumeric characters');
    }

    // Diagnosis pointers validation
    if (!lineItem.DiagnosisPointers || lineItem.DiagnosisPointers.trim() === '') {
        errors.push('Diagnosis Pointers are required');
    }

    // Financial validation
    if (lineItem.AllowedAmount && lineItem.AllowedAmount > lineItem.ChargeAmount) {
        errors.push('Allowed Amount cannot exceed Charge Amount');
    }
    if (lineItem.PaidAmount && lineItem.PaidAmount > lineItem.ChargeAmount) {
        errors.push('Paid Amount cannot exceed Charge Amount');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * PROVIDER VALIDATION
 */
export function validateProvider(provider) {
    const errors = [];

    // Required fields
    if (!provider.FirstName || provider.FirstName.trim() === '') {
        errors.push('First Name is required');
    }
    if (!provider.LastName || provider.LastName.trim() === '') {
        errors.push('Last Name is required');
    }
    if (!provider.NPI || provider.NPI.trim() === '') {
        errors.push('NPI is required');
    }

    // NPI validation (10 digits)
    if (provider.NPI) {
        const npiPattern = /^\d{10}$/;
        if (!npiPattern.test(provider.NPI)) {
            errors.push('NPI must be exactly 10 digits');
        }
    }

    // Tax ID validation (XX-XXXXXXX)
    if (provider.TaxID) {
        const taxIdPattern = /^\d{2}-\d{7}$/;
        if (!taxIdPattern.test(provider.TaxID)) {
            errors.push('Tax ID must be in format XX-XXXXXXX');
        }
    }

    // DEA validation (2 letters + 7 digits)
    if (provider.DEA) {
        const deaPattern = /^[A-Z]{2}\d{7}$/;
        if (!deaPattern.test(provider.DEA)) {
            errors.push('DEA must be 2 letters followed by 7 digits');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * PAYMENT VALIDATION
 */
export function validatePayment(payment) {
    const errors = [];

    // Required fields
    if (!payment.InvoiceID) {
        errors.push('Invoice/Claim is required');
    }
    if (!payment.PaymentDate) {
        errors.push('Payment Date is required');
    }
    if (!payment.PaymentAmount || payment.PaymentAmount <= 0) {
        errors.push('Payment Amount must be greater than 0');
    }
    if (!payment.PaymentSource) {
        errors.push('Payment Source is required');
    }

    // Payment date cannot be in the future
    if (payment.PaymentDate) {
        const payDate = new Date(payment.PaymentDate);
        if (payDate > new Date()) {
            errors.push('Payment Date cannot be in the future');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * HELPER: Check if Item Key is enabled
 */
export function isItemKeyEnabled(itemKeyCode, itemKeys) {
    const itemKey = itemKeys.find(ik => ik.ItemKeyCode === itemKeyCode);
    return itemKey ? itemKey.IsEnabled : false;
}

/**
 * HELPER: Calculate visits remaining
 */
export function calculateVisitsRemaining(visitsAllowed, visitsUsed) {
    return Math.max(0, visitsAllowed - visitsUsed);
}

/**
 * HELPER: Check if referral is active
 */
export function isReferralActive(referral) {
    const now = new Date();
    const start = new Date(referral.StartDate);
    const end = new Date(referral.EndDate);
    return now >= start && now <= end && referral.VisitsRemaining > 0;
}

/**
 * HELPER: Format SSN for display (masking)
 */
export function formatSSNForDisplay(ssn, userRole = 'viewer') {
    if (!ssn) return '';
    if (userRole === 'admin') {
        return ssn; // Show full SSN
    }
    // Mask for all other roles
    const digits = ssn.replace(/\D/g, '');
    if (digits.length === 9) {
        return `***-**-${digits.slice(-4)}`;
    }
    return '***-**-****';
}

/**
 * HELPER: Calculate patient age from DOB
 */
export function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Export all validation functions
export default {
    validatePatient,
    validateInsurance,
    validateReferral,
    validateClaim,
    validateClaimLineItem,
    validateProvider,
    validatePayment,
    isItemKeyEnabled,
    calculateVisitsRemaining,
    isReferralActive,
    formatSSNForDisplay,
    calculateAge
};
