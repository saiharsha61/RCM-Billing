// HIPAA-Compliant Encryption Utilities
// For production, use server-side encryption with proper key management

/**
 * Mask Social Security Number
 * Example: 123-45-6789 → ***-**-6789
 */
export function maskSSN(ssn) {
    if (!ssn) return '';
    const cleaned = ssn.replace(/\D/g, '');
    if (cleaned.length !== 9) return ssn;
    return `***-**-${cleaned.slice(-4)}`;
}

/**
 * Mask Date of Birth
 * Example: 1985-03-15 → **/**/**** (Age: 38)
 */
export function maskDOB(dob) {
    if (!dob) return '';
    const date = new Date(dob);
    const age = new Date().getFullYear() - date.getFullYear();
    return `**/**/**** (Age: ${age})`;
}

/**
 * Mask Phone Number
 * Example: (555) 123-4567 → (***) ***-4567
 */
export function maskPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(***) ***-${cleaned.slice(-4)}`;
    }
    return phone.replace(/\d(?=\d{4})/g, '*');
}

/**
 * Mask Email
 * Example: john.doe@email.com → j***@email.com
 */
export function maskEmail(email) {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    return `${local[0]}***@${domain}`;
}

/**
 * Mask Credit Card
 * Example: 4532-1234-5678-9010 → ****-****-****-9010
 */
export function maskCreditCard(cardNumber) {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    return `****-****-****-${cleaned.slice(-4)}`;
}

/**
 * Simple encryption for client-side storage (NOT for production PHI)
 * For production: Use server-side encryption with AWS KMS, Azure Key Vault, etc.
 */
export function encryptField(value, key = 'demo-key-not-secure') {
    if (!value) return '';
    // This is a simple Base64 encoding for demo purposes only
    // In production, use proper encryption libraries like crypto-js or server-side encryption
    try {
        return btoa(unescape(encodeURIComponent(value)));
    } catch (e) {
        console.error('Encryption failed:', e);
        return value;
    }
}

/**
 * Simple decryption for client-side storage (NOT for production PHI)
 */
export function decryptField(encryptedValue, key = 'demo-key-not-secure') {
    if (!encryptedValue) return '';
    try {
        return decodeURIComponent(escape(atob(encryptedValue)));
    } catch (e) {
        console.error('Decryption failed:', e);
        return encryptedValue;
    }
}

/**
 * Validate if data should be masked based on user permissions
 */
export function shouldMaskData(userRole, dataType) {
    const rolePermissions = {
        'admin': [], // Admin sees all
        'billing': ['ssn'], // Billing can see partial SSN
        'front-desk': ['ssn', 'dob', 'insurance'], // Front desk sees masked data
        'viewer': ['ssn', 'dob', 'insurance', 'phone', 'email'] // Viewer sees fully masked
    };

    const maskedFields = rolePermissions[userRole] || rolePermissions['viewer'];
    return maskedFields.includes(dataType);
}

/**
 * Format SSN with proper masking based on user role
 */
export function formatSSN(ssn, userRole = 'viewer') {
    if (!ssn) return '';
    if (shouldMaskData(userRole, 'ssn')) {
        return maskSSN(ssn);
    }
    // Format: 123-45-6789
    const cleaned = ssn.replace(/\D/g, '');
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
    }
    return ssn;
}

// Export all utilities
export const security = {
    maskSSN,
    maskDOB,
    maskPhone,
    maskEmail,
    maskCreditCard,
    encryptField,
    decryptField,
    shouldMaskData,
    formatSSN
};
