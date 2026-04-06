import React, { useState, useEffect } from 'react';

/**
 * JELLY BEAN NOTIFICATION SYSTEM
 * Implements eCW's "Management by Exception" workflow
 * Phase 3A: Core notification infrastructure
 */

export function JellyBeanNotifications({ onBeanClick }) {
    // Notification counts
    const [failedEligibility, setFailedEligibility] = useState(0);
    const [expiringAuths, setExpiringAuths] = useState(0);
    const [pendingReferrals, setPendingReferrals] = useState(0);
    const [claimDenials, setClaimDenials] = useState(0);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            refreshNotifications();
        }, 30000);

        // Initial load
        refreshNotifications();

        return () => clearInterval(refreshInterval);
    }, []);

    const refreshNotifications = () => {
        // TODO: Replace with actual API calls
        // Simulated data for now
        setFailedEligibility(Math.floor(Math.random() * 10));
        setExpiringAuths(Math.floor(Math.random() * 5));
        setPendingReferrals(Math.floor(Math.random() * 8));
        setClaimDenials(Math.floor(Math.random() * 12));
    };

    const handleBeanClick = (type) => {
        if (onBeanClick) {
            onBeanClick(type);
        }
    };

    return (
        <div style={{
            display: 'flex',
            gap: '16px',
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            margin: '16px 0'
        }}>


            {/* Red Bean - Failed Eligibility */}
            <JellyBean
                color="#ef4444"
                icon="X"
                label="Failed Eligibility"
                count={failedEligibility}
                onClick={() => handleBeanClick('eligibility')}
            />

            {/* Yellow Bean - Expiring Authorizations */}
            <JellyBean
                color="#f59e0b"
                icon="!"
                label="Expiring Auths"
                count={expiringAuths}
                onClick={() => handleBeanClick('authorizations')}
            />

            {/* Blue Bean - Pending Referrals */}
            <JellyBean
                color="#3b82f6"
                icon="▣"
                label="Pending Referrals"
                count={pendingReferrals}
                onClick={() => handleBeanClick('referrals')}
            />

            {/* Orange Bean - Claim Denials */}
            <JellyBean
                color="#f97316"
                icon="$"
                label="Claim Denials"
                count={claimDenials}
                onClick={() => handleBeanClick('denials')}
            />
        </div>
    );
}

