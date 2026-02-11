/**
 * Mock FHIR R4 Server
 * Provides RESTful API endpoints for FHIR resources
 * 
 * Supported Operations:
 * - Read (GET by ID)
 * - Search (GET with query parameters)
 * - Create (POST) - mock only
 * - Update (PUT) - mock only
 * - CapabilityStatement (metadata)
 * 
 * This is a demonstration/mock server using in-memory data.
 * For production, replace with actual database queries and OAuth authentication.
 */

import { fhirResources } from './fhirResources.js';

// =====================================================
// IN-MEMORY DATA STORES
// =====================================================

// Mock data will be populated from mockData.js
let patientsStore = [];
let observationsStore = [];
let conditionsStore = [];
let medicationRequestsStore = [];
let documentReferencesStore = [];

/**
 * Initialize FHIR server with data from application
 */
export function initializeFHIRServer(appData) {
    const { patients, vitals, diagnoses, medications, documents } = appData;

    // Convert to FHIR resources
    patientsStore = patients?.map(p => fhirResources.buildPatientResource(p)) || [];

    // Build observations from vitals
    if (vitals && patients) {
        observationsStore = vitals.flatMap(v => {
            const patient = patients.find(p => p.patient_id === v.patient_id);
            if (!patient) return [];
            const obs = fhirResources.buildObservationResource(v, patient);
            return Array.isArray(obs) ? obs : [obs];
        }).filter(Boolean);
    }

    // Build conditions from diagnoses
    if (diagnoses && patients) {
        conditionsStore = diagnoses.map(d => {
            const patient = patients.find(p => p.patient_id === d.patient_id);
            return patient ? fhirResources.buildConditionResource(d, patient) : null;
        }).filter(Boolean);
    }

    // Build medication requests
    if (medications && patients) {
        medicationRequestsStore = medications.map(m => {
            const patient = patients.find(p => p.patient_id === m.patient_id);
            return patient ? fhirResources.buildMedicationRequestResource(m, patient) : null;
        }).filter(Boolean);
    }

    // Build document references
    if (documents && patients) {
        documentReferencesStore = documents.map(doc => {
            const patient = patients.find(p => p.patient_id === doc.patient_id);
            return patient ? fhirResources.buildDocumentReferenceResource(doc, patient) : null;
        }).filter(Boolean);
    }

    console.log('[FHIR Server] Initialized with:', {
        patients: patientsStore.length,
        observations: observationsStore.length,
        conditions: conditionsStore.length,
        medicationRequests: medicationRequestsStore.length,
        documentReferences: documentReferencesStore.length
    });
}

// =====================================================
// PATIENT ENDPOINTS
// =====================================================

/**
 * Read patient by ID
 * GET /fhir/Patient/:id
 */
export function readPatient(id) {
    const patient = patientsStore.find(p => p.id === id);

    if (!patient) {
        return {
            status: 404,
            body: fhirResources.buildOperationOutcome('error', 'not-found', `Patient ${id} not found`)
        };
    }

    return {
        status: 200,
        body: patient
    };
}

/**
 * Search patients
 * GET /fhir/Patient?identifier=:value&name=:value&_count=:count&_offset=:offset
 */
export function searchPatients(params = {}) {
    let results = [...patientsStore];

    // Filter by identifier (MRN)
    if (params.identifier) {
        const [system, value] = params.identifier.split('|');
        results = results.filter(p =>
            p.identifier?.some(id =>
                (!system || id.system?.includes(system)) &&
                (!value || id.value === value)
            )
        );
    }

    // Filter by name
    if (params.name) {
        const searchName = params.name.toLowerCase();
        results = results.filter(p =>
            p.name?.some(n =>
                n.family?.toLowerCase().includes(searchName) ||
                n.given?.some(g => g.toLowerCase().includes(searchName))
            )
        );
    }

    // Filter by birthdate
    if (params.birthdate) {
        results = results.filter(p => p.birthDate === params.birthdate);
    }

    // Filter by gender
    if (params.gender) {
        results = results.filter(p => p.gender === params.gender.toLowerCase());
    }

    // Pagination
    const count = parseInt(params._count) || 20;
    const offset = parseInt(params._offset) || 0;
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + count);

    return {
        status: 200,
        body: fhirResources.buildBundleResponse(paginatedResults, total)
    };
}

// =====================================================
// OBSERVATION ENDPOINTS
// =====================================================

/**
 * Read observation by ID
 * GET /fhir/Observation/:id
 */
export function readObservation(id) {
    const observation = observationsStore.find(o => o.id === id);

    if (!observation) {
        return {
            status: 404,
            body: fhirResources.buildOperationOutcome('error', 'not-found', `Observation ${id} not found`)
        };
    }

    return {
        status: 200,
        body: observation
    };
}

/**
 * Search observations
 * GET /fhir/Observation?patient=:id&category=:category&date=:date&_count=:count
 */
