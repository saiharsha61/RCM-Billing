/**
 * FHIR OAuth 2.0 / SMART on FHIR Authentication (Mock)
 * 
 * Implements OAuth 2.0 authorization code flow and SMART on FHIR launch framework
 * This is a DEMONSTRATION implementation only - not suitable for production
 * 
 * For production:
 * - Use a proper OAuth provider (Auth0, Okta, Azure AD)
 * - Implement PKCE (Proof Key for Code Exchange)
 * - Store tokens securely (httpOnly cookies or secure storage)
 * - Add token refresh logic
 * - Implement proper scope validation
 */

// =====================================================
// SMART ON FHIR SCOPES
// =====================================================

export const SMART_SCOPES = {
    // Patient-level scopes (patient/*)
    PATIENT_READ_ALL: 'patient/*.read',
    PATIENT_WRITE_ALL: 'patient/*.write',
    PATIENT_READ_SPECIFIC: {
        PATIENT: 'patient/Patient.read',
        OBSERVATION: 'patient/Observation.read',
        CONDITION: 'patient/Condition.read',
        MEDICATION: 'patient/MedicationRequest.read',
        DOCUMENT: 'patient/DocumentReference.read'
    },

    // User-level scopes (user/*)
    USER_READ_ALL: 'user/*.read',
    USER_WRITE_ALL: 'user/*.write',

    // System-level scopes (system/*)
    SYSTEM_READ_ALL: 'system/*.read',
    SYSTEM_WRITE_ALL: 'system/*.write',

    // OpenID Connect
    OPENID: 'openid',
    FHIR_USER: 'fhirUser',
    PROFILE: 'profile',
    EMAIL: 'email',

    // Launch contexts
    LAUNCH: 'launch',
    LAUNCH_PATIENT: 'launch/patient',
    LAUNCH_ENCOUNTER: 'launch/encounter',
    OFFLINE_ACCESS: 'offline_access'
};

// =====================================================
// TOKEN STORAGE (In-Memory - Demo Only)
// =====================================================

const authorizationCodes = new Map();
const accessTokens = new Map();
const refreshTokens = new Map();

// =====================================================
// SMART CONFIGURATION
// =====================================================

/**
 * Get SMART on FHIR configuration
 * GET /fhir/.well-known/smart-configuration
 */
export function getSmartConfiguration() {
    return {
        status: 200,
        body: {
            issuer: 'http://localhost:5174/fhir',
            jwks_uri: 'http://localhost:5174/fhir/.well-known/jwks.json',
            authorization_endpoint: 'http://localhost:5174/fhir/authorize',
            token_endpoint: 'http://localhost:5174/fhir/token',
            token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
            grant_types_supported: ['authorization_code', 'refresh_token'],
            registration_endpoint: 'http://localhost:5174/fhir/register',
            scopes_supported: [
                'openid',
                'fhirUser',
                'launch',
                'launch/patient',
                'patient/*.read',
                'patient/*.write',
                'user/*.read',
                'user/*.write',
                'system/*.read',
                'offline_access'
            ],
            response_types_supported: ['code'],
            capabilities: [
                'launch-ehr',
                'launch-standalone',
                'client-public',
                'client-confidential-symmetric',
                'context-ehr-patient',
                'context-ehr-encounter',
                'sso-openid-connect'
            ],
            code_challenge_methods_supported: ['S256']
        }
    };
}

// =====================================================
// AUTHORIZATION ENDPOINT
// =====================================================

/**
 * OAuth authorization endpoint
 * GET /fhir/authorize
 * 
 * Query params:
 * - response_type: 'code'
 * - client_id: application client ID
 * - redirect_uri: callback URI
 * - scope: space-separated scopes
 * - state: client state for CSRF protection
 * - aud: FHIR server URL
 * - launch: launch context (optional)
 */
