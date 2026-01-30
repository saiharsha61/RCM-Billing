export const kpis = [
    { label: 'Expected Revenue (7 days)', value: '$128,400', trend: '+12%', status: 'success' },
    { label: 'At Risk Revenue', value: '$22,300', trend: '-5%', status: 'warning' },
    { label: 'Claims Needing Action', value: '14', trend: '+2', status: 'danger' },
    { label: 'Clean Claim Rate', value: '94%', trend: '+1%', status: 'success' },
];

export const priorityTasks = [
    {
        id: 't1',
        type: 'Denial',
        description: 'Claim #4928 - Medical Necessity',
        payer: 'BlueCross',
        amount: '$1,250',
        age: '2 days',
        priority: 'high'
    },
    {
        id: 't2',
        type: 'Review',
        description: 'Dr. Rao - Missing Modifier',
        payer: 'UnitedHealth',
        amount: '$890',
        age: '4 hours',
        priority: 'medium'
    },
    {
        id: 't3',
        type: 'Action',
        description: 'Eligibility Failure - Sarah Connor',
        payer: 'Aetna',
        amount: '$450',
        age: '1 day',
        priority: 'high'
    },
    {
        id: 't4',
        type: 'Post',
        description: 'Unmatched Payment - $2,300',
        payer: 'Medicare',
        amount: '$2,300',
        age: '6 hours',
        priority: 'medium'
    },
    {
        id: 't5',
        type: 'Review',
        description: 'Coding Check - Chest X-Ray',
        payer: 'Cigna',
        amount: '$120',
        age: '30 mins',
        priority: 'low'
    }
];

export const charges = [
    { id: 'C-001', encounterId: 'E-9321', provider: 'Dr. Rao', patient: 'Robert K***', date: 'Oct 24', amount: '$1,250', risk: 'Medium', issues: ['Missing Modifier'], status: 'Review' },
    { id: 'C-002', encounterId: 'E-9322', provider: 'Dr. Smith', patient: 'Sarah J***', date: 'Oct 24', amount: '$450', risk: 'Low', issues: ['Coding Check'], status: 'Review' },
    { id: 'C-003', encounterId: 'E-9323', provider: 'Dr. Doe', patient: 'Mike L***', date: 'Oct 23', amount: '$2,100', risk: 'High', issues: ['Authorization Missing'], status: 'Hold' },
    { id: 'C-004', encounterId: 'E-9324', provider: 'Dr. Rao', patient: 'Emily W***', date: 'Oct 23', amount: '$120', risk: 'Low', issues: [], status: 'Ready' },
    { id: 'C-005', encounterId: 'E-9325', provider: 'Dr. Smith', patient: 'David B***', date: 'Oct 22', amount: '$890', risk: 'Medium', issues: ['Diagnosis Mismatch'], status: 'Review' },
];

export const claims = [
    { id: 'CLM-001', payer: 'BlueCross', patient: 'Robert Kowalski', amount: '$1,250', status: 'Draft', submitted: '-', age: '2 days' },
    { id: 'CLM-002', payer: 'UnitedHealth', patient: 'Sarah Johnson', amount: '$450', status: 'Submitted', submitted: '2 days ago', age: '4 days' },
    { id: 'CLM-003', payer: 'Aetna', patient: 'Mike Lewis', amount: '$2,100', status: 'Rejected', submitted: '5 days ago', age: '7 days', reason: 'Invalid ID' },
    { id: 'CLM-004', payer: 'Medicare', patient: 'Emily Williams', amount: '$120', status: 'Paid', submitted: '10 days ago', age: '12 days' },
    { id: 'CLM-005', payer: 'Cigna', patient: 'David Brown', amount: '$890', status: 'Submitted', submitted: '1 day ago', age: '3 days' },
];

