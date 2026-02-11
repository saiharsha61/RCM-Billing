/**
 * FHIR R4 Resource Builders
 * Converts internal data models to FHIR-compliant JSON resources
 * 
 * FHIR Resources Supported:
 * - Patient
 * - Observation (vitals, labs)
 * - Condition (diagnoses)
 * - MedicationRequest (prescriptions)
 * - DocumentReference (scanned documents)
 */

// =====================================================
// PATIENT RESOURCE
// =====================================================

/**
 * Build FHIR Patient resource from internal patient data
 * @param {Object} patientData - Internal patient object
 * @returns {Object} FHIR R4 Patient resource
 */
export function buildPatientResource(patientData) {
    const {
        patient_id,
        account_no,
        first_name,
        middle_name,
        last_name,
        suffix,
        date_of_birth,
        gender,
        ssn,
        address_line1,
        address_line2,
        city,
        state,
        zip,
        phone_home,
        phone_mobile,
        phone_work,
        email,
        race,
        ethnicity,
        preferred_language,
        gender_identity,
        sexual_orientation
    } = patientData;

    return {
        resourceType: 'Patient',
        id: `patient-${patient_id}`,
        identifier: [
            {
                use: 'official',
                system: 'http://hospital.example.org/mrn',
                value: account_no
            },
            ssn && {
                use: 'official',
                system: 'http://hl7.org/fhir/sid/us-ssn',
                value: ssn
            }
        ].filter(Boolean),
        active: true,
        name: [
            {
                use: 'official',
                family: last_name,
                given: [first_name, middle_name].filter(Boolean),
                suffix: suffix ? [suffix] : undefined
            }
        ],
        telecom: [
            phone_home && {
                system: 'phone',
                value: phone_home,
                use: 'home'
            },
            phone_mobile && {
                system: 'phone',
                value: phone_mobile,
                use: 'mobile'
            },
            phone_work && {
                system: 'phone',
                value: phone_work,
                use: 'work'
            },
            email && {
                system: 'email',
                value: email
            }
        ].filter(Boolean),
        gender: gender ? gender.toLowerCase() : undefined,
        birthDate: date_of_birth,
        address: [
            {
                use: 'home',
                line: [address_line1, address_line2].filter(Boolean),
                city: city,
                state: state,
                postalCode: zip,
                country: 'US'
            }
        ],
        extension: [
            race && {
                url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
                valueCodeableConcept: {
                    text: race
                }
            },
            ethnicity && {
                url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity',
                valueCodeableConcept: {
                    text: ethnicity
                }
            },
            gender_identity && {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-genderIdentity',
                valueCodeableConcept: {
                    text: gender_identity
                }
            }
        ].filter(Boolean),
        communication: preferred_language ? [
            {
                language: {
                    coding: [
                        {
                            system: 'urn:ietf:bcp:47',
                            code: preferred_language.toLowerCase()
                        }
                    ],
                    text: preferred_language
                },
                preferred: true
            }
        ] : undefined
    };
}

// =====================================================
// OBSERVATION RESOURCE (Vitals, Labs)
// =====================================================

/**
 * Build FHIR Observation resource from vitals data
 * @param {Object} vitalData - Internal vital signs object
 * @param {Object} patientData - Patient reference
 * @returns {Object} FHIR R4 Observation resource
 */
