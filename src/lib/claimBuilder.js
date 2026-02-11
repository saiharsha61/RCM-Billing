/**
 * CLAIM BUILDER UTILITY
 * Generates 837P professional claim format from encounter data
 */

/**
 * Build a complete claim object from encounter and patient data
 * @param {Object} encounter - The encounter/visit data
 * @param {Object} patient - Patient demographics
 * @param {Object} insurance - Insurance/payer information
 * @param {Object} provider - Rendering provider information
 * @returns {Object} Complete claim object ready for submission
 */
export function buildClaim(encounter, patient, insurance, provider) {
    const claim = {
        // Claim Header
        claimId: generateClaimId(),
        createdAt: new Date().toISOString(),
        status: 'Draft',

        // Box 1 - Medicare/Medicaid/etc
        payerType: determinePayerType(insurance.payerId),

        // Box 1a - Insured's ID Number
        subscriberId: insurance.memberId,

        // Box 2 - Patient's Name
        patientName: {
            lastName: patient.lastName,
            firstName: patient.firstName,
            middleName: patient.middleName || ''
        },

        // Box 3 - Patient's DOB & Sex
        patientDOB: patient.dob,
        patientSex: patient.gender,

        // Box 4 - Insured's Name (if different from patient)
        insuredName: insurance.subscriberName || {
            lastName: patient.lastName,
            firstName: patient.firstName
        },

        // Box 5 - Patient's Address
        patientAddress: {
            street: patient.address1,
            street2: patient.address2 || '',
            city: patient.city,
            state: patient.state,
            zip: patient.zip,
            phone: patient.phone
        },

        // Box 6 - Patient Relationship to Insured
        relationshipToInsured: insurance.relationship || 'Self',

        // Box 7 - Insured's Address (if different)
        insuredAddress: insurance.subscriberAddress || null,

        // Box 8 - Reserved for NUCC Use
        reserved8: null,

        // Box 9 - Other Insured's Name (for secondary)
        otherInsured: insurance.secondary || null,

        // Box 10 - Condition Related To
        conditionRelatedTo: {
            employment: encounter.workRelated || false,
            autoAccident: encounter.autoAccident || false,
            otherAccident: encounter.otherAccident || false,
            accidentState: encounter.accidentState || null
        },

        // Box 11 - Insured's Policy Group/FECA Number
        groupNumber: insurance.groupNumber,

        // Box 11a - Insured's DOB & Sex
        insuredDOB: insurance.subscriberDob || patient.dob,
        insuredSex: insurance.subscriberGender || patient.gender,

        // Box 11b - Other Claim ID
        otherClaimId: null,

        // Box 11c - Insurance Plan Name
        planName: insurance.planName,

        // Box 11d - Is There Another Health Benefit Plan?
        hasOtherPlan: !!insurance.secondary,

        // Box 12 - Patient/Authorized Signature
        patientSignature: 'Signature on File',
        patientSignatureDate: new Date().toISOString().split('T')[0],

        // Box 13 - Insured's Signature
        insuredSignature: 'Signature on File',

        // Box 14 - Date of Current Illness
        illnessDate: encounter.onsetDate || null,
        illnessQualifier: encounter.onsetQualifier || '431', // 431 = Onset of Current Symptoms

        // Box 15 - Other Date (if applicable)
        otherDate: null,

        // Box 16 - Dates Patient Unable to Work
        unableToWorkFrom: encounter.disabilityFrom || null,
        unableToWorkTo: encounter.disabilityTo || null,

        // Box 17 - Referring Provider Name
        referringProvider: encounter.referringProvider || null,

        // Box 17a - Referring Provider ID
        referringProviderNPI: encounter.referringProviderNPI || null,

        // Box 18 - Hospitalization Dates
        hospitalizationFrom: encounter.admitDate || null,
        hospitalizationTo: encounter.dischargeDate || null,

        // Box 19 - Additional Claim Information
        additionalInfo: encounter.additionalInfo || null,

        // Box 20 - Outside Lab?
        outsideLab: encounter.outsideLab || false,
        outsideLabCharges: encounter.outsideLabCharges || 0,

        // Box 21 - Diagnosis Codes (ICD-10)
        diagnoses: encounter.diagnoses.map((dx, idx) => ({
            pointer: String.fromCharCode(65 + idx), // A, B, C, D...
            code: dx.code,
            description: dx.description
        })),

        // Box 22 - Resubmission Code
        resubmissionCode: encounter.resubmissionCode || null,
        originalClaimRef: encounter.originalClaimRef || null,

        // Box 23 - Prior Authorization Number
        priorAuthNumber: encounter.authorizationNumber || null,

        // Box 24 - Service Lines
        serviceLines: encounter.procedures.map((proc, idx) => buildServiceLine(proc, idx, encounter)),

        // Box 25 - Federal Tax ID (EIN)
        federalTaxId: provider.taxId,
        taxIdType: 'EIN', // or SSN

        // Box 26 - Patient Account Number
        patientAccountNo: patient.accountNo,

        // Box 27 - Accept Assignment
        acceptAssignment: true,

        // Box 28 - Total Charge
        totalCharge: calculateTotalCharge(encounter.procedures),

        // Box 29 - Amount Paid
        amountPaid: 0,

        // Box 30 - Reserved for NUCC Use
        reserved30: null,

        // Box 31 - Signature of Provider
        providerSignature: provider.name,
        providerSignatureDate: new Date().toISOString().split('T')[0],

        // Box 32 - Service Facility Location
        serviceFacility: {
            name: provider.facilityName,
            address: provider.facilityAddress,
            npi: provider.facilityNPI
        },

        // Box 32a - Facility NPI
        facilityNPI: provider.facilityNPI,

        // Box 32b - Other ID (if applicable)
        facilityOtherId: null,

        // Box 33 - Billing Provider Info
        billingProvider: {
            name: provider.billingName || provider.name,
            address: provider.billingAddress || provider.address,
            phone: provider.phone,
            npi: provider.npi
        },

        // Box 33a - Billing Provider NPI
        billingNPI: provider.npi,

        // Box 33b - Other ID
        billingOtherId: null
    };

    return claim;
}