export const denials = [
    { id: 'D-101', claimId: 'CLM-901', payer: 'BlueCross', patient: 'John D***', amount: '$450', reason: 'Medical Necessity', code: 'CO-50', age: '2 days', status: 'New' },
    { id: 'D-102', claimId: 'CLM-902', payer: 'UnitedHealth', patient: 'Alice M***', amount: '$1,200', reason: 'Authorization Missing', code: 'CO-197', age: '5 days', status: 'Appealed' },
    { id: 'D-103', claimId: 'CLM-903', payer: 'Medicare', patient: 'Bob S***', amount: '$85', reason: 'Duplicate Claim', code: 'CO-18', age: '1 day', status: 'New' },
    { id: 'D-104', claimId: 'CLM-904', payer: 'Aetna', patient: 'Carol W***', amount: '$320', reason: 'Timely Filing', code: 'CO-29', age: '15 days', status: 'Hold' },
];

export const payments = [
    { id: 'P-501', claimId: 'CLM-004', payer: 'Medicare', amount: '$120.00', expected: '$120.00', paid: '$120.00', adjustment: '$0.00', status: 'Match', type: 'ERA' },
    { id: 'P-502', claimId: 'CLM-882', payer: 'BlueCross', amount: '$350.00', expected: '$350.00', paid: '$320.00', adjustment: '$30.00', status: 'Underpaid', type: 'ERA' },
    { id: 'P-503', claimId: 'CLM-993', payer: 'Cigna', amount: '$890.00', expected: '$890.00', paid: '$0.00', adjustment: '$890.00', status: 'Denied', type: 'ERA' },
    { id: 'P-504', claimId: 'CLM-772', payer: 'UnitedHealth', amount: '$45.00', expected: '$45.00', paid: '$45.00', adjustment: '$0.00', status: 'Match', type: 'Manual' },
];

export const arBuckets = [
    { label: '0-30 Days', amount: '$124,500', count: 142, color: 'text-emerald-400', progress: 'w-[75%]' },
    { label: '31-60 Days', amount: '$45,200', count: 56, color: 'text-blue-400', progress: 'w-[45%]' },
    { label: '61-90 Days', amount: '$28,900', count: 23, color: 'text-amber-400', progress: 'w-[20%]' },
    { label: '90+ Days', amount: '$12,400', count: 8, color: 'text-red-400', progress: 'w-[10%]' },
];

export const collectionsQueue = [
    { id: 'AR-001', patient: 'James M***', balance: '$450.00', days: 102, lastAction: 'Statement Sent (20 days ago)', status: 'Urgent' },
    { id: 'AR-002', patient: 'Linda K***', balance: '$1,200.00', days: 95, lastAction: 'Call - No Answer (2 days ago)', status: 'Urgent' },
    { id: 'AR-003', patient: 'Robert P***', balance: '$85.00', days: 75, lastAction: 'Promise to Pay (Broken)', status: 'Follow-up' },
    { id: 'AR-004', patient: 'Susan W***', balance: '$320.00', days: 62, lastAction: 'Statement Sent (5 days ago)', status: 'Routine' },
];

export const financialTrends = [
    { month: 'Jul', revenue: 85000, target: 90000 },
    { month: 'Aug', revenue: 92000, target: 90000 },
    { month: 'Sep', revenue: 88000, target: 92000 },
    { month: 'Oct', revenue: 95000, target: 92000 },
    { month: 'Nov', revenue: 104000, target: 95000 },
    { month: 'Dec', revenue: 118000, target: 100000 },
];

export const denialReasons = [
    { label: 'Medical Necessity', value: 35, color: '#f87171' }, // red-400
    { label: 'Prior Auth Missing', value: 25, color: '#fbbf24' }, // amber-400
    { label: 'Duplicate Claim', value: 20, color: '#60a5fa' }, // blue-400
    { label: 'Timely Filing', value: 10, color: '#94a3b8' }, // slate-400
    { label: 'Other', value: 10, color: '#a78bfa' }, // violet-400
];

export const recentActivities = [
    { user: 'Jane Doe', action: 'Resubmitted Claim #9921', time: '10 mins ago' },
    { user: 'System', action: 'Received ERA from BCBS', time: '45 mins ago' },
    { user: 'Dr. Smith', action: 'Signed Encounters (12)', time: '1 hour ago' },
];
