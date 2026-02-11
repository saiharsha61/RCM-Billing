/**
 * AES-256-GCM Encryption Service
 * Uses Web Crypto API for HIPAA-compliant encryption
 * 
 * Production notes:
 * - In production, encryption keys should be managed via AWS KMS, Azure Key Vault, or HashiCorp Vault
 * - The master key derivation uses PBKDF2 with 100,000 iterations
 * - Each encryption operation generates a unique IV (Initialization Vector)
 * - GCM mode provides both confidentiality AND authenticity (AEAD)
 */

// =====================================================
// KEY MANAGEMENT
// =====================================================

/**
 * Derive an AES-256 key from a passphrase using PBKDF2
 * In production, this would be replaced by KMS key retrieval
 */
export async function deriveKey(passphrase, salt) {
    const encoder = new TextEncoder();

    // Import passphrase as raw key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    // Derive AES-256-GCM key using PBKDF2
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt || encoder.encode('ecw-rcm-salt-v1'), // In production, use unique salt per key
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,    // not extractable
        ['encrypt', 'decrypt']
    );

    return key;
}

/**
 * Generate a random AES-256 key
 */
export async function generateKey() {
    return crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256
        },
        true,     // extractable for export
        ['encrypt', 'decrypt']
    );
}

/**
 * Export key to JWK format (for secure storage)
 */
export async function exportKey(key) {
    return crypto.subtle.exportKey('jwk', key);
}

/**
 * Import key from JWK format
 */
export async function importKey(jwk) {
    return crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// =====================================================
// ENCRYPTION / DECRYPTION
// =====================================================

/**
 * Encrypt data using AES-256-GCM
 * Returns: { iv, ciphertext, tag } as base64 strings
 * 
 * @param {string} plaintext - The data to encrypt
 * @param {CryptoKey} key - The AES-256 key
 * @param {string} additionalData - Optional AAD (Additional Authenticated Data)
 * @returns {Object} Encrypted payload with iv, ciphertext
 */
export async function encrypt(plaintext, key, additionalData = '') {
    const encoder = new TextEncoder();

    // Generate random 12-byte IV (recommended for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Prepare additional authenticated data
    const aad = additionalData ? encoder.encode(additionalData) : undefined;

    const algorithmParams = {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128  // 128-bit authentication tag
    };

    if (aad) {
        algorithmParams.additionalData = aad;
    }

    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
        algorithmParams,
        key,
        encoder.encode(plaintext)
    );

    // Return as base64-encoded strings for storage
    return {
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext),
        algorithm: 'AES-256-GCM',
        timestamp: new Date().toISOString()
    };
}

/**
 * Decrypt data using AES-256-GCM
 * 
 * @param {Object} encryptedPayload - { iv, ciphertext } as base64 strings
 * @param {CryptoKey} key - The AES-256 key
 * @param {string} additionalData - Must match the AAD used during encryption
 * @returns {string} Decrypted plaintext
 */
