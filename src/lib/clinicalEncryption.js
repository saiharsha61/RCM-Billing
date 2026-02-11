/**
 * Clinical Data Encryption Wrapper
 * Specialized encryption for progress notes, clinical narratives, and PHI
 * Implements eCW spec requirement: "Progress Note content is stored as encrypted XML data"
 */

import { cryptoService } from './cryptoService.js';
import { auditLog } from './auditLog.js';

// =====================================================
// PROGRESS NOTES ENCRYPTION
// =====================================================

/**
 * Encrypt a progress note (SOAP note, H&P, etc.)
 * Converts note to XML format and encrypts
 * 
 * @param {Object} noteData - Progress note object
 * @returns {Object} Encrypted note payload for database storage
 */
export async function encryptProgressNote(noteData) {
    try {
        // Convert note to XML format (as per eCW spec)
        const xmlContent = convertNoteToXML(noteData);

        // Encrypt the XML content
        const encrypted = await cryptoService.encryptField(
            xmlContent,
            `progress_note_${noteData.encounter_id}`
        );

        // Log encryption event
        auditLog.log('ENCRYPT', 'progress_note', {
            encounter_id: noteData.encounter_id,
            note_type: noteData.note_type,
            provider_id: noteData.provider_id
        });

        return {
            note_content_encrypted: encrypted,
            encryption_algorithm: 'AES-256-GCM',
            encryption_key_id: 'master-key-v1', // In production: KMS key ID
            encrypted_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('[CLINICAL_CRYPTO] Progress note encryption failed:', error);
        throw new Error('Failed to encrypt progress note');
    }
}

/**
 * Decrypt a progress note
 * 
 * @param {string} encryptedContent - Encrypted XML content
 * @param {number} encounterId - Encounter ID (used as AAD)
 * @returns {Object} Decrypted note object
 */
export async function decryptProgressNote(encryptedContent, encounterId) {
    try {
        // Decrypt the XML content
        const xmlContent = await cryptoService.decryptField(
            encryptedContent,
            `progress_note_${encounterId}`
        );

        // Parse XML back to object
        const noteData = parseXMLToNote(xmlContent);

        // Log decryption/access event
        auditLog.log('DECRYPT', 'progress_note', {
            encounter_id: encounterId,
            note_type: noteData.note_type
        });

        return noteData;
    } catch (error) {
        console.error('[CLINICAL_CRYPTO] Progress note decryption failed:', error);
        throw new Error('Failed to decrypt progress note - invalid key or corrupted data');
    }
}

// =====================================================
// XML CONVERSION (eCW Format)
// =====================================================

/**
 * Convert note object to XML format (simplified eCW-style)
 */
function convertNoteToXML(noteData) {
    const {
        note_type = 'SOAP',
        chief_complaint = '',
        hpi = '',
        ros = {},
        physical_exam = {},
        assessment = '',
        plan = '',
        em_level = '',
        total_time_minutes = 0,
        diagnoses = [],
        procedures = []
    } = noteData;

    return `<?xml version="1.0" encoding="UTF-8"?>
<ProgressNote>
    <NoteType>${escapeXML(note_type)}</NoteType>
    <ChiefComplaint>${escapeXML(chief_complaint)}</ChiefComplaint>
    <HPI>${escapeXML(hpi)}</HPI>
    <ROS>
        ${Object.entries(ros).map(([system, value]) =>
        `<System name="${escapeXML(system)}">${escapeXML(value)}</System>`
    ).join('\n        ')}
    </ROS>
    <PhysicalExam>
        ${Object.entries(physical_exam).map(([system, value]) =>
        `<System name="${escapeXML(system)}">${escapeXML(value)}</System>`
    ).join('\n        ')}
    </PhysicalExam>
    <Assessment>${escapeXML(assessment)}</Assessment>
    <Plan>${escapeXML(plan)}</Plan>
    <EMLevel>${escapeXML(em_level)}</EMLevel>
    <TotalTime>${total_time_minutes}</TotalTime>
    <Diagnoses>
        ${diagnoses.map(dx =>
        `<Diagnosis code="${escapeXML(dx.code)}">${escapeXML(dx.description)}</Diagnosis>`
    ).join('\n        ')}
    </Diagnoses>
    <Procedures>
        ${procedures.map(proc =>
        `<Procedure code="${escapeXML(proc.code)}">${escapeXML(proc.description)}</Procedure>`
    ).join('\n        ')}
    </Procedures>
</ProgressNote>`;
}

/**
 * Parse XML back to note object
 */
function parseXMLToNote(xmlContent) {
    // Simple XML parsing (in production, use DOMParser or xml2js)
    const extractTag = (xml, tag) => {
        const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
        return match ? unescapeXML(match[1].trim()) : '';
    };

    return {
        note_type: extractTag(xmlContent, 'NoteType'),
        chief_complaint: extractTag(xmlContent, 'ChiefComplaint'),
        hpi: extractTag(xmlContent, 'HPI'),
        assessment: extractTag(xmlContent, 'Assessment'),
        plan: extractTag(xmlContent, 'Plan'),
        em_level: extractTag(xmlContent, 'EMLevel'),
        total_time_minutes: parseInt(extractTag(xmlContent, 'TotalTime')) || 0
    };
}

function escapeXML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function unescapeXML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
}