function JellyBean({ color, icon, label, count, onClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '12px 16px',
                backgroundColor: isHovered ? `${color}15` : '#f8f9fa',
                border: `2px solid ${color}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered ? `0 4px 12px ${color}30` : 'none',
                minWidth: '120px'
            }}
        >
            {/* Badge with count */}


            {/* Icon */}
            <div style={{ fontSize: '24px' }}>
                {icon}
            </div>

            {/* Label */}
            <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                textAlign: 'center',
                lineHeight: '1.2'
            }}>
                {label}
            </div>
        </div>
    );
}

/**
 * TASK WORKLIST COMPONENT
 * Drill-down interface for each Jelly Bean type
 */

export function TaskWorklist({ type, onClose }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filterDate, setFilterDate] = useState('all');

    useEffect(() => {
        loadTasks();
    }, [type, filterDate]);

    const loadTasks = () => {
        // Simulated task data based on type
        const mockTasks = {
            eligibility: [
                { id: 1, patient: 'Smith, John', dob: '1985-03-15', insurance: 'Blue Cross', status: 'Inactive', date: '2026-02-02', reason: 'Policy Terminated' },
                { id: 2, patient: 'Johnson, Mary', dob: '1992-07-22', insurance: 'Aetna', status: 'Not Found', date: '2026-02-01', reason: 'Invalid Member ID' },
                { id: 3, patient: 'Williams, Robert', dob: '1978-11-30', insurance: 'UHC', status: 'Error', date: '2026-02-02', reason: 'Communication Error' }
            ],
            authorizations: [
                { id: 1, patient: 'Davis, Sarah', auth: 'AUTH-12345', expiry: '2026-02-10', visits_remaining: 2, specialty: 'Physical Therapy' },
                { id: 2, patient: 'Miller, James', auth: 'AUTH-67890', expiry: '2026-02-15', visits_remaining: 0, specialty: 'Cardiology' },
                { id: 3, patient: 'Wilson, Patricia', auth: 'AUTH-54321', expiry: '2026-02-20', visits_remaining: 3, specialty: 'Orthopedics' }
            ],
            referrals: [
                { id: 1, patient: 'Brown, Michael', specialty: 'Dermatology', provider: 'Dr. Johnson', days_pending: 45, status: 'Awaiting Report' },
                { id: 2, patient: 'Jones, Linda', specialty: 'Neurology', provider: 'Dr. Smith', days_pending: 30, status: 'Pending' },
                { id: 3, patient: 'Garcia, David', specialty: 'Cardiology', provider: 'Dr. White', days_pending: 60, status: 'Overdue' }
            ],
            denials: [
                { id: 1, patient: 'Martinez, Jennifer', claim: 'CLM-2024-001', amount: '$350.00', carc: 'CARC-16', reason: 'Missing Information', payer: 'Medicare' },
                { id: 2, patient: 'Rodriguez, William', claim: 'CLM-2024-002', amount: '$125.00', carc: 'CARC-45', reason: 'Exceeds Fee Schedule', payer: 'Blue Cross' },
                { id: 3, patient: 'Hernandez, Barbara', claim: 'CLM-2024-003', amount: '$890.00', carc: 'CARC-50', reason: 'Non-Covered Service', payer: 'Aetna' }
            ]
        };

        setTasks(mockTasks[type] || []);
    };

    const getTitle = () => {
        const titles = {
            eligibility: 'X Failed Eligibility Checks',
            authorizations: '! Expiring Authorizations',
            referrals: 'Pending Referrals',
            denials: 'Claim Denials'
        };
        return titles[type] || 'Task Worklist';
    };

    const getColumns = () => {
        const columns = {
            eligibility: ['Patient', 'DOB', 'Insurance', 'Status', 'Date', 'Reason', 'Action'],
            authorizations: ['Patient', 'Auth #', 'Expiry Date', 'Visits Left', 'Specialty', 'Action'],
            referrals: ['Patient', 'Specialty', 'Provider', 'Days Pending', 'Status', 'Action'],
            denials: ['Patient', 'Claim #', 'Amount', 'CARC', 'Reason', 'Payer', 'Action']
        };
        return columns[type] || [];
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                width: '90%',
                maxWidth: '1200px',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '2px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                        {getTitle()}
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f1f5f9',
                                color: '#0f172a',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e2e8f0' }}>
                                {getColumns().map((col, idx) => (
                                    <th key={idx} style={{
                                        padding: '12px',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#64748b',
                                        textTransform: 'uppercase'
                                    }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={getColumns().length} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                                        <div style={{ fontSize: '18px', fontWeight: '600' }}>No tasks found!</div>
                                        <div style={{ fontSize: '14px', marginTop: '8px' }}>All clear in this category.</div>
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task, idx) => (
                                    <TaskRow key={task.id} task={task} type={type} isEven={idx % 2 === 0} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function TaskRow({ task, type, isEven }) {
    const [showAction, setShowAction] = useState(false);
    const [actionDone, setActionDone] = useState(false);

    const [insForm, setInsForm] = useState({
        insuranceName: task.insurance || '', planType: 'PPO',
        memberId: '', groupNo: '', effectiveDate: new Date().toISOString().slice(0, 10),
    });
    const [renewForm, setRenewForm] = useState({ newAuthNo: '', newExpiry: '', newVisits: '', notes: '' });
    const [referralStatus, setReferralStatus] = useState('Received');
    const [denialAction, setDenialAction] = useState('appeal');
    const [denialNotes, setDenialNotes] = useState('');

    const handleSave = () => { setActionDone(true); setShowAction(false); };

    const inputSm = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' };
    const labelSm = { display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '3px' };
    const saveBtnStyle = { padding: '7px 16px', backgroundColor: '#a941c6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' };
    const cancelBtnStyle = { padding: '7px 14px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };

    const actionBtn = (label) => (
        actionDone
            ? <span style={{ color: '#10b981', fontWeight: '700', fontSize: '12px' }}>✓ Done</span>
            : <button onClick={() => setShowAction(v => !v)} style={{ ...saveBtnStyle, backgroundColor: showAction ? '#475569' : '#a941c6' }}>{showAction ? 'Cancel' : label}</button>
    );

    const renderRow = () => {
        switch (type) {
            case 'eligibility':
                return (<>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.patient}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.dob}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.insurance}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '4px 12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{task.status}</span></td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.date}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{task.reason}</td>
                    <td style={{ padding: '12px' }}>{actionBtn('Update Insurance')}</td>
                </>);
            case 'authorizations':
                return (<>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.patient}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace' }}>{task.auth}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.expiry}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '4px 12px', backgroundColor: task.visits_remaining === 0 ? '#fee2e2' : '#fef3c7', color: task.visits_remaining === 0 ? '#991b1b' : '#92400e', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{task.visits_remaining} visits</span></td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.specialty}</td>
                    <td style={{ padding: '12px' }}>{actionBtn('Renew Auth')}</td>
                </>);
            case 'referrals':
                return (<>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.patient}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.specialty}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.provider}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '4px 12px', backgroundColor: task.days_pending > 45 ? '#fee2e2' : '#fef3c7', color: task.days_pending > 45 ? '#991b1b' : '#92400e', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{task.days_pending} days</span></td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{actionDone ? referralStatus : task.status}</td>
                    <td style={{ padding: '12px' }}>{actionBtn('View Referral')}</td>
                </>);
            case 'denials':
                return (<>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.patient}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace' }}>{task.claim}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>{task.amount}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace', color: '#dc2626' }}>{task.carc}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{task.reason}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{task.payer}</td>
                    <td style={{ padding: '12px' }}>{actionBtn('Work Denial')}</td>
                </>);
            default:
                return null;
        }
    };

    const renderActionPanel = () => {
        if (!showAction) return null;
        const cols = { eligibility: 7, authorizations: 6, referrals: 6, denials: 7 }[type] || 6;
        let content = null;

        if (type === 'eligibility') content = (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'end' }}>
                <div><label style={labelSm}>Insurance Name</label><input style={inputSm} value={insForm.insuranceName} onChange={e => setInsForm(f => ({ ...f, insuranceName: e.target.value }))} /></div>
                <div><label style={labelSm}>Plan Type</label>
                    <select style={inputSm} value={insForm.planType} onChange={e => setInsForm(f => ({ ...f, planType: e.target.value }))}>
                        <option>PPO</option><option>HMO</option><option>EPO</option><option>Medicare</option><option>Medicaid</option>
                    </select>
                </div>
                <div><label style={labelSm}>Member / Subscriber ID</label><input style={inputSm} value={insForm.memberId} placeholder="e.g. XYZ123456" onChange={e => setInsForm(f => ({ ...f, memberId: e.target.value }))} /></div>
                <div><label style={labelSm}>Group #</label><input style={inputSm} value={insForm.groupNo} placeholder="e.g. GRP001" onChange={e => setInsForm(f => ({ ...f, groupNo: e.target.value }))} /></div>
                <div><label style={labelSm}>Effective Date</label><input type="date" style={inputSm} value={insForm.effectiveDate} onChange={e => setInsForm(f => ({ ...f, effectiveDate: e.target.value }))} /></div>
                <div style={{ display: 'flex', gap: '8px' }}><button style={saveBtnStyle} onClick={handleSave}>✓ Save Insurance</button><button style={cancelBtnStyle} onClick={() => setShowAction(false)}>Cancel</button></div>
            </div>
        );

        if (type === 'authorizations') content = (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'end' }}>
                <div><label style={labelSm}>New Auth #</label><input style={inputSm} value={renewForm.newAuthNo} placeholder="AUTH-2026-XXXXX" onChange={e => setRenewForm(f => ({ ...f, newAuthNo: e.target.value }))} /></div>
                <div><label style={labelSm}>New Expiry Date</label><input type="date" style={inputSm} value={renewForm.newExpiry} onChange={e => setRenewForm(f => ({ ...f, newExpiry: e.target.value }))} /></div>
                <div><label style={labelSm}>Visits Approved</label><input type="number" min="1" style={inputSm} value={renewForm.newVisits} placeholder="e.g. 6" onChange={e => setRenewForm(f => ({ ...f, newVisits: e.target.value }))} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelSm}>Notes</label><input style={inputSm} value={renewForm.notes} placeholder="Optional renewal notes..." onChange={e => setRenewForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <div style={{ display: 'flex', gap: '8px' }}><button style={saveBtnStyle} onClick={handleSave}>✓ Save Renewal</button><button style={cancelBtnStyle} onClick={() => setShowAction(false)}>Cancel</button></div>
            </div>
        );

        if (type === 'referrals') content = (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div><label style={labelSm}>Update Status</label>
                    <select style={{ ...inputSm, minWidth: '180px' }} value={referralStatus} onChange={e => setReferralStatus(e.target.value)}>
                        <option>Received</option><option>Report Pending</option><option>Awaiting Report</option><option>Completed</option><option>Closed</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                    <button style={saveBtnStyle} onClick={handleSave}>✓ Update Status</button>
                    <button style={cancelBtnStyle} onClick={() => setShowAction(false)}>Cancel</button>
                </div>
            </div>
        );

        if (type === 'denials') content = (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', alignItems: 'end' }}>
                <div><label style={labelSm}>Action</label>
                    <select style={inputSm} value={denialAction} onChange={e => setDenialAction(e.target.value)}>
                        <option value="appeal">🔄 File Appeal</option>
                        <option value="rebill">📤 Re-bill Corrected Claim</option>
                        <option value="writeoff">✏️ Write-off</option>
                    </select>
                </div>
                <div><label style={labelSm}>Notes / Justification</label><input style={inputSm} value={denialNotes} placeholder="Add clinical justification or correction notes..." onChange={e => setDenialNotes(e.target.value)} /></div>
                <div style={{ display: 'flex', gap: '8px' }}><button style={saveBtnStyle} onClick={handleSave}>✓ Submit</button><button style={cancelBtnStyle} onClick={() => setShowAction(false)}>Cancel</button></div>
            </div>
        );

        return (
            <tr style={{ backgroundColor: '#faf5ff', borderBottom: '2px solid #a941c620' }}>
                <td colSpan={cols} style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#a941c6', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {type === 'eligibility' ? '📋 Update Insurance Information' : type === 'authorizations' ? '♻️ Renew Authorization' : type === 'referrals' ? '📄 Referral Status Update' : '⚖️ Work Denial'}
                    </div>
                    {content}
                </td>
            </tr>
        );
    };

    return (
        <>
            <tr style={{ backgroundColor: isEven ? '#ffffff' : '#f8f9fa', borderBottom: '1px solid #e2e8f0' }}>
                {renderRow()}
            </tr>
            {renderActionPanel()}
        </>
    );
}