export function searchObservations(params = {}) {
    let results = [...observationsStore];

    // Filter by patient
    if (params.patient) {
        results = results.filter(o =>
            o.subject?.reference?.includes(params.patient)
        );
    }

    // Filter by category
    if (params.category) {
        results = results.filter(o =>
            o.category?.some(cat =>
                cat.coding?.some(c => c.code === params.category)
            )
        );
    }

    // Filter by code (LOINC)
    if (params.code) {
        results = results.filter(o =>
            o.code?.coding?.some(c => c.code === params.code)
        );
    }

    // Filter by date
    if (params.date) {
        results = results.filter(o =>
            o.effectiveDateTime?.startsWith(params.date)
        );
    }

    // Pagination
    const count = parseInt(params._count) || 20;
    const offset = parseInt(params._offset) || 0;
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + count);

    return {
        status: 200,
        body: fhirResources.buildBundleResponse(paginatedResults, total)
    };
}

// =====================================================
// CONDITION ENDPOINTS
// =====================================================

/**
 * Read condition by ID
 * GET /fhir/Condition/:id
 */
export function readCondition(id) {
    const condition = conditionsStore.find(c => c.id === id);

    if (!condition) {
        return {
            status: 404,
            body: fhirResources.buildOperationOutcome('error', 'not-found', `Condition ${id} not found`)
        };
    }

    return {
        status: 200,
        body: condition
    };
}

/**
 * Search conditions
 * GET /fhir/Condition?patient=:id&category=:category&clinical-status=:status
 */
export function searchConditions(params = {}) {
    let results = [...conditionsStore];

    // Filter by patient
    if (params.patient) {
        results = results.filter(c =>
            c.subject?.reference?.includes(params.patient)
        );
    }

    // Filter by category
    if (params.category) {
        results = results.filter(c =>
            c.category?.some(cat =>
                cat.coding?.some(code => code.code === params.category)
            )
        );
    }

    // Filter by clinical status
    if (params['clinical-status']) {
        results = results.filter(c =>
            c.clinicalStatus?.coding?.some(s => s.code === params['clinical-status'])
        );
    }

    // Filter by code (ICD-10)
    if (params.code) {
        results = results.filter(c =>
            c.code?.coding?.some(code => code.code === params.code)
        );
    }

    // Pagination
    const count = parseInt(params._count) || 20;
    const offset = parseInt(params._offset) || 0;
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + count);

    return {
        status: 200,
        body: fhirResources.buildBundleResponse(paginatedResults, total)
    };
}

// =====================================================
// MEDICATIONREQUEST ENDPOINTS
// =====================================================

/**
 * Read medication request by ID
 * GET /fhir/MedicationRequest/:id
 */
export function readMedicationRequest(id) {
    const medReq = medicationRequestsStore.find(m => m.id === id);

    if (!medReq) {
        return {
            status: 404,
            body: fhirResources.buildOperationOutcome('error', 'not-found', `MedicationRequest ${id} not found`)
        };
    }

    return {
        status: 200,
        body: medReq
    };
}

/**
 * Search medication requests
 * GET /fhir/MedicationRequest?patient=:id&status=:status&date=:date
 */
export function searchMedicationRequests(params = {}) {
    let results = [...medicationRequestsStore];

    // Filter by patient
    if (params.patient) {
        results = results.filter(m =>
            m.subject?.reference?.includes(params.patient)
        );
    }

    // Filter by status
    if (params.status) {
        results = results.filter(m => m.status === params.status);
    }

    // Filter by authoredon date
    if (params.authoredon) {
        results = results.filter(m =>
            m.authoredOn?.startsWith(params.authoredon)
        );
    }

    // Pagination
    const count = parseInt(params._count) || 20;
    const offset = parseInt(params._offset) || 0;
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + count);

    return {
        status: 200,
        body: fhirResources.buildBundleResponse(paginatedResults, total)
    };
}

// =====================================================
// DOCUMENTREFERENCE ENDPOINTS
// =====================================================

/**
 * Read document reference by ID
 * GET /fhir/DocumentReference/:id
 */
export function readDocumentReference(id) {
    const docRef = documentReferencesStore.find(d => d.id === id);

    if (!docRef) {
        return {
            status: 404,
            body: fhirResources.buildOperationOutcome('error', 'not-found', `DocumentReference ${id} not found`)
        };
    }

    return {
        status: 200,
        body: docRef
    };
}

/**
 * Search document references
 * GET /fhir/DocumentReference?patient=:id&type=:type&category=:category
 */
export function searchDocumentReferences(params = {}) {
    let results = [...documentReferencesStore];

    // Filter by patient
    if (params.patient) {
        results = results.filter(d =>
            d.subject?.reference?.includes(params.patient)
        );
    }

    // Filter by type
    if (params.type) {
        results = results.filter(d =>
            d.type?.coding?.some(t => t.code === params.type)
        );
    }

    // Filter by category
    if (params.category) {
        results = results.filter(d =>
            d.category?.some(cat =>
                cat.coding?.some(c => c.code === params.category)
            )
        );
    }

    // Pagination
    const count = parseInt(params._count) || 20;
    const offset = parseInt(params._offset) || 0;
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + count);

    return {
        status: 200,
        body: fhirResources.buildBundleResponse(paginatedResults, total)
    };
}