// =====================================================
// ITEM NOTES ENCRYPTION
// =====================================================

/**
 * Encrypt individual clinical item (HPI element, ROS item, exam finding)
 */
export async function encryptItemNote(itemValue, encounterId, section, itemKey) {
    try {
        const encrypted = await cryptoService.encryptField(
            itemValue,
            `item_${encounterId}_${section}_${itemKey}`
        );

        return encrypted;
    } catch (error) {
        console.error('[CLINICAL_CRYPTO] Item note encryption failed:', error);
        throw error;
    }
}

/**
 * Decrypt individual clinical item
 */
export async function decryptItemNote(encryptedValue, encounterId, section, itemKey) {
    try {
        const decrypted = await cryptoService.decryptField(
            encryptedValue,
            `item_${encounterId}_${section}_${itemKey}`
        );

        return decrypted;
    } catch (error) {
        console.error('[CLINICAL_CRYPTO] Item note decryption failed:', error);
        throw error;
    }
}

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Encrypt multiple item notes at once
 */
export async function encryptItemNotes(items, encounterId) {
    const encryptedItems = [];

    for (const item of items) {
        const encrypted = await encryptItemNote(
            item.item_value,
            encounterId,
            item.section,
            item.item_key
        );

        encryptedItems.push({
            ...item,
            item_value: null,
            item_value_encrypted: encrypted
        });
    }

    return encryptedItems;
}

/**
 * Decrypt multiple item notes at once
 */
export async function decryptItemNotes(encryptedItems, encounterId) {
    const decryptedItems = [];

    for (const item of encryptedItems) {
        if (item.item_value_encrypted) {
            const decrypted = await decryptItemNote(
                item.item_value_encrypted,
                encounterId,
                item.section,
                item.item_key
            );

            decryptedItems.push({
                ...item,
                item_value: decrypted,
                item_value_encrypted: null
            });
        } else {
            decryptedItems.push(item);
        }
    }

    return decryptedItems;
}

// =====================================================
// PATIENT PHI ENCRYPTION
// =====================================================

/**
 * Encrypt patient demographics PHI fields
 */
export async function encryptPatientPHI(patientData) {
    const phiFields = ['ssn', 'email', 'phone_home', 'phone_mobile'];

    const encrypted = { ...patientData };

    for (const field of phiFields) {
        if (encrypted[field]) {
            encrypted[`${field}_encrypted`] = await cryptoService.encryptField(
                encrypted[field],
                `patient_${patientData.patient_id}_${field}`
            );
            delete encrypted[field]; // Remove plaintext
        }
    }

    return encrypted;
}

/**
 * Decrypt patient demographics PHI fields
 */
export async function decryptPatientPHI(encryptedData) {
    const phiFields = ['ssn', 'email', 'phone_home', 'phone_mobile'];

    const decrypted = { ...encryptedData };

    for (const field of phiFields) {
        const encryptedField = `${field}_encrypted`;
        if (decrypted[encryptedField]) {
            decrypted[field] = await cryptoService.decryptField(
                decrypted[encryptedField],
                `patient_${encryptedData.patient_id}_${field}`
            );
            delete decrypted[encryptedField]; // Remove encrypted version
        }
    }

    return decrypted;
}

// =====================================================
// DOCUMENT ENCRYPTION
// =====================================================

/**
 * Encrypt document content (scanned files, PDFs, etc.)
 * For large files, this would use streaming encryption in production
 */
export async function encryptDocument(fileContent, documentId, patientId) {
    try {
        // Generate file hash for integrity verification
        const fileHash = await cryptoService.sha256Hash(fileContent);

        // Encrypt file content
        const encrypted = await cryptoService.encryptField(
            fileContent,
            `document_${documentId}_patient_${patientId}`
        );

        auditLog.log('ENCRYPT', 'document', {
            document_id: documentId,
            patient_id: patientId,
            file_hash: fileHash
        });

        return {
            encrypted_content: encrypted,
            file_hash: fileHash,
            encryption_algorithm: 'AES-256-GCM'
        };
    } catch (error) {
        console.error('[CLINICAL_CRYPTO] Document encryption failed:', error);
        throw error;
    }
}

/**
 * Decrypt document content
 */
export async function decryptDocument(encryptedContent, documentId, patientId, expectedHash) {
    try {
        const decrypted = await cryptoService.decryptField(
            encryptedContent,
            `document_${documentId}_patient_${patientId}`
        );

        // Verify integrity
        const actualHash = await cryptoService.sha256Hash(decrypted);
        if (expectedHash && actualHash !== expectedHash) {
            throw new Error('Document integrity check failed - file may be corrupted');
        }

        auditLog.log('DECRYPT', 'document', {
            document_id: documentId,
            patient_id: patientId
        });

        return decrypted;
    } catch (error) {
        console.error('[CLINICAL_CRYPTO] Document decryption failed:', error);
        throw error;
    }
}

// =====================================================
// EXPORTS
// =====================================================

export const clinicalEncryption = {
    // Progress notes
    encryptProgressNote,
    decryptProgressNote,

    // Item notes
    encryptItemNote,
    decryptItemNote,
    encryptItemNotes,
    decryptItemNotes,

    // Patient PHI
    encryptPatientPHI,
    decryptPatientPHI,

    // Documents
    encryptDocument,
    decryptDocument
};

export default clinicalEncryption;