export function authorize(params) {
    const {
        response_type,
        client_id,
        redirect_uri,
        scope,
        state,
        aud,
        launch
    } = params;

    // Validate required parameters
    if (!response_type || response_type !== 'code') {
        return {
            status: 400,
            body: {
                error: 'invalid_request',
                error_description: 'response_type must be "code"'
            }
        };
    }

    if (!client_id || !redirect_uri || !scope) {
        return {
            status: 400,
            body: {
                error: 'invalid_request',
                error_description: 'Missing required parameters'
            }
        };
    }

    // Generate authorization code
    const authCode = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Store authorization code with context
    authorizationCodes.set(authCode, {
        client_id,
        redirect_uri,
        scope,
        user_id: 'demo-user-123', // In production, this would be the authenticated user
        patient_id: 'patient-9609', // From launch context or user selection
        expires_at: Date.now() + 10 * 60 * 1000, // 10 minutes
        created_at: Date.now()
    });

    // Redirect to client with authorization code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', authCode);
    if (state) {
        redirectUrl.searchParams.set('state', state);
    }

    return {
        status: 302,
        headers: {
            'Location': redirectUrl.toString()
        },
        body: {
            redirect_to: redirectUrl.toString(),
            authorization_code: authCode // For demo purposes only!
        }
    };
}

// =====================================================
// TOKEN ENDPOINT
// =====================================================

/**
 * OAuth token endpoint
 * POST /fhir/token
 * 
 * Body params:
 * - grant_type: 'authorization_code' or 'refresh_token'
 * - code: authorization code (for authorization_code grant)
 * - redirect_uri: must match authorization request
 * - client_id: application client ID
 * - refresh_token: refresh token (for refresh_token grant)
 */
export function token(params) {
    const {
        grant_type,
        code,
        redirect_uri,
        client_id,
        refresh_token: refreshTokenValue
    } = params;

    // Authorization code grant
    if (grant_type === 'authorization_code') {
        return handleAuthorizationCodeGrant(code, redirect_uri, client_id);
    }

    // Refresh token grant
    if (grant_type === 'refresh_token') {
        return handleRefreshTokenGrant(refreshTokenValue, client_id);
    }

    return {
        status: 400,
        body: {
            error: 'unsupported_grant_type',
            error_description: 'Only authorization_code and refresh_token grants are supported'
        }
    };
}

function handleAuthorizationCodeGrant(code, redirect_uri, client_id) {
    // Validate authorization code
    const authData = authorizationCodes.get(code);

    if (!authData) {
        return {
            status: 400,
            body: {
                error: 'invalid_grant',
                error_description: 'Invalid or expired authorization code'
            }
        };
    }

    // Check expiration
    if (Date.now() > authData.expires_at) {
        authorizationCodes.delete(code);
        return {
            status: 400,
            body: {
                error: 'invalid_grant',
                error_description: 'Authorization code expired'
            }
        };
    }

    // Validate redirect URI matches
    if (authData.redirect_uri !== redirect_uri) {
        return {
            status: 400,
            body: {
                error: 'invalid_grant',
                error_description: 'redirect_uri mismatch'
            }
        };
    }

    // Generate access token
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;

    const tokenData = {
        user_id: authData.user_id,
        patient_id: authData.patient_id,
        scope: authData.scope,
        client_id: authData.client_id,
        expires_at: Date.now() + 60 * 60 * 1000, // 1 hour
        created_at: Date.now()
    };

    accessTokens.set(accessToken, tokenData);
    refreshTokens.set(refreshToken, { ...tokenData, access_token: accessToken });

    // Invalidate authorization code (one-time use)
    authorizationCodes.delete(code);

    return {
        status: 200,
        body: {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: refreshToken,
            scope: authData.scope,
            patient: authData.patient_id,
            // SMART on FHIR specific
            need_patient_banner: true,
            smart_style_url: 'http://localhost:5174/smart-style.json'
        }
    };
}

function handleRefreshTokenGrant(refreshTokenValue, client_id) {
    const refreshData = refreshTokens.get(refreshTokenValue);

    if (!refreshData) {
        return {
            status: 400,
            body: {
                error: 'invalid_grant',
                error_description: 'Invalid refresh token'
            }
        };
    }

    // Generate new access token
    const newAccessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;

    const tokenData = {
        user_id: refreshData.user_id,
        patient_id: refreshData.patient_id,
        scope: refreshData.scope,
        client_id: refreshData.client_id,
        expires_at: Date.now() + 60 * 60 * 1000,
        created_at: Date.now()
    };

    // Invalidate old access token
    accessTokens.delete(refreshData.access_token);

    // Store new access token
    accessTokens.set(newAccessToken, tokenData);
    refreshData.access_token = newAccessToken;

    return {
        status: 200,
        body: {
            access_token: newAccessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: refreshData.scope,
            patient: refreshData.patient_id
        }
    };
}

