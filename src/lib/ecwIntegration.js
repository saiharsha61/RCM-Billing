/**
 * eCW Integration Layer
 * Phase M: Bridge between eClinicalWorks and our SaaS Plugin
 *
 * Dual-mode:
 *   - LIVE: When VITE_ECW_API_URL + VITE_ECW_API_KEY set → calls eCW FHIR R4 API
 *   - MOCK: Returns realistic mock data mirroring eCW's data format
 *
 * This layer handles:
 *   - Fetching upcoming appointments from eCW
 *   - Fetching patient demographics and insurance
 *   - Writing back eligibility results and PA status
 */

// =====================================================
// CONFIG
// =====================================================
const ECW_API_URL = import.meta.env.VITE_ECW_API_URL || '';
const ECW_API_KEY = import.meta.env.VITE_ECW_API_KEY || '';

function isECWConfigured() {
    return ECW_API_URL.length > 10 && ECW_API_KEY.length > 5;
}

export function getECWConnectionStatus() {
    if (isECWConfigured()) {
        return { connected: true, mode: 'live', label: '🟢 eCW Connected', url: ECW_API_URL };
    }
    return { connected: false, mode: 'mock', label: '🟡 Demo Mode (Mock eCW Data)', url: null };
}

// =====================================================
// MOCK eCW DATA (mirrors real eCW data format)
// =====================================================

const MOCK_PROVIDERS = [
    { id: 'prov-001', name: 'Dr. Farias-Jimenez', npi: '1234567890', specialty: 'Wound Care' },
    { id: 'prov-002', name: 'Dr. Garza Jr', npi: '2345678901', specialty: 'Wound Care' },
    { id: 'prov-003', name: 'Dr. Morales', npi: '3456789012', specialty: 'Wound Care' },
    { id: 'prov-004', name: 'Dr. Reyes', npi: '4567890123', specialty: 'Wound Care' },
];

const MOCK_APPOINTMENTS = (() => {
    const now = new Date();
    const patients = [
        { patientId: 0, firstName: 'Pedro', lastName: 'Suarez', dob: '1974-06-23', gender: 'M', accountNo: '9609', memberId: '1EG4TE5MK73', payerId: 'MEDTX', payerName: 'Medicare of Texas' },
        { patientId: 1, firstName: 'Roberto', lastName: 'Martinez', dob: '1965-03-12', gender: 'M', accountNo: '5847', memberId: '2AB7KL9PQ12', payerId: 'MEDTX', payerName: 'Medicare of Texas' },
        { patientId: 2, firstName: 'Maria', lastName: 'Gonzalez', dob: '1958-11-05', gender: 'F', accountNo: '3291', memberId: 'BCX445221', payerId: 'BCBSTX', payerName: 'Blue Cross Blue Shield TX' },
        { patientId: 3, firstName: 'Carreon', lastName: 'Jose', dob: '1972-08-19', gender: 'M', accountNo: '7823', memberId: 'AET987654', payerId: 'AETNA', payerName: 'Aetna' },
        { patientId: 4, firstName: 'Ana', lastName: 'Delgado', dob: '1980-02-14', gender: 'F', accountNo: '6134', memberId: 'UHC112233', payerId: 'UHC', payerName: 'United Healthcare' },
        { patientId: 5, firstName: 'Luis', lastName: 'Hernandez', dob: '1969-09-30', gender: 'M', accountNo: '8456', memberId: 'HUM556677', payerId: 'HUMANA', payerName: 'Humana' },
        { patientId: 6, firstName: 'Carmen', lastName: 'Rivera', dob: '1955-12-08', gender: 'F', accountNo: '2108', memberId: '3CD8QW2MK55', payerId: 'MEDTX', payerName: 'Medicare of Texas' },
        { patientId: 7, firstName: 'Jorge', lastName: 'Salinas', dob: '1977-04-22', gender: 'M', accountNo: '9301', memberId: 'CIG334455', payerId: 'CIGNA', payerName: 'Cigna' },
    ];

    return patients.map((p, i) => {
        // Spread appointments across next 3 days
        const apptDate = new Date(now);
        apptDate.setDate(apptDate.getDate() + (i % 3) + 1);
        apptDate.setHours(8 + (i * 2) % 8, (i % 4) * 15, 0, 0);

        return {
            appointmentId: `appt-${1000 + i}`,
            ...p,
            appointmentDate: apptDate.toISOString(),
            visitType: i % 3 === 0 ? 'WOUND' : i % 3 === 1 ? 'FOLLOW-UP' : 'CHK',
            duration: 15,
            provider: MOCK_PROVIDERS[i % MOCK_PROVIDERS.length],
            facility: 'Wound Care Clinic - Mission, TX',
            status: 'Scheduled',
            eligibilityVerified: false,
            authorizationStatus: null,
            cptCodes: i % 2 === 0 ? ['97597', '97598'] : ['99213'],
        };
    });
})();

