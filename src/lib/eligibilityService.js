/**
 * Eligibility Verification Service
 * Phase L: Real-time eligibility checks via Stedi API
 * 
 * Dual-mode:
 *   - LIVE: When VITE_STEDI_API_KEY is set → calls Stedi REST API (X12 270/271)
 *   - MOCK: When not configured → returns realistic simulated 271 responses
 * 
 * Stedi free tier: 1,000 checks/month, 2,000+ payers
 * API docs: https://www.stedi.com/docs/eligibility
 */

// =====================================================
// CONFIG
// =====================================================
const STEDI_API_KEY = import.meta.env.VITE_STEDI_API_KEY || '';
const STEDI_ENDPOINT = 'https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3';

function isStediConfigured() {
    return STEDI_API_KEY.length > 10;
}

export function getEligibilityMode() {
    return isStediConfigured() ? 'live' : 'mock';
}

// =====================================================
// PAYER DIRECTORY (Stedi Trading Partner IDs)
// =====================================================
const PAYER_DIRECTORY = [
    { id: 'AETNA', name: 'Aetna', tradingPartnerId: '60054' },
    { id: 'BCBSTX', name: 'Blue Cross Blue Shield of Texas', tradingPartnerId: '84980' },
    { id: 'CIGNA', name: 'Cigna', tradingPartnerId: '62308' },
    { id: 'HUMANA', name: 'Humana', tradingPartnerId: '61101' },
    { id: 'MEDTX', name: 'Medicare of Texas (Novitas)', tradingPartnerId: 'CMS' },
    { id: 'MEDICAID_TX', name: 'Texas Medicaid (TMHP)', tradingPartnerId: 'SKY01' },
    { id: 'UHC', name: 'United Healthcare', tradingPartnerId: '87726' },
    { id: 'TRICARE', name: 'TRICARE', tradingPartnerId: '99726' },
    { id: 'MOLINA', name: 'Molina Healthcare', tradingPartnerId: '20934' },
    { id: 'AMBETTER', name: 'Ambetter', tradingPartnerId: '68069' },
];

export function getPayerList() {
    return PAYER_DIRECTORY;
}

export function getPayerById(payerId) {
    return PAYER_DIRECTORY.find(p => p.id === payerId) || null;
}

// =====================================================
// MAIN VERIFICATION FUNCTION
// =====================================================

/**
 * Verify patient eligibility
 * @param {Object} patient - { firstName, lastName, dateOfBirth, gender }
 * @param {Object} insurance - { memberId, payerId, payerName, subscriberNo, groupNumber }
 * @param {Object} provider - { npi, organizationName, taxId }
 * @returns {Object} - { status, coverage, benefits, plan, verifiedAt, mode, rawResponse }
 */
export async function verifyEligibility(patient, insurance, provider = {}) {
    if (isStediConfigured()) {
        return await verifyViaStedi(patient, insurance, provider);
    }
    return await verifyMock(patient, insurance);
}

// =====================================================
// STEDI LIVE API
// =====================================================