export function buildObservationResource(vitalData, patientData) {
    const {
        vital_id,
        patient_id,
        encounter_id,
        recorded_at,
        height_inches,
        weight_lbs,
        bmi,
        temperature_f,
        bp_systolic,
        bp_diastolic,
        pulse_rate,
        respiratory_rate,
        oxygen_saturation,
        pain_scale
    } = vitalData;

    // Blood Pressure Panel
    if (bp_systolic && bp_diastolic) {
        return {
            resourceType: 'Observation',
            id: `obs-bp-${vital_id}`,
            status: 'final',
            category: [
                {
                    coding: [
                        {
                            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                            code: 'vital-signs',
                            display: 'Vital Signs'
                        }
                    ]
                }
            ],
            code: {
                coding: [
                    {
                        system: 'http://loinc.org',
                        code: '85354-9',
                        display: 'Blood pressure panel with all children optional'
                    }
                ],
                text: 'Blood Pressure'
            },
            subject: {
                reference: `Patient/patient-${patient_id}`,
                display: `${patientData.first_name} ${patientData.last_name}`
            },
            encounter: encounter_id ? {
                reference: `Encounter/encounter-${encounter_id}`
            } : undefined,
            effectiveDateTime: recorded_at,
            component: [
                {
                    code: {
                        coding: [
                            {
                                system: 'http://loinc.org',
                                code: '8480-6',
                                display: 'Systolic blood pressure'
                            }
                        ]
                    },
                    valueQuantity: {
                        value: bp_systolic,
                        unit: 'mmHg',
                        system: 'http://unitsofmeasure.org',
                        code: 'mm[Hg]'
                    }
                },
                {
                    code: {
                        coding: [
                            {
                                system: 'http://loinc.org',
                                code: '8462-4',
                                display: 'Diastolic blood pressure'
                            }
                        ]
                    },
                    valueQuantity: {
                        value: bp_diastolic,
                        unit: 'mmHg',
                        system: 'http://unitsofmeasure.org',
                        code: 'mm[Hg]'
                    }
                }
            ]
        };
    }

    // Individual vital sign observations
    const observations = [];

    if (pulse_rate) {
        observations.push({
            resourceType: 'Observation',
            id: `obs-pulse-${vital_id}`,
            status: 'final',
            category: [
                {
                    coding: [
                        {
                            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                            code: 'vital-signs'
                        }
                    ]
                }
            ],
            code: {
                coding: [
                    {
                        system: 'http://loinc.org',
                        code: '8867-4',
                        display: 'Heart rate'
                    }
                ]
            },
            subject: {
                reference: `Patient/patient-${patient_id}`
            },
            effectiveDateTime: recorded_at,
            valueQuantity: {
                value: pulse_rate,
                unit: 'beats/min',
                system: 'http://unitsofmeasure.org',
                code: '/min'
            }
        });
    }

    if (oxygen_saturation) {
        observations.push({
            resourceType: 'Observation',
            id: `obs-spo2-${vital_id}`,
            status: 'final',
            category: [
                {
                    coding: [
                        {
                            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                            code: 'vital-signs'
                        }
                    ]
                }
            ],
            code: {
                coding: [
                    {
                        system: 'http://loinc.org',
                        code: '59408-5',
                        display: 'Oxygen saturation in Arterial blood by Pulse oximetry'
                    }
                ]
            },
            subject: {
                reference: `Patient/patient-${patient_id}`
            },
            effectiveDateTime: recorded_at,
            valueQuantity: {
                value: oxygen_saturation,
                unit: '%',
                system: 'http://unitsofmeasure.org',
                code: '%'
            }
        });
    }

    return observations.length > 1 ? observations : observations[0];
}

// =====================================================
// CONDITION RESOURCE (Diagnoses)
// =====================================================

/**
 * Build FHIR Condition resource from diagnosis data
 * @param {Object} diagnosisData - Internal diagnosis object
 * @param {Object} patientData - Patient reference
 * @returns {Object} FHIR R4 Condition resource
 */
