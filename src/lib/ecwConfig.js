// ECW V12 Configuration Tables
// Fee Schedules, Clearinghouse Credentials, and Claim Edit Rules

/**
 * FEE SCHEDULES
 * Defines pricing for services
 */
export const feeScheduleSchema = {
    FeeScheduleID: 'INTEGER PRIMARY KEY',

    // Schedule Details
    ScheduleName: 'VARCHAR(100)', // 'Standard', 'Medicare', 'BCBS Commercial'
    ScheduleType: 'VARCHAR(50)', // 'Standard', 'Insurance', 'Cash'
    EffectiveDate: 'DATE',
    TerminationDate: 'DATE',

    // Pricing
    CPTCode: 'VARCHAR(10)',
    FeeAmount: 'DECIMAL(10,2)', // Your charge for this CPT

    // Insurance-specific
    InsuranceID: 'INTEGER FOREIGN KEY', // Links to specific payer
    ContractedRate: 'DECIMAL(10,2)', // e.g., 110% of Medicare

    // Audit
    CreatedDate: 'TIMESTAMP',
    ModifiedDate: 'TIMESTAMP'
};

/**
 * CLEARINGHOUSE CREDENTIALS
 * ECW V12: SFTP connection details
 */
export const clearinghouseSchema = {
    ClearinghouseID: 'INTEGER PRIMARY KEY',

    // Clearinghouse Details
    ClearinghouseName: 'VARCHAR(100)', // 'Trizetto', 'Availity', 'Change Healthcare'

    // Connection (ECW V12: SFTP Username/Password)
    SFTPHost: 'VARCHAR(200)',
    SFTPPort: 'INTEGER',
    SFTPUsername: 'VARCHAR(100)',
    SFTPPassword: 'VARCHAR(200)', // Encrypted

    // IDs (ECW V12: Submitter ID)
    SubmitterID: 'VARCHAR(50)', // Your practice's unique ID with the clearinghouse
    ReceiverID: 'VARCHAR(50)',

    // File Paths
    OutboundPath: 'VARCHAR(500)', // Where to send 837 files
    InboundPath: 'VARCHAR(500)', // Where to receive 835/277 files

    // Status
    IsActive: 'BOOLEAN',
    LastConnection: 'TIMESTAMP',

    // Audit
    CreatedDate: 'TIMESTAMP'
};

/**
 * CLAIM EDIT RULES
 * ECW V12: Rules Engine for claim scrubbing
 */
export const claimEditRuleSchema = {
    RuleID: 'INTEGER PRIMARY KEY',

    // Rule Definition
    RuleName: 'VARCHAR(200)', // 'Medicaid Modifier 25 Required'
    RuleDescription: 'TEXT',
    Priority: 'INTEGER', // Execution order

    // Conditions (JSON or separate condition table)
    ConditionField: 'VARCHAR(100)', // 'CPTCode', 'Insurance', 'Gender'
    ConditionOperator: 'VARCHAR(20)', // '=', '!=', 'CONTAINS', 'IN'
    ConditionValue: 'VARCHAR(200)', // '99213', 'Medicaid', 'M'

    // Actions
    ActionType: 'VARCHAR(50)', // 'REQUIRE', 'BLOCK', 'WARN', 'AUTO_ADD'
    ActionTarget: 'VARCHAR(100)', // 'Modifier1', 'Diagnosis', etc.
    ActionValue: 'VARCHAR(200)', // '25', 'Add Modifier'

    // Scope
    AppliesTo: 'VARCHAR(50)', // 'All', 'Specific Payer', 'Specific Provider'

    // Status
    IsActive: 'BOOLEAN',

    // Audit
    CreatedDate: 'TIMESTAMP',
    ModifiedBy: 'INTEGER'
};

/**
 * ECW V12: PAYER MASTER FILE
 * Enhanced insurance carrier table
 */
export const payerMasterSchema = {
    PayerID: 'INTEGER PRIMARY KEY',

    // Payer Information
    PayerName: 'VARCHAR(200)', // 'Blue Cross Blue Shield of Illinois'
    PayerCode: 'VARCHAR(10)', // 5-char code (e.g., '00430')

    // Address (ECW V12: Exact address for appeals)
    Address1: 'VARCHAR(200)',
    City: 'VARCHAR(100)',
    State: 'VARCHAR(2)',
    ZipCode: 'VARCHAR(10)',
    Phone: 'VARCHAR(20)',

    // Electronic Billing (ECW V12: Electronic Payer ID)
    ElectronicPayerID: 'VARCHAR(5)', // The 5-digit routing ID for clearinghouse

    // Timely Filing (ECW V12: Filing Limit Days)
    TimelyFilingDays: 'INTEGER', // e.g., 90 Days - Triggers internal alerts

    // Financial
    DefaultCopay: 'DECIMAL(10,2)',
    AcceptsAssignment: 'BOOLEAN',

    // Status
    IsActive: 'BOOLEAN',

    // Audit
    CreatedDate: 'TIMESTAMP',
    ModifiedDate: 'TIMESTAMP'
};

/**
 * ECW V12: BATCH MANAGEMENT
 * Track claim batches
 */
export const batchSchema = {
    BatchID: 'VARCHAR(50) PRIMARY KEY',

    // Batch Details
    BatchDate: 'DATE',
    BatchType: 'VARCHAR(50)', // 'Claims', 'Statements', 'ERA'

    // Counts
    TotalClaims: 'INTEGER',
    TotalCharges: 'DECIMAL(12,2)',

    // Submission
    SubmittedDate: 'TIMESTAMP',
    SubmittedBy: 'INTEGER',
    ClearinghouseID: 'INTEGER FOREIGN KEY',

    // Acknowledgment (ANSI 999/277)
    AckReceived: 'BOOLEAN',
    AckDate: 'TIMESTAMP',
    AcceptedCount: 'INTEGER',
    RejectedCount: 'INTEGER',

    // File Info
    FileName: 'VARCHAR(500)',
    FileSize: 'INTEGER', // bytes

    // Status
    BatchStatus: 'VARCHAR(50)', // 'Created', 'Submitted', 'Acknowledged', 'Complete'

    // Audit
    CreatedDate: 'TIMESTAMP'
};

// Export all ECW V12 configuration schemas
export const ecwConfigSchemas = {
    feeSchedule: feeScheduleSchema,
    clearinghouse: clearinghouseSchema,
    claimEditRule: claimEditRuleSchema,
    payerMaster: payerMasterSchema,
    batch: batchSchema
};

export default ecwConfigSchemas;