export async function decrypt(encryptedPayload, key, additionalData = '') {
    const encoder = new TextEncoder();

    const iv = base64ToArrayBuffer(encryptedPayload.iv);
    const ciphertext = base64ToArrayBuffer(encryptedPayload.ciphertext);
    const aad = additionalData ? encoder.encode(additionalData) : undefined;

    const algorithmParams = {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
    };

    if (aad) {
        algorithmParams.additionalData = aad;
    }

    try {
        const decrypted = await crypto.subtle.decrypt(
            algorithmParams,
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        throw new Error('Decryption failed: Invalid key, corrupted data, or tampered content');
    }
}

// =====================================================
// FIELD-LEVEL ENCRYPTION (for individual PHI fields)
// =====================================================

/**
 * Encrypt a single field value (SSN, DOB, clinical note, etc.)
 * Uses a cached key derived from the app master passphrase
 */
let _cachedKey = null;
const MASTER_PASSPHRASE = 'ecw-rcm-hipaa-master-key-v1'; // In production: from env/KMS

async function getOrCreateKey() {
    if (!_cachedKey) {
        _cachedKey = await deriveKey(MASTER_PASSPHRASE);
    }
    return _cachedKey;
}

/**
 * Encrypt a PHI field value
 * @param {string} value - The sensitive value to encrypt
 * @param {string} fieldName - Field identifier (used as AAD for integrity)
 * @returns {string} JSON string of encrypted payload
 */
export async function encryptField(value, fieldName = '') {
    if (!value) return '';

    try {
        const key = await getOrCreateKey();
        const encrypted = await encrypt(value, key, fieldName);
        return JSON.stringify(encrypted);
    } catch (error) {
        console.error(`[CRYPTO] Field encryption failed for ${fieldName}:`, error);
        throw error;
    }
}

/**
 * Decrypt a PHI field value
 * @param {string} encryptedJson - JSON string of encrypted payload
 * @param {string} fieldName - Must match the fieldName used during encryption
 * @returns {string} Decrypted value
 */
export async function decryptField(encryptedJson, fieldName = '') {
    if (!encryptedJson) return '';

    try {
        const payload = JSON.parse(encryptedJson);
        const key = await getOrCreateKey();
        return await decrypt(payload, key, fieldName);
    } catch (error) {
        console.error(`[CRYPTO] Field decryption failed for ${fieldName}:`, error);
        throw error;
    }
}

/**
 * Encrypt multiple fields in an object
 * @param {Object} data - Object with field values
 * @param {string[]} fieldsToEncrypt - Array of field names to encrypt
 * @returns {Object} Object with specified fields encrypted
 */
export async function encryptFields(data, fieldsToEncrypt) {
    const result = { ...data };

    for (const field of fieldsToEncrypt) {
        if (result[field]) {
            result[field] = await encryptField(result[field], field);
        }
    }

    return result;
}

/**
 * Decrypt multiple fields in an object
 * @param {Object} data - Object with encrypted field values
 * @param {string[]} fieldsToDecrypt - Array of field names to decrypt
 * @returns {Object} Object with specified fields decrypted
 */
export async function decryptFields(data, fieldsToDecrypt) {
    const result = { ...data };

    for (const field of fieldsToDecrypt) {
        if (result[field]) {
            result[field] = await decryptField(result[field], field);
        }
    }

    return result;
}

// =====================================================
// HASHING (for data integrity verification)
// =====================================================

/**
 * Generate SHA-256 hash of data
 * Used for file integrity verification (documents table)
 */
export async function sha256Hash(data) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return arrayBufferToHex(hashBuffer);
}

/**
 * Generate HMAC-SHA256 for message authentication
 */
export async function hmacSign(message, secret) {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return arrayBufferToBase64(signature);
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// =====================================================
// KEY ROTATION SUPPORT
// =====================================================

/**
 * Re-encrypt data with a new key (for key rotation)
 * @param {string} encryptedJson - Currently encrypted data
 * @param {CryptoKey} oldKey - Current encryption key
 * @param {CryptoKey} newKey - New encryption key
 * @param {string} fieldName - Field name (AAD)
 * @returns {string} Re-encrypted data with new key
 */
export async function rotateEncryption(encryptedJson, oldKey, newKey, fieldName = '') {
    // Decrypt with old key
    const payload = JSON.parse(encryptedJson);
    const plaintext = await decrypt(payload, oldKey, fieldName);

    // Re-encrypt with new key
    const newPayload = await encrypt(plaintext, newKey, fieldName);
    return JSON.stringify(newPayload);
}

// =====================================================
// EXPORTS
// =====================================================

export const cryptoService = {
    // Key management
    deriveKey,
    generateKey,
    exportKey,
    importKey,

    // Encryption/Decryption
    encrypt,
    decrypt,

    // Field-level
    encryptField,
    decryptField,
    encryptFields,
    decryptFields,

    // Hashing
    sha256Hash,
    hmacSign,

    // Key rotation
    rotateEncryption
};

export default cryptoService;