export function buildConditionResource(diagnosisData, patientData) {
    const {
        diagnosis_id,
        patient_id,
        encounter_id,
        icd10_code,
        description,
        is_primary,
        is_hcc,
        onset_date,
        resolved_date
    } = diagnosisData;

    return {
        resourceType: 'Condition',
        id: `condition-${diagnosis_id}`,
        clinicalStatus: {
            coding: [
                {
                    system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                    code: resolved_date ? 'resolved' : 'active'
                }
            ]
        },
        verificationStatus: {
            coding: [
                {
                    system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                    code: 'confirmed'
                }
            ]
        },
        category: [
            {
                coding: [
                    {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                        code: 'encounter-diagnosis',
                        display: 'Encounter Diagnosis'
                    }
                ]
            }
        ],
        code: {
            coding: [
                {
                    system: 'http://hl7.org/fhir/sid/icd-10-cm',
                    code: icd10_code,
                    display: description
                }
            ],
            text: description
        },
        subject: {
            reference: `Patient/patient-${patient_id}`,
            display: `${patientData.first_name} ${patientData.last_name}`
        },
        encounter: encounter_id ? {
            reference: `Encounter/encounter-${encounter_id}`
        } : undefined,
        onsetDateTime: onset_date,
        abatementDateTime: resolved_date,
        extension: is_hcc ? [
            {
                url: 'http://hospital.example.org/fhir/StructureDefinition/hcc-flag',
                valueBoolean: true
            }
        ] : undefined
    };
}

// =====================================================
// MEDICATIONREQUEST RESOURCE (Prescriptions)
// =====================================================

/**
 * Build FHIR MedicationRequest resource from medication data
 * @param {Object} medicationData - Internal medication object
 * @param {Object} patientData - Patient reference
 * @returns {Object} FHIR R4 MedicationRequest resource
 */
export function buildMedicationRequestResource(medicationData, patientData) {
    const {
        medication_id,
        patient_id,
        encounter_id,
        drug_name,
        generic_name,
        ndc_code,
        rxnorm_code,
        dosage,
        dosage_form,
        route,
        frequency,
        quantity,
        refills,
        days_supply,
        sig,
        prescribing_provider_id,
        start_date,
        end_date,
        status
    } = medicationData;

    return {
        resourceType: 'MedicationRequest',
        id: `medr eq-${medication_id}`,
        status: status || 'active',
        intent: 'order',
        medicationCodeableConcept: {
            coding: [
                rxnorm_code && {
                    system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                    code: rxnorm_code,
                    display: drug_name
                },
                ndc_code && {
                    system: 'http://hl7.org/fhir/sid/ndc',
                    code: ndc_code,
                    display: drug_name
                }
            ].filter(Boolean),
            text: drug_name
        },
        subject: {
            reference: `Patient/patient-${patient_id}`,
            display: `${patientData.first_name} ${patientData.last_name}`
        },
        encounter: encounter_id ? {
            reference: `Encounter/encounter-${encounter_id}`
        } : undefined,
        authoredOn: start_date,
        requester: prescribing_provider_id ? {
            reference: `Practitioner/provider-${prescribing_provider_id}`
        } : undefined,
        dosageInstruction: [
            {
                text: sig,
                timing: {
                    code: {
                        text: frequency
                    }
                },
                route: route ? {
                    coding: [
                        {
                            system: 'http://snomed.info/sct',
                            display: route
                        }
                    ]
                } : undefined,
                doseAndRate: dosage ? [
                    {
                        doseQuantity: {
                            value: parseFloat(dosage),
                            unit: dosage_form
                        }
                    }
                ] : undefined
            }
        ],
        dispenseRequest: {
            numberOfRepeatsAllowed: refills,
            quantity: quantity ? {
                value: quantity,
                unit: dosage_form
            } : undefined,
            expectedSupplyDuration: days_supply ? {
                value: days_supply,
                unit: 'days',
                system: 'http://unitsofmeasure.org',
                code: 'd'
            } : undefined
        }
    };
}

// =====================================================
// DOCUMENTREFERENCE RESOURCE (Scanned Documents)
// =====================================================

/**
 * Build FHIR DocumentReference resource from document data
 * @param {Object} documentData - Internal document object
 * @param {Object} patientData - Patient reference
 * @returns {Object} FHIR R4 DocumentReference resource
 */
