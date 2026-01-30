// Password Validation for HIPAA Compliance
// Enforces strong password requirements

/**
 * Password requirements for HIPAA compliance:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export function validatePassword(password) {
    const errors = [];

    if (!password) {
        return { valid: false, errors: ['Password is required'] };
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;

    // Length bonus
    strength += Math.min(password.length * 4, 40);

    // Character variety
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;

    // Extra points for multiple numbers/special chars
    const numbers = (password.match(/[0-9]/g) || []).length;
    const special = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    strength += Math.min(numbers * 2, 10);
    strength += Math.min(special * 3, 15);

    return Math.min(strength, 100);
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength) {
    if (strength < 30) return { label: 'Weak', color: '#dc2626' };
    if (strength < 60) return { label: 'Fair', color: '#f59e0b' };
    if (strength < 80) return { label: 'Good', color: '#10b981' };
    return { label: 'Strong', color: '#059669' };
}

/**
 * Check if password has been compromised (placeholder)
 * In production, use haveibeenpwned API
 */
export async function checkPasswordCompromised(password) {
    // Placeholder - in production, check against haveibeenpwned API
    return false;
}

/**
 * Validate password confirmation match
 */
export function validatePasswordMatch(password, confirmPassword) {
    if (!confirmPassword) {
        return { valid: false, error: 'Please confirm your password' };
    }

    if (password !== confirmPassword) {
        return { valid: false, error: 'Passwords do not match' };
    }

    return { valid: true, error: null };
}