/**
 * Build a single service line (Box 24)
 */
function buildServiceLine(procedure, index, encounter) {
    return {
        lineNumber: index + 1,

        // 24A - Dates of Service
        fromDate: procedure.serviceDate || encounter.dateOfService,
        toDate: procedure.endDate || procedure.serviceDate || encounter.dateOfService,

        // 24B - Place of Service
        placeOfService: procedure.pos || encounter.placeOfService || '11', // 11 = Office

        // 24C - EMG (Emergency)
        emergency: procedure.emergency || false,

        // 24D - Procedures/Services/Supplies
        cptCode: procedure.code,
        modifiers: procedure.modifiers || [],

        // 24E - Diagnosis Pointer
        diagnosisPointers: procedure.diagnosisPointers || ['A'],

        // 24F - Charges
        charge: procedure.charge || procedure.fee,

        // 24G - Days or Units
        units: procedure.units || 1,

        // 24H - EPSDT Family Plan
        epsdtFamilyPlan: null,

        // 24I - ID Qualifier (for non-NPI)
        idQualifier: null,

        // 24J - Rendering Provider ID
        renderingProviderId: procedure.renderingProviderNPI || encounter.providerNPI,

        // NDC for Injectables (if applicable)
        ndc: procedure.ndc || null,
        ndcQualifier: procedure.ndc ? 'N4' : null, // N4 = NDC
        ndcQuantity: procedure.ndcQuantity || null,
        ndcUnit: procedure.ndcUnit || null
    };
}

/**
 * Validate a claim before submission
 */