// =====================================================
// FETCH FUNCTIONS
// =====================================================

/**
 * Get upcoming appointments from eCW
 * @param {number} daysAhead - how many days ahead to look (default 3)
 * @returns {Array} appointments with patient + insurance + provider data
 */
export async function getUpcomingAppointments(daysAhead = 3) {
    if (isECWConfigured()) {
        return await fetchECWFHIR(`/Appointment?date=ge${todayISO()}&date=le${futureISO(daysAhead)}&_count=100`);
    }

    // Mock: return appointments within the window
    await delay(300);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);
    return MOCK_APPOINTMENTS.filter(a => new Date(a.appointmentDate) <= cutoff);
}

/**
 * Get appointments needing eligibility verification (T-48h window)
 */
export async function getT48hQueue() {
    const appts = await getUpcomingAppointments(3);
    const now = new Date();
    const t48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return appts.filter(a => {
        const apptDate = new Date(a.appointmentDate);
        return apptDate <= t48h && !a.eligibilityVerified;
    });
}

/**
 * Get patient demographics from eCW
 */
export async function getPatientDemographics(patientId) {
    if (isECWConfigured()) {
        return await fetchECWFHIR(`/Patient/${patientId}`);
    }

    await delay(100);
    const appt = MOCK_APPOINTMENTS.find(a => a.patientId === patientId);
    if (!appt) return null;
    return {
        patientId: appt.patientId,
        firstName: appt.firstName,
        lastName: appt.lastName,
        dateOfBirth: appt.dob,
        gender: appt.gender,
        accountNo: appt.accountNo,
    };
}

/**
 * Get patient insurance from eCW
 */
export async function getPatientInsurance(patientId) {
    if (isECWConfigured()) {
        return await fetchECWFHIR(`/Coverage?beneficiary=Patient/${patientId}`);
    }

    await delay(100);
    const appt = MOCK_APPOINTMENTS.find(a => a.patientId === patientId);
    if (!appt) return null;
    return {
        memberId: appt.memberId,
        payerId: appt.payerId,
        payerName: appt.payerName,
        subscriberNo: appt.memberId,
    };
}

/**
 * Push eligibility verification result back to eCW
 */
export async function pushEligibilityResult(patientId, result) {
    if (isECWConfigured()) {
        return await postECWFHIR(`/CoverageEligibilityResponse`, {
            status: 'active',
            patient: { reference: `Patient/${patientId}` },
            outcome: result.status === 'Active' ? 'complete' : 'error',
        });
    }

    // Mock: update local state
    const appt = MOCK_APPOINTMENTS.find(a => a.patientId === patientId);
    if (appt) appt.eligibilityVerified = true;
    return { success: true, mock: true };
}

/**
 * Push PA status back to eCW
 */
export async function pushAuthStatus(authId, status) {
    if (isECWConfigured()) {
        return await postECWFHIR(`/ClaimResponse`, {
            status: status.toLowerCase(),
            identifier: [{ value: authId }],
        });
    }

    return { success: true, mock: true };
}

// =====================================================
// eCW FHIR API HELPERS
// =====================================================

async function fetchECWFHIR(path) {
    const res = await fetch(`${ECW_API_URL}${path}`, {
        headers: {
            'Authorization': `Bearer ${ECW_API_KEY}`,
            'Accept': 'application/fhir+json',
        },
    });
    if (!res.ok) throw new Error(`eCW API error: ${res.status}`);
    return await res.json();
}

async function postECWFHIR(path, body) {
    const res = await fetch(`${ECW_API_URL}${path}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ECW_API_KEY}`,
            'Content-Type': 'application/fhir+json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`eCW API error: ${res.status}`);
    return await res.json();
}

// =====================================================
// UTILS
// =====================================================

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function todayISO() { return new Date().toISOString().split('T')[0]; }
function futureISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export default {
    getECWConnectionStatus,
    getUpcomingAppointments,
    getT48hQueue,
    getPatientDemographics,
    getPatientInsurance,
    pushEligibilityResult,
    pushAuthStatus,
};
