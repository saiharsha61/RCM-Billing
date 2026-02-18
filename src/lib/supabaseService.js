/**
 * Supabase Data Service Layer
 * Phase J: Backend Integration
 * 
 * Provides CRUD operations for all RCM entities.
 * Falls back to mockData.js when Supabase is not configured.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';
import mockData from './mockData';

// =====================================================
// HELPER: Determine if we use live DB or mock data
// =====================================================
function useLiveDB() {
    return isSupabaseConfigured();
}

// =====================================================
// PROVIDERS
// =====================================================

export async function getProviders(filters = {}) {
    if (!useLiveDB()) {
        let results = [...(mockData.providers || []), ...(mockData.woundCareProviders || [])];
        if (filters.specialty) {
            results = results.filter(p => p.SpecialtyType === filters.specialty || p.specialty_type === filters.specialty);
        }
        return { data: results, error: null };
    }

    let query = supabase.from('providers').select('*').eq('is_active', true);
    if (filters.specialty) query = query.eq('specialty_type', filters.specialty);
    return await query.order('last_name');
}

export async function getProviderById(id) {
    if (!useLiveDB()) {
        const all = [...(mockData.providers || []), ...(mockData.woundCareProviders || [])];
        const provider = all.find(p => p.ProviderID === id || p.provider_id === id);
        return { data: provider || null, error: provider ? null : 'Not found' };
    }

    return await supabase.from('providers').select('*').eq('provider_id', id).single();
}

// =====================================================
// PATIENTS
// =====================================================

export async function getPatients(search = '', page = 1, pageSize = 25) {
    if (!useLiveDB()) {
        let results = [mockData.pedroSuarezPatient, ...(mockData.patients || [])].filter(Boolean);
        if (search) {
            const s = search.toLowerCase();
            results = results.filter(p =>
                (p.LastName || p.last_name || '').toLowerCase().includes(s) ||
                (p.FirstName || p.first_name || '').toLowerCase().includes(s) ||
                (p.AccountNo || p.account_no || '').toLowerCase().includes(s)
            );
        }
        return { data: results, count: results.length, error: null };
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(from, to)
        .order('last_name');

    if (search) {
        query = query.or(`last_name.ilike.%${search}%,first_name.ilike.%${search}%,account_no.ilike.%${search}%`);
    }

    return await query;
}

export async function getPatientById(id) {
    if (!useLiveDB()) {
        const all = [mockData.pedroSuarezPatient, ...(mockData.patients || [])].filter(Boolean);
        const patient = all.find(p => p.PatientID === id || p.patient_id === id);
        return { data: patient || null, error: patient ? null : 'Not found' };
    }

    return await supabase.from('patients').select(`
        *,
        guarantors(*),
        patient_insurance(*),
        pcp:providers!patients_pcp_provider_id_fkey(first_name, last_name, credentials)
    `).eq('patient_id', id).single();
}

export async function createPatient(patientData) {
    if (!useLiveDB()) {
        const newPatient = { ...patientData, patient_id: Date.now(), account_no: `MRN-${Date.now()}` };
        return { data: newPatient, error: null };
    }

    return await supabase.from('patients').insert(patientData).select().single();
}

export async function updatePatient(id, updates) {
    if (!useLiveDB()) {
        return { data: { patient_id: id, ...updates }, error: null };
    }

    return await supabase
        .from('patients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('patient_id', id)
        .select()
        .single();
}

// =====================================================
// ENCOUNTERS / APPOINTMENTS
// =====================================================

export async function getEncounters(filters = {}) {
    if (!useLiveDB()) {
        return { data: mockData.encounters || [], error: null };
    }

    let query = supabase.from('encounters').select(`
        *,
        patient:patients(first_name, last_name, account_no, phone_home),
        provider:providers(first_name, last_name, credentials)
    `);

    if (filters.providerId) query = query.eq('provider_id', filters.providerId);
    if (filters.date) query = query.eq('encounter_date', filters.date);
    if (filters.status) query = query.eq('status', filters.status);

    return await query.order('encounter_date', { ascending: false }).order('start_time');
}

export async function createEncounter(encounterData) {
    if (!useLiveDB()) {
        return { data: { encounter_id: Date.now(), ...encounterData }, error: null };
    }

    return await supabase.from('encounters').insert(encounterData).select().single();
}

export async function updateEncounter(id, updates) {
    if (!useLiveDB()) {
        return { data: { encounter_id: id, ...updates }, error: null };
    }

    return await supabase
        .from('encounters')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('encounter_id', id)
        .select()
        .single();
}

// =====================================================
// CLAIMS
// =====================================================

export async function getClaims(filters = {}) {
    if (!useLiveDB()) {
        let results = mockData.claims || [];
        if (filters.status) {
            results = results.filter(c => c.status === filters.status);
        }
        return { data: results, error: null };
    }

    let query = supabase.from('claims').select(`
        *,
        patient:patients(first_name, last_name, account_no),
        provider:providers(first_name, last_name, npi)
    `);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters.dateFrom) query = query.gte('service_date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('service_date', filters.dateTo);

    return await query.order('created_at', { ascending: false });
}

export async function getClaimById(id) {
    if (!useLiveDB()) {
        const claim = (mockData.claims || []).find(c => c.claim_id === id);
        return { data: claim || null, error: claim ? null : 'Not found' };
    }

    return await supabase.from('claims').select(`
        *,
        patient:patients(first_name, last_name, account_no, date_of_birth, gender),
        provider:providers(first_name, last_name, npi, credentials),
        claim_line_items(*),
        denials(*)
    `).eq('claim_id', id).single();
}

export async function createClaim(claimData) {
    if (!useLiveDB()) {
        return { data: { claim_id: Date.now(), claim_number: `CLM-${Date.now()}`, ...claimData }, error: null };
    }

    const claimNumber = `CLM-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    return await supabase
        .from('claims')
        .insert({ ...claimData, claim_number: claimNumber })
        .select()
        .single();
}

export async function updateClaimStatus(id, status) {
    if (!useLiveDB()) {
        return { data: { claim_id: id, status }, error: null };
    }

    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'submitted') updates.submitted_at = new Date().toISOString();

    return await supabase.from('claims').update(updates).eq('claim_id', id).select().single();
}

// =====================================================
// INSURANCE
// =====================================================

export async function getPatientInsurance(patientId) {
    if (!useLiveDB()) {
        const ins = (mockData.insurances || []).filter(i => i.patient_id === patientId);
        return { data: ins, error: null };
    }

    return await supabase
        .from('patient_insurance')
        .select('*')
        .eq('patient_id', patientId)
        .order('insurance_order');
}

export async function upsertInsurance(patientId, insuranceData) {
    if (!useLiveDB()) {
        return { data: { insurance_id: Date.now(), ...insuranceData }, error: null };
    }

    return await supabase
        .from('patient_insurance')
        .upsert({ ...insuranceData, patient_id: patientId, updated_at: new Date().toISOString() })
        .select()
        .single();
}

// =====================================================
// PAYMENTS
// =====================================================

export async function getPayments(filters = {}) {
    if (!useLiveDB()) {
        return { data: mockData.payments || [], error: null };
    }

    let query = supabase.from('payments').select(`
        *,
        claim:claims(claim_number, payer_name),
        patient:patients(first_name, last_name)
    `);

    if (filters.claimId) query = query.eq('claim_id', filters.claimId);
    if (filters.patientId) query = query.eq('patient_id', filters.patientId);

    return await query.order('payment_date', { ascending: false });
}

export async function postPayment(paymentData) {
    if (!useLiveDB()) {
        return { data: { payment_id: Date.now(), ...paymentData }, error: null };
    }

    return await supabase.from('payments').insert(paymentData).select().single();
}

// =====================================================
// DENIALS
// =====================================================

export async function getDenials(filters = {}) {
    if (!useLiveDB()) {
        return { data: mockData.denials || [], error: null };
    }

    let query = supabase.from('denials').select(`
        *,
        claim:claims(claim_number, payer_name, total_charge, patient:patients(first_name, last_name))
    `);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('denial_category', filters.category);

    return await query.order('denial_date', { ascending: false });
}

// =====================================================
// SERVICE AUTHORIZATIONS (Legacy)
// =====================================================

export async function getAuthorizations(filters = {}) {
    if (!useLiveDB()) {
        return { data: mockData.serviceAuthorizations || [], error: null };
    }

    let query = supabase.from('service_authorizations').select(`
        *,
        patient:patients(first_name, last_name, account_no),
        ordering_provider:providers!service_authorizations_ordering_provider_id_fkey(first_name, last_name),
        servicing_provider:providers!service_authorizations_servicing_provider_id_fkey(first_name, last_name)
    `);

    if (filters.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters.status) query = query.eq('status', filters.status);

    return await query.order('expiration_date');
}

// =====================================================
// AUTHORIZATIONS v2 (Phase K: Full PA Lifecycle)
// =====================================================

export async function getAuthorizationById(id) {
    if (!useLiveDB()) return { data: null, error: 'Demo mode' };
    return await supabase.from('authorizations').select('*').eq('auth_id', id).single();
}

export async function createAuthorization(authData) {
    if (!useLiveDB()) {
        return { data: { auth_id: `auth-${Date.now()}`, ...authData }, error: null };
    }
    return await supabase.from('authorizations').insert(authData).select().single();
}

export async function updateAuthorization(id, updates) {
    if (!useLiveDB()) {
        return { data: { auth_id: id, ...updates }, error: null };
    }
    return await supabase
        .from('authorizations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('auth_id', id).select().single();
}

export async function getExpiringAuths(thresholdDays = 14) {
    if (!useLiveDB()) return { data: [], error: null };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + thresholdDays);
    return await supabase
        .from('authorizations').select('*')
        .eq('status', 'APPROVED')
        .lte('expiry_date', cutoff.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date');
}

export async function getAuthAuditLog(authId) {
    if (!useLiveDB()) return { data: [], error: null };
    return await supabase
        .from('authorization_audit_log').select('*')
        .eq('auth_id', authId)
        .order('timestamp', { ascending: false });
}

// =====================================================
// ELIGIBILITY VERIFICATION (Phase L)
// =====================================================

async function saveVerificationResult(data) {
    if (!useLiveDB()) return { data: { verification_id: `mock-${Date.now()}`, ...data }, error: null };
    return supabase.from('eligibility_verifications').insert(data).select().single();
}

async function getVerificationHistory(patientId = null, limit = 50) {
    if (!useLiveDB()) return { data: [], error: null };
    let query = supabase.from('eligibility_verifications').select('*').order('verified_at', { ascending: false }).limit(limit);
    if (patientId) query = query.eq('patient_id', patientId);
    return query;
}

// =====================================================
// ANALYTICS / DASHBOARD
// =====================================================

export async function getDashboardKPIs() {
    if (!useLiveDB()) {
        return {
            data: {
                totalClaims: (mockData.claims || []).length,
                totalPatients: (mockData.patients || []).length + 1,
                totalProviders: (mockData.providers || []).length + (mockData.woundCareProviders || []).length,
                daysInAR: 42,
                collectionRate: 93.5,
                denialRate: 7.2,
                firstPassRate: 88.5,
                totalPatientBalance: 89432
            },
            error: null
        };
    }

    // Run aggregate queries
    const [claims, patients, providers, denials] = await Promise.all([
        supabase.from('claims').select('status, total_charge, paid_amount', { count: 'exact' }),
        supabase.from('patients').select('patient_balance', { count: 'exact' }).eq('is_active', true),
        supabase.from('providers').select('*', { count: 'exact' }).eq('is_active', true),
        supabase.from('denials').select('*', { count: 'exact' }).eq('status', 'open')
    ]);

    const totalCharged = (claims.data || []).reduce((sum, c) => sum + (c.total_charge || 0), 0);
    const totalPaid = (claims.data || []).reduce((sum, c) => sum + (c.paid_amount || 0), 0);
    const totalPatientBalance = (patients.data || []).reduce((sum, p) => sum + (p.patient_balance || 0), 0);
    const deniedCount = denials.count || 0;
    const totalClaimsCount = claims.count || 1;

    return {
        data: {
            totalClaims: claims.count || 0,
            totalPatients: patients.count || 0,
            totalProviders: providers.count || 0,
            daysInAR: 42, // Would need date-based calculation
            collectionRate: totalCharged > 0 ? ((totalPaid / totalCharged) * 100).toFixed(1) : 0,
            denialRate: ((deniedCount / totalClaimsCount) * 100).toFixed(1),
            firstPassRate: (((totalClaimsCount - deniedCount) / totalClaimsCount) * 100).toFixed(1),
            totalPatientBalance: totalPatientBalance.toFixed(0)
        },
        error: null
    };
}

export async function getARAgingBuckets() {
    if (!useLiveDB()) {
        return {
            data: [
                { label: '0-30', amount: 45000, color: '#10b981' },
                { label: '31-60', amount: 28000, color: '#3b82f6' },
                { label: '61-90', amount: 15000, color: '#f59e0b' },
                { label: '91+', amount: 12000, color: '#ef4444' }
            ],
            error: null
        };
    }

    const { data: claims, error } = await supabase
        .from('claims')
        .select('service_date, total_charge, paid_amount')
        .in('status', ['submitted', 'pending']);

    if (error) return { data: [], error };

    const today = new Date();
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '91+': 0 };

    (claims || []).forEach(claim => {
        const days = Math.floor((today - new Date(claim.service_date)) / (1000 * 60 * 60 * 24));
        const outstanding = (claim.total_charge || 0) - (claim.paid_amount || 0);
        if (days <= 30) buckets['0-30'] += outstanding;
        else if (days <= 60) buckets['31-60'] += outstanding;
        else if (days <= 90) buckets['61-90'] += outstanding;
        else buckets['91+'] += outstanding;
    });

    return {
        data: [
            { label: '0-30', amount: buckets['0-30'], color: '#10b981' },
            { label: '31-60', amount: buckets['31-60'], color: '#3b82f6' },
            { label: '61-90', amount: buckets['61-90'], color: '#f59e0b' },
            { label: '91+', amount: buckets['91+'], color: '#ef4444' }
        ],
        error: null
    };
}

// =====================================================
// CONNECTION STATUS
// =====================================================

export function getDataMode() {
    return useLiveDB() ? 'live' : 'demo';
}

// =====================================================
// DEFAULT EXPORT
// =====================================================
const supabaseService = {
    // Providers
    getProviders,
    getProviderById,
    // Patients
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    // Encounters
    getEncounters,
    createEncounter,
    updateEncounter,
    // Claims
    getClaims,
    getClaimById,
    createClaim,
    updateClaimStatus,
    // Insurance
    getPatientInsurance,
    upsertInsurance,
    // Payments
    getPayments,
    postPayment,
    // Denials
    getDenials,
    // Authorizations
    getAuthorizations,
    // Authorizations v2
    getAuthorizationById,
    createAuthorization,
    updateAuthorization,
    getExpiringAuths,
    getAuthAuditLog,
    // Eligibility
    saveVerificationResult,
    getVerificationHistory,
    // Analytics
    getDashboardKPIs,
    getARAgingBuckets,
    // Status
    getDataMode
};

export default supabaseService;