// =====================================================
// TOKEN INTROSPECTION
// =====================================================

/**
 * Token introspection endpoint
 * POST /fhir/introspect
 * 
 * Body params:
 * - token: access token to introspect
 */
export function introspect(params) {
    const { token: tokenValue } = params;

    const tokenData = accessTokens.get(tokenValue);

    if (!tokenData) {
        return {
            status: 200,
            body: {
                active: false
            }
        };
    }

    // Check if token is expired
    const isActive = Date.now() < tokenData.expires_at;

    if (!isActive) {
        accessTokens.delete(tokenValue);
        return {
            status: 200,
            body: {
                active: false
            }
        };
    }

    return {
        status: 200,
        body: {
            active: true,
            scope: tokenData.scope,
            client_id: tokenData.client_id,
            username: `user-${tokenData.user_id}`,
            exp: Math.floor(tokenData.expires_at / 1000),
            iat: Math.floor(tokenData.created_at / 1000),
            // SMART on FHIR extensions
            patient: tokenData.patient_id,
            fhirUser: `Practitioner/provider-${tokenData.user_id}`
        }
    };
}

// =====================================================
// BEARER TOKEN VALIDATION
// =====================================================

/**
 * Validate bearer token from Authorization header
 * @param {string} authHeader - 'Bearer <token>'
 * @returns {Object|null} Token data if valid, null otherwise
 */
export function validateBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const tokenData = accessTokens.get(token);

    if (!tokenData) {
        return null;
    }

    // Check expiration
    if (Date.now() > tokenData.expires_at) {
        accessTokens.delete(token);
        return null;
    }

    return tokenData;
}

/**
 * Check if token has required scope
 * @param {Object} tokenData - Token data from validateBearerToken
 * @param {string} requiredScope - Required scope (e.g., 'patient/Patient.read')
 * @returns {boolean} True if token has scope
 */
export function hasScope(tokenData, requiredScope) {
    if (!tokenData || !tokenData.scope) {
        return false;
    }

    const scopes = tokenData.scope.split(' ');

    // Check for wildcard scopes
    if (scopes.includes('patient/*.read') && requiredScope.startsWith('patient/') && requiredScope.endsWith('.read')) {
        return true;
    }
    if (scopes.includes('patient/*.write') && requiredScope.startsWith('patient/') && requiredScope.endsWith('.write')) {
        return true;
    }
    if (scopes.includes('user/*.read') && requiredScope.startsWith('user/') && requiredScope.endsWith('.read')) {
        return true;
    }
    if (scopes.includes('system/*.read') && requiredScope.startsWith('system/') && requiredScope.endsWith('.read')) {
        return true;
    }

    // Check for exact scope match
    return scopes.includes(requiredScope);
}

// =====================================================
// DEMO/TESTING UTILITIES
// =====================================================

/**
 * Generate a demo access token for testing (bypasses OAuth flow)
 * DO NOT USE IN PRODUCTION
 */
export function generateDemoToken(userId = 'demo-user', patientId = 'patient-9609', scopes = 'patient/*.read') {
    const accessToken = `demo_access_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    const tokenData = {
        user_id: userId,
        patient_id: patientId,
        scope: scopes,
        client_id: 'demo-client',
        expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        created_at: Date.now()
    };

    accessTokens.set(accessToken, tokenData);

    return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 86400,
        scope: scopes,
        patient: patientId
    };
}

/**
 * Clear all tokens (for testing/demo reset)
 */
export function clearAllTokens() {
    authorizationCodes.clear();
    accessTokens.clear();
    refreshTokens.clear();
    console.log('[FHIR Auth] All tokens cleared');
}

// =====================================================
// EXPORTS
// =====================================================

export const fhirAuth = {
    // SMART configuration
    getSmartConfiguration,

    // OAuth endpoints
    authorize,
    token,
    introspect,

    // Token validation
    validateBearerToken,
    hasScope,

    // Demo utilities
    generateDemoToken,
    clearAllTokens,

    // Scopes
    SMART_SCOPES
};

export default fhirAuth;
