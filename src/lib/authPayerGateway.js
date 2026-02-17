/**
 * Authorization Payer Gateway
 * Mock X12 278 submission and response handling
 * Spec FR-06: Submit 278 request via clearinghouse or direct payer API
 * Spec FR-08: Real-time status polling from payer
 * 
 * In production, this would integrate with a real clearinghouse (e.g., Availity, Change Healthcare).
 * For demo, simulates submission, polling, and response with realistic delays and outcomes.
 */

// =====================================================
// X12 278 TRANSACTION BUILDER (FR-06)
// =====================================================

/**
 * Generate a mock X12 278 Prior Authorization Request transaction
 * @param {Object} authData - Authorization request data
 * @returns {string} - Mock X12 278 string
 */
export function generateX12_278Request(authData) {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-T:.Z]/g, '').substring(0, 14);
    const controlNum = String(Date.now()).slice(-9).padStart(9, '0');

    const segments = [
        `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${dateStr.substring(2, 8)}*${dateStr.substring(8, 12)}*^*00501*${controlNum}*0*P*:~`,
        `GS*HI*SENDER*RECEIVER*${dateStr.substring(0, 8)}*${dateStr.substring(8, 12)}*${controlNum}*X*005010X217~`,
        `ST*278*0001*005010X217~`,
        `BHT*0078*${authData.urgency === 'urgent' ? '18' : '13'}*${controlNum}*${dateStr.substring(0, 8)}*${dateStr.substring(8, 12)}~`,
        // Submitter
        `HL*1**20*1~`,
        `NM1*X3*2*CLEARINGHOUSE NAME*****PI*${authData.clearinghouse_id || 'CLH001'}~`,
        // Receiver (Payer)
        `HL*2*1*21*1~`,
        `NM1*PR*2*${authData.payer_name || 'PAYER'}*****PI*${authData.payer_id || 'PAYERID'}~`,
        // Subscriber
        `HL*3*2*22*1~`,
        `NM1*IL*1*${authData.patient_last_name || 'LASTNAME'}*${authData.patient_first_name || 'FIRSTNAME'}****MI*${authData.member_id || 'MBR001'}~`,
        `DMG*D8*${authData.patient_dob || '19700101'}*${authData.patient_gender || 'M'}~`,
        // Requesting Provider
        `HL*4*3*19*1~`,
        `NM1*DN*1*${authData.provider_last_name || 'PROVIDER'}*${authData.provider_first_name || 'DR'}****XX*${authData.provider_npi || '1234567890'}~`,
        `PRV*RF*PXC*${authData.taxonomy_code || '207R00000X'}~`,
        // Service Details
        `UM*HS*${authData.service_type === 'INPATIENT' ? 'I' : 'O'}*${authData.urgency === 'urgent' ? '3' : '2'}~`,
        ...(authData.diagnosis_codes || []).map((dx, i) =>
            `HI*${i === 0 ? 'ABK' : 'ABF'}:${dx}~`
        ),
        // Service Lines
        ...(authData.cpt_codes || []).map(cpt =>
            `SV1*HC:${cpt}*${authData.charge_amount || '0'}*UN*${authData.units_requested || 1}~`
        ),
        `DTP*472*RD8*${authData.effective_date?.replace(/-/g, '') || dateStr.substring(0, 8)}-${authData.expiry_date?.replace(/-/g, '') || '99991231'}~`,
        // Footer
        `SE*${16 + (authData.diagnosis_codes?.length || 0) + (authData.cpt_codes?.length || 0)}*0001~`,
        `GE*1*${controlNum}~`,
        `IEA*1*${controlNum}~`
    ];

    return segments.join('\n');
}

/**
 * Parse a mock X12 278 Prior Authorization Response
 * @param {string} x12Response - Raw X12 278 response string
 * @returns {Object} - Parsed response data
 */