async function verifyViaStedi(patient, insurance, provider) {
    const request = buildStediRequest(patient, insurance, provider);

    try {
        const response = await fetch(STEDI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${STEDI_API_KEY}`,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Stedi API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        return parseStediResponse(data);
    } catch (error) {
        console.error('[EligibilityService] Stedi API error:', error);
        return {
            status: 'Error',
            statusColor: '#f59e0b',
            error: error.message,
            coverage: null,
            benefits: null,
            plan: null,
            verifiedAt: new Date().toISOString(),
            mode: 'live',
            rawResponse: null,
        };
    }
}

/**
 * Build Stedi-format JSON request from app data
 */
export function buildStediRequest(patient, insurance, provider) {
    const payer = PAYER_DIRECTORY.find(p => p.id === insurance.payerId);

    return {
        controlNumber: String(Date.now()).slice(-9),
        tradingPartnerServiceId: payer?.tradingPartnerId || insurance.payerId,
        provider: {
            organizationName: provider.organizationName || 'RCM Billing Practice',
            npi: provider.npi || '1234567890',
        },
        subscriber: {
            memberId: insurance.memberId || insurance.subscriberNo || '',
            firstName: patient.firstName || patient.FirstName || '',
            lastName: patient.lastName || patient.LastName || '',
            dateOfBirth: formatDOB(patient.dateOfBirth || patient.DOB || patient.dob),
            gender: (patient.gender || patient.Gender || 'U').charAt(0).toUpperCase(),
        },
        encounter: {
            serviceTypeCodes: ['30'], // Health Benefit Plan Coverage
        },
    };
}

/**
 * Parse Stedi 271 response into normalized app format
 */
export function parseStediResponse(data) {
    const planInfo = data.planInformation || {};
    const subscriber = data.subscriber || {};
    const benefits = data.benefitsInformation || [];

    // Determine coverage status
    let status = 'Pending';
    let statusColor = '#f59e0b';
    const activeBenefit = benefits.find(b =>
        b.code === '1' || b.informationCode === 'AC' ||
        (b.name && b.name.toLowerCase().includes('active'))
    );
    const inactiveBenefit = benefits.find(b =>
        b.code === '6' || b.informationCode === 'I' ||
        (b.name && b.name.toLowerCase().includes('inactive'))
    );

    if (activeBenefit) {
        status = 'Active';
        statusColor = '#10b981';
    } else if (inactiveBenefit) {
        status = 'Inactive';
        statusColor = '#ef4444';
    }

    // Extract benefit amounts
    const deductible = extractBenefitAmount(benefits, 'deductible', 'C');
    const deductibleMet = extractBenefitAmount(benefits, 'deductible', 'D') || 0;
    const oopMax = extractBenefitAmount(benefits, 'out of pocket', 'G');
    const oopMet = extractBenefitAmount(benefits, 'out of pocket', 'D') || 0;
    const copay = extractBenefitAmount(benefits, 'co-payment', 'B') ||
        extractBenefitAmount(benefits, 'copay', 'B');
    const specialistCopay = extractBenefitAmountByService(benefits, 'co-payment', '98');
    const coinsurance = extractCoinsurance(benefits);

    return {
        status,
        statusColor,
        error: null,
        coverage: {
            type: planInfo.planCoverageDescription || 'Medical',
            network: detectNetwork(benefits) || 'IN-NETWORK',
            effectiveDate: planInfo.planBeginDate || subscriber.dateOfBirth || null,
            terminationDate: planInfo.planEndDate || null,
        },
        benefits: {
            deductible: deductible,
            deductible_met: deductibleMet,
            deductible_remaining: deductible ? deductible - deductibleMet : null,
            max_out_of_pocket: oopMax,
            out_of_pocket_met: oopMet,
            oop_remaining: oopMax ? oopMax - oopMet : null,
            copay: copay,
            specialist_copay: specialistCopay || copay,
            coinsurance: coinsurance,
            network_type: detectNetwork(benefits) || 'IN-NETWORK',
            deductible_coverage_type: 'INDIVIDUAL',
        },
        plan: {
            name: planInfo.planCoverageDescription || 'Unknown Plan',
            groupNumber: planInfo.groupNumber || subscriber.groupNumber || 'N/A',
            planNumber: planInfo.planNumber || null,
        },
        verifiedAt: new Date().toISOString(),
        mode: 'live',
        rawResponse: data,
    };
}

// =====================================================
// MOCK VERIFICATION (Demo Mode)
// =====================================================

async function verifyMock(patient, insurance) {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const firstName = patient.firstName || patient.FirstName || 'Unknown';
    const lastName = patient.lastName || patient.LastName || 'Unknown';
    const payerName = insurance?.payerName || insurance?.payer_name || 'Unknown Payer';

    // Probabilistic outcome: 80% active, 10% inactive, 10% pending
    const roll = Math.random();
    let status, statusColor;
    if (roll < 0.80) {
        status = 'Active';
        statusColor = '#10b981';
    } else if (roll < 0.90) {
        status = 'Inactive';
        statusColor = '#ef4444';
    } else {
        status = 'Pending';
        statusColor = '#f59e0b';
    }

    // Generate realistic benefit amounts
    const planType = selectMockPlan(payerName);
    const deductible = planType.deductible;
    const deductibleMet = Math.round(deductible * (0.2 + Math.random() * 0.6));

    return {
        status,
        statusColor,
        error: null,
        coverage: {
            type: planType.name,
            network: 'IN-NETWORK',
            effectiveDate: '2025-01-01',
            terminationDate: null,
        },
        benefits: {
            deductible: deductible,
            deductible_met: deductibleMet,
            deductible_remaining: deductible - deductibleMet,
            max_out_of_pocket: planType.oopMax,
            out_of_pocket_met: Math.round(planType.oopMax * (0.1 + Math.random() * 0.4)),
            oop_remaining: null, // calculated in UI
            copay: planType.copay,
            specialist_copay: planType.specialistCopay,
            coinsurance: planType.coinsurance,
            network_type: 'IN-NETWORK',
            deductible_coverage_type: 'INDIVIDUAL',
        },
        plan: {
            name: planType.name,
            groupNumber: `GRP-${Math.floor(10000 + Math.random() * 90000)}`,
            planNumber: null,
        },
        verifiedAt: new Date().toISOString(),
        mode: 'mock',
        rawResponse: {
            mock: true,
            patient: `${firstName} ${lastName}`,
            payer: payerName,
            transactionId: `MOCK-${Date.now()}`,
            note: 'This is a simulated 271 response. Connect Stedi API for real payer data.',
        },
    };
}

function selectMockPlan(payerName) {
    const plans = {
        'Medicare': { name: 'Medicare Part B', deductible: 240, oopMax: 0, copay: 0, specialistCopay: 0, coinsurance: 80 },
        'Medicaid': { name: 'Medicaid', deductible: 0, oopMax: 0, copay: 3, specialistCopay: 5, coinsurance: 100 },
        'Aetna': { name: 'Aetna Choice POS II', deductible: 1500, oopMax: 6000, copay: 25, specialistCopay: 50, coinsurance: 80 },
        'BCBS': { name: 'BCBS Blue Advantage HMO', deductible: 2000, oopMax: 7500, copay: 30, specialistCopay: 60, coinsurance: 80 },
        'United': { name: 'UHC Choice Plus PPO', deductible: 1750, oopMax: 8000, copay: 20, specialistCopay: 40, coinsurance: 80 },
        'Cigna': { name: 'Cigna Open Access Plus', deductible: 1500, oopMax: 6500, copay: 25, specialistCopay: 50, coinsurance: 80 },
        'Humana': { name: 'Humana Gold Plus HMO', deductible: 1000, oopMax: 5000, copay: 15, specialistCopay: 35, coinsurance: 80 },
    };

    const key = Object.keys(plans).find(k => payerName.toLowerCase().includes(k.toLowerCase()));
    return key ? plans[key] : { name: 'Standard PPO', deductible: 2000, oopMax: 7000, copay: 25, specialistCopay: 50, coinsurance: 80 };
}

// =====================================================
// BATCH VERIFICATION
// =====================================================

/**
 * Verify multiple patients sequentially
 * @param {Array} items - [{ patient, insurance, provider }]
 * @param {Function} onProgress - callback(index, total, result)
 * @returns {Array} - results
 */
export async function batchVerify(items, onProgress = null) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
        const { patient, insurance, provider } = items[i];
        const result = await verifyEligibility(patient, insurance, provider);
        results.push({ patient, insurance, result });
        if (onProgress) onProgress(i + 1, items.length, result);
    }
    return results;
}

// =====================================================
// HELPERS
// =====================================================

function formatDOB(dob) {
    if (!dob) return '';
    // Handle various formats: "1985-03-15", "03/15/1985", "Mar 15, 1985"
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function extractBenefitAmount(benefits, keyword, codeFilter) {
    const match = benefits.find(b => {
        const nameMatch = b.name && b.name.toLowerCase().includes(keyword.toLowerCase());
        const codeMatch = !codeFilter || b.timeQualifierCode === codeFilter || b.code === codeFilter;
        return nameMatch && codeMatch;
    });
    return match?.benefitAmount ? parseFloat(match.benefitAmount) : null;
}

function extractBenefitAmountByService(benefits, keyword, serviceCode) {
    const match = benefits.find(b => {
        const nameMatch = b.name && b.name.toLowerCase().includes(keyword.toLowerCase());
        const serviceMatch = b.serviceTypeCodes && b.serviceTypeCodes.includes(serviceCode);
        return nameMatch && serviceMatch;
    });
    return match?.benefitAmount ? parseFloat(match.benefitAmount) : null;
}

function extractCoinsurance(benefits) {
    const match = benefits.find(b =>
        b.name && b.name.toLowerCase().includes('co-insurance') && b.benefitPercent
    );
    return match ? parseFloat(match.benefitPercent) : 80;
}

function detectNetwork(benefits) {
    const inNetwork = benefits.find(b => b.inPlanNetworkIndicator === 'Y' || b.inPlanNetworkIndicatorCode === 'Y');
    const outNetwork = benefits.find(b => b.inPlanNetworkIndicator === 'N' || b.inPlanNetworkIndicatorCode === 'N');
    if (inNetwork) return 'IN-NETWORK';
    if (outNetwork) return 'OUT-OF-NETWORK';
    return null;
}

export default {
    verifyEligibility,
    batchVerify,
    getPayerList,
    getPayerById,
    getEligibilityMode,
    buildStediRequest,
    parseStediResponse,
};