// =====================================================
// CAPABILITY STATEMENT (metadata)
// =====================================================

/**
 * Get FHIR CapabilityStatement
 * GET /fhir/metadata
 */
export function getCapabilityStatement() {
    return {
        status: 200,
        body: {
            resourceType: 'CapabilityStatement',
            status: 'active',
            date: new Date().toISOString(),
            kind: 'instance',
            software: {
                name: 'AI-Native RCM Platform - FHIR Server',
                version: '1.0.0'
            },
            implementation: {
                description: 'Mock FHIR R4 Server for demonstration purposes',
                url: 'http://localhost:5174/fhir'
            },
            fhirVersion: '4.0.1',
            format: ['json'],
            rest: [
                {
                    mode: 'server',
                    security: {
                        description: 'OAuth 2.0 / SMART on FHIR (mock)'
                    },
                    resource: [
                        {
                            type: 'Patient',
                            interaction: [
                                { code: 'read' },
                                { code: 'search-type' }
                            ],
                            searchParam: [
                                { name: 'identifier', type: 'token', documentation: 'Search by MRN or SSN' },
                                { name: 'name', type: 'string', documentation: 'Search by name' },
                                { name: 'birthdate', type: 'date', documentation: 'Search by date of birth' },
                                { name: 'gender', type: 'token', documentation: 'Search by gender' }
                            ]
                        },
                        {
                            type: 'Observation',
                            interaction: [
                                { code: 'read' },
                                { code: 'search-type' }
                            ],
                            searchParam: [
                                { name: 'patient', type: 'reference', documentation: 'Patient reference' },
                                { name: 'category', type: 'token', documentation: 'vital-signs, laboratory, etc.' },
                                { name: 'code', type: 'token', documentation: 'LOINC code' },
                                { name: 'date', type: 'date', documentation: 'Observation date' }
                            ]
                        },
                        {
                            type: 'Condition',
                            interaction: [
                                { code: 'read' },
                                { code: 'search-type' }
                            ],
                            searchParam: [
                                { name: 'patient', type: 'reference', documentation: 'Patient reference' },
                                { name: 'category', type: 'token', documentation: 'Condition category' },
                                { name: 'clinical-status', type: 'token', documentation: 'active, resolved, etc.' },
                                { name: 'code', type: 'token', documentation: 'ICD-10 code' }
                            ]
                        },
                        {
                            type: 'MedicationRequest',
                            interaction: [
                                { code: 'read' },
                                { code: 'search-type' }
                            ],
                            searchParam: [
                                { name: 'patient', type: 'reference', documentation: 'Patient reference' },
                                { name: 'status', type: 'token', documentation: 'active, on-hold, completed' },
                                { name: 'authoredon', type: 'date', documentation: 'Prescription date' }
                            ]
                        },
                        {
                            type: 'DocumentReference',
                            interaction: [
                                { code: 'read' },
                                { code: 'search-type' }
                            ],
                            searchParam: [
                                { name: 'patient', type: 'reference', documentation: 'Patient reference' },
                                { name: 'type', type: 'token', documentation: 'Document type (LOINC)' },
                                { name: 'category', type: 'token', documentation: 'Document category' }
                            ]
                        }
                    ]
                }
            ]
        }
    };
}

// =====================================================
// MOCK CREATE/UPDATE OPERATIONS
// =====================================================

/**
 * Create patient (mock - returns success)
 * POST /fhir/Patient
 */
export function createPatient(patientResource) {
    // In production, validate and store
    const newId = `patient-${Date.now()}`;
    patientResource.id = newId;
    patientsStore.push(patientResource);

    return {
        status: 201,
        headers: {
            'Location': `/fhir/Patient/${newId}`
        },
        body: patientResource
    };
}

/**
 * Update patient (mock - returns success)
 * PUT /fhir/Patient/:id
 */
export function updatePatient(id, patientResource) {
    const index = patientsStore.findIndex(p => p.id === id);

    if (index === -1) {
        return {
            status: 404,
            body: fhirResources.buildOperationOutcome('error', 'not-found', `Patient ${id} not found`)
        };
    }

    patientResource.id = id;
    patientsStore[index] = patientResource;

    return {
        status: 200,
        body: patientResource
    };
}

// =====================================================
// EXPORTS
// =====================================================

export const fhirServer = {
    // Initialization
    initializeFHIRServer,

    // Patient
    readPatient,
    searchPatients,
    createPatient,
    updatePatient,

    // Observation
    readObservation,
    searchObservations,

    // Condition
    readCondition,
    searchConditions,

    // MedicationRequest
    readMedicationRequest,
    searchMedicationRequests,

    // DocumentReference
    readDocumentReference,
    searchDocumentReferences,

    // Metadata
    getCapabilityStatement
};

export default fhirServer;