export function parseX12_278Response(x12Response) {
    // In demo mode, parse the mock response object
    if (typeof x12Response === 'object') return x12Response;

    // Simple mock parsing (in production, use a real X12 parser like Stedi)
    const lines = x12Response.split('\n');
    const result = {
        controlNumber: '',
        status: 'PENDING',
        authNumber: null,
        approvedUnits: null,
        denialReason: null,
        responseDate: new Date().toISOString()
    };

    lines.forEach(line => {
        const segments = line.split('*');
        if (segments[0] === 'AAA') {
            // Response status
            result.status = segments[1] === 'Y' ? 'APPROVED' : 'DENIED';
            result.denialReason = segments[3] || null;
        }
        if (segments[0] === 'REF' && segments[1] === 'BB') {
            result.authNumber = segments[2];
        }
        if (segments[0] === 'HSD' && segments[1] === 'VS') {
            result.approvedUnits = parseInt(segments[2]) || null;
        }
    });

    return result;
}

// =====================================================
// PAYER SUBMISSION ENGINE
// =====================================================

/**
 * FR-06: Submit authorization to payer (mock)
 * Simulates clearinghouse submission with realistic latency
 * @param {Object} authRequest - Full authorization request
 * @returns {Promise<Object>} - Submission result
 */
export async function submitToPayer(authRequest) {
    // Generate the X12 278 transaction
    const x12Request = generateX12_278Request(authRequest);
    const clearinghouseRef = `CLH-${Date.now().toString(36).toUpperCase()}`;

    // Simulate network latency (300-800ms)
    await simulateDelay(300 + Math.random() * 500);

    // Determine submission method
    const method = authRequest.submission_method || 'EDI';

    return {
        success: true,
        clearinghouse_ref: clearinghouseRef,
        submission_method: method,
        x12_278_request: x12Request,
        submitted_at: new Date().toISOString(),
        estimated_response_hours: authRequest.turnaround_hours || 72,
        message: method === 'EDI'
            ? `X12 278 submitted via clearinghouse (${clearinghouseRef})`
            : `Submission queued for ${authRequest.payer_name} portal`
    };
}

/**
 * FR-08: Poll payer for authorization status
 * Simulates real-time status check with probabilistic outcomes
 * @param {Object} authorization - Current authorization record
 * @returns {Promise<Object>} - Updated status from payer
 */
export async function pollPayerStatus(authorization) {
    // Simulate polling delay (500-1500ms)
    await simulateDelay(500 + Math.random() * 1000);

    // If auth is still PENDING, simulate payer decision
    if (authorization.status === 'PENDING') {
        // Calculate time since submission
        const submittedAt = new Date(authorization.submitted_at);
        const hoursSinceSubmission = (Date.now() - submittedAt) / (1000 * 60 * 60);
        const turnaround = authorization.turnaround_hours || 72;

        // Probability of decision increases with time
        const decisionProbability = Math.min(hoursSinceSubmission / turnaround, 0.95);

        if (Math.random() < decisionProbability) {
            // Payer has made a decision
            const decision = generatePayerDecision(authorization);
            return {
                status_changed: true,
                ...decision
            };
        }

        return {
            status_changed: false,
            current_status: 'PENDING',
            message: 'Awaiting payer decision',
            estimated_completion: new Date(submittedAt.getTime() + turnaround * 60 * 60 * 1000).toISOString()
        };
    }

    return {
        status_changed: false,
        current_status: authorization.status,
        message: `Authorization is in ${authorization.status} state`
    };
}

/**
 * Generate a simulated payer decision
 * Spec: 70% approve, 15% deny, 10% partial, 5% still pending
 */