export function buildDocumentReferenceResource(documentData, patientData) {
    const {
        document_id,
        patient_id,
        encounter_id,
        file_name,
        file_type,
        file_size_bytes,
        document_type,
        document_category,
        document_date,
        description,
        ocr_text,
        uploaded_at
    } = documentData;

    return {
        resourceType: 'DocumentReference',
        id: `doc-${document_id}`,
        status: 'current',
        type: {
            coding: [
                {
                    system: 'http://loinc.org',
                    code: getDocumentTypeCode(document_type),
                    display: document_type
                }
            ],
            text: document_type
        },
        category: [
            {
                coding: [
                    {
                        system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
                        code: document_category?.toLowerCase() || 'clinical-note'
                    }
                ]
            }
        ],
        subject: {
            reference: `Patient/patient-${patient_id}`,
            display: `${patientData.first_name} ${patientData.last_name}`
        },
        date: uploaded_at,
        author: [
            {
                display: 'Electronic Record System'
            }
        ],
        description: description,
        content: [
            {
                attachment: {
                    contentType: getMimeType(file_type),
                    size: file_size_bytes,
                    title: file_name,
                    creation: document_date
                },
                format: {
                    system: 'http://ihe.net/fhir/ValueSet/IHE.FormatCode.codesystem',
                    code: 'urn:ihe:iti:xds:2017:mimeTypeSufficient',
                    display: file_type
                }
            }
        ],
        context: {
            encounter: encounter_id ? [
                {
                    reference: `Encounter/encounter-${encounter_id}`
                }
            ] : undefined
        }
    };
}

// =====================================================
// BUNDLE BUILDER
// =====================================================

/**
 * Build FHIR Bundle for search results
 * @param {Array} resources - Array of FHIR resources
 * @param {number} totalCount - Total count of matching resources
 * @param {string} type - Bundle type (searchset, collection, document)
 * @returns {Object} FHIR R4 Bundle
 */
export function buildBundleResponse(resources, totalCount, type = 'searchset') {
    return {
        resourceType: 'Bundle',
        type: type,
        total: totalCount,
        link: [
            {
                relation: 'self',
                url: 'http://localhost:5174/fhir'
            }
        ],
        entry: resources.map(resource => ({
            fullUrl: `http://localhost:5174/fhir/${resource.resourceType}/${resource.id}`,
            resource: resource,
            search: {
                mode: 'match'
            }
        }))
    };
}

// =====================================================
// OPERATIONOUTCOME BUILDER (Errors)
// =====================================================

/**
 * Build FHIR OperationOutcome for errors
 * @param {string} severity - fatal, error, warning, information
 * @param {string} code - Error code
 * @param {string} message - Human-readable message
 * @returns {Object} FHIR R4 OperationOutcome
 */
export function buildOperationOutcome(severity, code, message) {
    return {
        resourceType: 'OperationOutcome',
        issue: [
            {
                severity: severity,
                code: code,
                diagnostics: message
            }
        ]
    };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getDocumentTypeCode(documentType) {
    const typeMap = {
        'Insurance Card': '64290-0',
        'Lab Report': '11502-2',
        'Radiology Report': '68604-8',
        'Referral': '57133-1',
        'Consent Form': '64298-3',
        'Progress Note': '11506-3'
    };
    return typeMap[documentType] || '34133-9'; // Default: Summary of episode note
}

function getMimeType(fileType) {
    const mimeTypes = {
        'PDF': 'application/pdf',
        'JPG': 'image/jpeg',
        'JPEG': 'image/jpeg',
        'PNG': 'image/png',
        'TIFF': 'image/tiff',
        'DICOM': 'application/dicom'
    };
    return mimeTypes[fileType?.toUpperCase()] || 'application/octet-stream';
}

// =====================================================
// EXPORTS
// =====================================================

export const fhirResources = {
    buildPatientResource,
    buildObservationResource,
    buildConditionResource,
    buildMedicationRequestResource,
    buildDocumentReferenceResource,
    buildBundleResponse,
    buildOperationOutcome
};

export default fhirResources;