export function validateClaim(claim) {
    const errors = [];
    const warnings = [];

    // Required field validations
    if (!claim.subscriberId) {
        errors.push({ field: 'subscriberId', message: 'Member ID is required (Box 1a)' });
    }

    if (!claim.patientName?.lastName || !claim.patientName?.firstName) {
        errors.push({ field: 'patientName', message: 'Patient name is required (Box 2)' });
    }

    if (!claim.patientDOB) {
        errors.push({ field: 'patientDOB', message: 'Patient DOB is required (Box 3)' });
    }

    if (!claim.patientSex) {
        errors.push({ field: 'patientSex', message: 'Patient sex is required (Box 3)' });
    }

    if (!claim.diagnoses || claim.diagnoses.length === 0) {
        errors.push({ field: 'diagnoses', message: 'At least one diagnosis is required (Box 21)' });
    }

    if (!claim.serviceLines || claim.serviceLines.length === 0) {
        errors.push({ field: 'serviceLines', message: 'At least one service line is required (Box 24)' });
    }

    // Service line validations
    claim.serviceLines?.forEach((line, idx) => {
        if (!line.cptCode) {
            errors.push({ field: `serviceLine${idx + 1}.cptCode`, message: `Line ${idx + 1}: CPT code is required` });
        }

        if (!line.diagnosisPointers || line.diagnosisPointers.length === 0) {
            errors.push({ field: `serviceLine${idx + 1}.diagnosisPointers`, message: `Line ${idx + 1}: Diagnosis pointer is required` });
        }

        if (!line.charge || line.charge <= 0) {
            errors.push({ field: `serviceLine${idx + 1}.charge`, message: `Line ${idx + 1}: Charge amount is required` });
        }

        // NDC validation for J-codes
        if (line.cptCode?.startsWith('J') && !line.ndc) {
            warnings.push({ field: `serviceLine${idx + 1}.ndc`, message: `Line ${idx + 1}: J-code may require NDC` });
        }
    });

    // Billing provider validations
    if (!claim.billingNPI) {
        errors.push({ field: 'billingNPI', message: 'Billing provider NPI is required (Box 33a)' });
    }

    if (!claim.federalTaxId) {
        errors.push({ field: 'federalTaxId', message: 'Federal Tax ID is required (Box 25)' });
    }

    // Authorization check for high-cost procedures
    const highCostCodes = ['70553', '72148', '27447', '43239'];
    claim.serviceLines?.forEach((line, idx) => {
        if (highCostCodes.includes(line.cptCode) && !claim.priorAuthNumber) {
            warnings.push({
                field: `serviceLine${idx + 1}`,
                message: `Line ${idx + 1}: ${line.cptCode} may require prior authorization`
            });
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        claimId: claim.claimId
    };
}

/**
 * Generate EDI 837P format string
 */
export function generateEDI837(claim) {
    const segments = [];
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);

    // ISA - Interchange Control Header
    segments.push(`ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${today.substring(2)}*${time}*^*00501*000000001*0*P*:~`);

    // GS - Functional Group Header
    segments.push(`GS*HC*SENDER*RECEIVER*${today}*${time}*1*X*005010X222A1~`);

    // ST - Transaction Set Header
    segments.push(`ST*837*0001*005010X222A1~`);

    // BHT - Beginning of Hierarchical Transaction
    segments.push(`BHT*0019*00*${claim.claimId}*${today}*${time}*CH~`);

    // NM1 - Submitter Name
    segments.push(`NM1*41*2*${claim.billingProvider.name}*****46*${claim.billingNPI}~`);

    // NM1 - Receiver Name
    segments.push(`NM1*40*2*INSURANCE COMPANY*****46*123456789~`);

    // HL - Billing Provider Hierarchical Level
    segments.push(`HL*1**20*1~`);

    // NM1 - Billing Provider
    segments.push(`NM1*85*2*${claim.billingProvider.name}*****XX*${claim.billingNPI}~`);

    // N3 - Billing Provider Address
    if (claim.billingProvider.address) {
        segments.push(`N3*${claim.billingProvider.address.street}~`);
        segments.push(`N4*${claim.billingProvider.address.city}*${claim.billingProvider.address.state}*${claim.billingProvider.address.zip}~`);
    }

    // REF - Billing Provider Tax ID
    segments.push(`REF*EI*${claim.federalTaxId}~`);

    // HL - Subscriber Hierarchical Level
    segments.push(`HL*2*1*22*1~`);

    // SBR - Subscriber Information
    segments.push(`SBR*P*18*${claim.groupNumber || ''}******CI~`);

    // NM1 - Subscriber Name
    const insured = claim.insuredName;
    segments.push(`NM1*IL*1*${insured.lastName}*${insured.firstName}****MI*${claim.subscriberId}~`);

    // NM1 - Payer Name
    segments.push(`NM1*PR*2*${claim.planName || 'INSURANCE'}*****PI*${claim.payerType}~`);

    // HL - Patient Level (if different from subscriber)
    if (claim.relationshipToInsured !== 'Self') {
        segments.push(`HL*3*2*23*0~`);
        segments.push(`PAT*19~`);
        segments.push(`NM1*QC*1*${claim.patientName.lastName}*${claim.patientName.firstName}~`);
    }

    // CLM - Claim Information
    segments.push(`CLM*${claim.patientAccountNo}*${claim.totalCharge}***${claim.serviceFacility ? '11' : '11'}:B:1*Y*A*Y*Y~`);

    // DTP - Date of Service
    const dos = claim.serviceLines[0]?.fromDate?.replace(/-/g, '') || today;
    segments.push(`DTP*472*D8*${dos}~`);

    // HI - Diagnosis Codes
    const dxCodes = claim.diagnoses.map((dx, idx) =>
        `${idx === 0 ? 'ABK' : 'ABF'}:${dx.code.replace('.', '')}`
    ).join('*');
    segments.push(`HI*${dxCodes}~`);

    // LX/SV1 - Service Lines
    claim.serviceLines.forEach((line, idx) => {
        segments.push(`LX*${idx + 1}~`);
        const modifiers = line.modifiers?.join(':') || '';
        segments.push(`SV1*HC:${line.cptCode}${modifiers ? ':' + modifiers : ''}*${line.charge}*UN*${line.units}***${line.diagnosisPointers.join(':')}~`);
        segments.push(`DTP*472*D8*${line.fromDate?.replace(/-/g, '') || dos}~`);

        // NDC if applicable
        if (line.ndc) {
            segments.push(`LIN**N4*${line.ndc}~`);
            segments.push(`CTP****${line.ndcQuantity}*${line.ndcUnit}~`);
        }
    });

    // SE - Transaction Set Trailer
    segments.push(`SE*${segments.length - 2}*0001~`);

    // GE - Functional Group Trailer
    segments.push(`GE*1*1~`);

    // IEA - Interchange Control Trailer
    segments.push(`IEA*1*000000001~`);

    return segments.join('\n');
}

// Helper functions
function generateClaimId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CLM-${timestamp}-${random}`.toUpperCase();
}

function determinePayerType(payerId) {
    // Map payer IDs to CMS-1500 Box 1 types
    const payerTypes = {
        'MEDICARE': 'MA',
        'MEDICAID': 'MB',
        'BCBS': 'BL',
        'COMMERCIAL': 'CI'
    };
    return payerTypes[payerId] || 'CI';
}

function calculateTotalCharge(procedures) {
    return procedures.reduce((sum, proc) => sum + (proc.charge || proc.fee || 0), 0);
}

export default {
    buildClaim,
    validateClaim,
    generateEDI837
};