function generatePayerDecision(authorization) {
    const rand = Math.random();
    const authNumber = `AUTH-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const unitsRequested = authorization.units_requested || 1;

    if (rand < 0.70) {
        // Full approval (70%)
        return {
            decision: 'APPROVED',
            auth_number: authNumber,
            units_approved: unitsRequested,
            message: 'Authorization approved',
            decided_at: new Date().toISOString()
        };
    } else if (rand < 0.80) {
        // Partial approval (10%)  — FR-14
        const approvedUnits = Math.max(1, Math.floor(unitsRequested * (0.3 + Math.random() * 0.5)));
        return {
            decision: 'APPROVED',
            auth_number: authNumber,
            units_approved: approvedUnits,
            is_partial: true,
            message: `Partial approval: ${approvedUnits} of ${unitsRequested} units approved`,
            decided_at: new Date().toISOString()
        };
    } else if (rand < 0.95) {
        // Denial (15%)
        const denialReasons = [
            { code: '72', reason: 'Insufficient clinical documentation' },
            { code: '15', reason: 'Authorization/Referral not on file' },
            { code: '96', reason: 'Service not covered under patient benefit plan' },
            { code: 'T5', reason: 'Medical necessity not established' },
            { code: '197', reason: 'Precertification/authorization/notification absent' }
        ];
        const denial = denialReasons[Math.floor(Math.random() * denialReasons.length)];
        return {
            decision: 'DENIED',
            denial_code: denial.code,
            denial_reason: denial.reason,
            message: `Authorization denied: ${denial.reason}`,
            decided_at: new Date().toISOString()
        };
    } else {
        // Still pending (5%)
        return {
            decision: 'PENDING',
            message: 'Payer requires additional review time',
            decided_at: null
        };
    }
}

// =====================================================
// BULK SUBMISSION (FR-05)
// =====================================================

/**
 * FR-05: Bulk authorization submission for multi-service orders
 * @param {Object[]} authRequests - Array of authorization requests
 * @returns {Promise<Object[]>} - Array of submission results
 */
export async function submitBulkToPayer(authRequests) {
    const results = [];

    for (const request of authRequests) {
        try {
            const result = await submitToPayer(request);
            results.push({ ...result, auth_id: request.auth_id });
        } catch (error) {
            results.push({
                success: false,
                auth_id: request.auth_id,
                error: error.message
            });
        }
    }

    return {
        total: authRequests.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    };
}

// =====================================================
// APPEAL SUPPORT (FR-11, FR-12, FR-13)
// =====================================================

/**
 * FR-12: Schedule peer-to-peer review with payer
 * @param {Object} authorization - Denied authorization
 * @param {Object} options - { preferredDate, notes }
 * @returns {Promise<Object>}
 */
export async function schedulePeerToPeer(authorization, options = {}) {
    await simulateDelay(500);

    const scheduledDate = options.preferredDate
        ? new Date(options.preferredDate)
        : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    return {
        success: true,
        scheduled_at: scheduledDate.toISOString(),
        payer_name: authorization.payer_name,
        auth_id: authorization.auth_id,
        conference_details: {
            type: 'phone',
            number: '1-800-555-0199',
            extension: Math.floor(1000 + Math.random() * 9000).toString(),
            reference: `P2P-${Date.now().toString(36).toUpperCase()}`
        },
        message: `Peer-to-peer review scheduled for ${scheduledDate.toLocaleString()}`
    };
}

// =====================================================
// PORTAL SCREENSHOT PROOF (FR-07)
// =====================================================

/**
 * FR-07: Generate portal submission proof (mock)
 * @param {Object} authorization - Authorization that was submitted via portal
 * @returns {Object} - Screenshot proof metadata
 */
export function generatePortalProof(authorization) {
    return {
        proof_type: 'portal_screenshot',
        portal_name: `${authorization.payer_name} Provider Portal`,
        captured_at: new Date().toISOString(),
        confirmation_number: `PORTAL-${Date.now().toString(36).toUpperCase()}`,
        submitted_by: authorization.created_by,
        notes: `Auth request submitted via ${authorization.payer_name} provider portal. Confirmation captured.`
    };
}

// =====================================================
// HELPERS
// =====================================================

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =====================================================
// EXPORT
// =====================================================

export default {
    generateX12_278Request,
    parseX12_278Response,
    submitToPayer,
    pollPayerStatus,
    submitBulkToPayer,
    schedulePeerToPeer,
    generatePortalProof
};
