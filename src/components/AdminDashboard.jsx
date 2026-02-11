import React, { useState } from 'react';

/**
 * REPORTS DASHBOARD
 * Analytics and reporting for RCM operations
 */

export function ReportsDashboard() {
    const [dateRange, setDateRange] = useState('mtd'); // mtd, ytd, custom
    const [selectedReport, setSelectedReport] = useState('overview');

    // Mock analytics data
    const metrics = {
        cleanClaimRate: 94.5,
        cleanClaimTrend: +2.3,
        daysInAR: 28,
        daysInARTrend: -3,
        denialRate: 8.2,
        denialRateTrend: -1.5,
        collectionRate: 96.8,
        collectionTrend: +0.8,
        totalClaims: 1247,
        totalCharges: 892450,
        totalCollected: 863830,
        avgReimbursement: 692
    };

    const denialsByCategory = [
        { category: 'Eligibility', count: 45, percentage: 28, amount: 34500 },
        { category: 'Authorization', count: 38, percentage: 24, amount: 52000 },
        { category: 'Coding', count: 32, percentage: 20, amount: 28900 },
        { category: 'Medical Necessity', count: 25, percentage: 16, amount: 41200 },
        { category: 'Billing/Duplicate', count: 19, percentage: 12, amount: 15600 }
    ];

    const revenueByPayer = [
        { payer: 'Medicare', revenue: 245000, claims: 320, color: '#3b82f6' },
        { payer: 'Blue Cross', revenue: 198000, claims: 285, color: '#8b5cf6' },
        { payer: 'Aetna', revenue: 156000, claims: 198, color: '#10b981' },
        { payer: 'UHC', revenue: 142000, claims: 225, color: '#f59e0b' },
        { payer: 'Cigna', revenue: 98000, claims: 142, color: '#ef4444' },
        { payer: 'Self-Pay', revenue: 24830, claims: 77, color: '#6b7280' }
    ];

    const providerPerformance = [
        { provider: 'Dr. Smith', charges: 245000, collected: 238000, rate: 97.1, rank: 1 },
        { provider: 'Dr. Johnson', charges: 198000, collected: 189500, rate: 95.7, rank: 2 },
        { provider: 'Dr. Williams', charges: 175000, collected: 168000, rate: 96.0, rank: 3 },
        { provider: 'Dr. Brown', charges: 156000, collected: 148200, rate: 95.0, rank: 4 },
        { provider: 'Dr. Davis', charges: 118450, collected: 120130, rate: 101.4, rank: 5 }
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 8px 0' }}>
                        📊 Analytics Dashboard
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Revenue Cycle Performance Metrics</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {['mtd', 'ytd', 'custom'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: dateRange === range ? '#a941c6' : 'white',
                                color: dateRange === range ? 'white' : '#64748b',
                                border: `2px solid ${dateRange === range ? '#a941c6' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '12px'
                            }}
                        >
                            {range === 'mtd' ? 'Month to Date' : range === 'ytd' ? 'Year to Date' : 'Custom'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                <KPICard
                    title="Clean Claim Rate"
                    value={`${metrics.cleanClaimRate}%`}
                    trend={metrics.cleanClaimTrend}
                    icon="✓"
                    color="#10b981"
                />
                <KPICard
                    title="Days in A/R"
                    value={metrics.daysInAR}
                    trend={metrics.daysInARTrend}
                    icon="📅"
                    color="#3b82f6"
                    trendInverse
                />
                <KPICard
                    title="Denial Rate"
                    value={`${metrics.denialRate}%`}
                    trend={metrics.denialRateTrend}
                    icon="⚠️"
                    color="#f59e0b"
                    trendInverse
                />
                <KPICard
                    title="Collection Rate"
                    value={`${metrics.collectionRate}%`}
                    trend={metrics.collectionTrend}
                    icon="💰"
                    color="#8b5cf6"
                />
            </div>

            {/* Revenue Summary */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>
                    Revenue Summary
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Total Claims</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>{metrics.totalClaims.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Total Charges</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>${(metrics.totalCharges / 1000).toFixed(0)}K</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#059669', marginBottom: '8px' }}>Total Collected</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669' }}>${(metrics.totalCollected / 1000).toFixed(0)}K</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Avg Reimbursement</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a' }}>${metrics.avgReimbursement}</div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Denials by Category */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>
                        Top Denial Categories
                    </h2>
                    {denialsByCategory.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.category}</span>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>
                                    {item.count} ({item.percentage}%) - ${item.amount.toLocaleString()}
                                </span>
                            </div>
                            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${item.percentage}%`,
                                    backgroundColor: '#ef4444',
                                    borderRadius: '4px'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Revenue by Payer */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>
                        Revenue by Payer
                    </h2>
                    {revenueByPayer.map((payer, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: idx < revenueByPayer.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '3px',
                                    backgroundColor: payer.color
                                }} />
                                <span style={{ fontWeight: '600' }}>{payer.payer}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '700', color: '#0f172a' }}>${(payer.revenue / 1000).toFixed(0)}K</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{payer.claims} claims</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Provider Performance Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>
                    Provider Performance
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                            <th style={{ padding: '14px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Rank</th>
                            <th style={{ padding: '14px', textAlign: 'left', color: '#0004d0', fontWeight: '600' }}>Provider</th>
                            <th style={{ padding: '14px', textAlign: 'right', color: '#0004d0', fontWeight: '600' }}>Charges</th>
                            <th style={{ padding: '14px', textAlign: 'right', color: '#0004d0', fontWeight: '600' }}>Collected</th>
                            <th style={{ padding: '14px', textAlign: 'right', color: '#0004d0', fontWeight: '600' }}>Collection Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providerPerformance.map(provider => (
                            <tr key={provider.rank} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '14px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: provider.rank <= 3 ? '#a941c6' : '#e2e8f0',
                                        color: provider.rank <= 3 ? 'white' : '#64748b',
                                        fontWeight: '700',
                                        fontSize: '12px'
                                    }}>
                                        {provider.rank}
                                    </span>
                                </td>
                                <td style={{ padding: '14px', fontWeight: '600' }}>{provider.provider}</td>
                                <td style={{ padding: '14px', textAlign: 'right', color: '#64748b' }}>
                                    ${provider.charges.toLocaleString()}
                                </td>
                                <td style={{ padding: '14px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                                    ${provider.collected.toLocaleString()}
                                </td>
                                <td style={{ padding: '14px', textAlign: 'right' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        backgroundColor: provider.rate >= 96 ? '#d1fae5' : provider.rate >= 94 ? '#fef3c7' : '#fee2e2',
                                        color: provider.rate >= 96 ? '#059669' : provider.rate >= 94 ? '#d97706' : '#dc2626'
                                    }}>
                                        {provider.rate}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, icon, color, trendInverse = false }) {
    const isPositive = trendInverse ? trend < 0 : trend > 0;
    const trendColor = isPositive ? '#10b981' : '#ef4444';
    const trendPrefix = trend > 0 ? '+' : '';

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${color}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{title}</span>
                <span style={{ fontSize: '24px' }}>{icon}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                {value}
            </div>
            <div style={{ fontSize: '13px', color: trendColor, fontWeight: '600' }}>
                {trendPrefix}{trend}% vs last period
            </div>
        </div>
    );
}

/**
 * ADMIN SETTINGS
 * Configuration panel for RCM system
 */

export function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        practiceName: 'South Carolina Coastal Medical Center',
        practiceNPI: '1234567890',
        practiceTIN: '12-3456789',
        defaultPOS: '11',
        autoEligibility: true,
        eligibilityBatchTime: '02:00',
        cleanClaimThreshold: 95,
        denialAlertThreshold: 10,
        requireAuthForHighCost: true,
        highCostThreshold: 500
    });

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'billing', label: 'Billing', icon: '💳' },
        { id: 'eligibility', label: 'Eligibility', icon: '✓' },
        { id: 'alerts', label: 'Alerts', icon: '🔔' },
        { id: 'users', label: 'Users', icon: '👥' }
    ];

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0004d0', margin: '0 0 24px 0' }}>
                ⚙️ System Settings
            </h1>

            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Sidebar */}
                <div style={{
                    width: '220px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    height: 'fit-content'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: activeTab === tab.id ? '#f3e8ff' : 'transparent',
                                color: activeTab === tab.id ? '#a941c6' : '#64748b',
                                border: 'none',
                                borderRadius: '8px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {activeTab === 'general' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                General Settings
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <SettingField
                                    label="Practice Name"
                                    value={settings.practiceName}
                                    onChange={(v) => updateSetting('practiceName', v)}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <SettingField
                                        label="Practice NPI"
                                        value={settings.practiceNPI}
                                        onChange={(v) => updateSetting('practiceNPI', v)}
                                    />
                                    <SettingField
                                        label="Practice TIN"
                                        value={settings.practiceTIN}
                                        onChange={(v) => updateSetting('practiceTIN', v)}
                                    />
                                </div>
                                <SettingField
                                    label="Default Place of Service"
                                    value={settings.defaultPOS}
                                    type="select"
                                    options={[
                                        { value: '11', label: '11 - Office' },
                                        { value: '21', label: '21 - Inpatient Hospital' },
                                        { value: '22', label: '22 - Outpatient Hospital' },
                                        { value: '23', label: '23 - Emergency Room' }
                                    ]}
                                    onChange={(v) => updateSetting('defaultPOS', v)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                Billing Settings
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <SettingToggle
                                    label="Require Authorization for High-Cost Procedures"
                                    value={settings.requireAuthForHighCost}
                                    onChange={(v) => updateSetting('requireAuthForHighCost', v)}
                                />
                                <SettingField
                                    label="High-Cost Threshold ($)"
                                    value={settings.highCostThreshold}
                                    type="number"
                                    onChange={(v) => updateSetting('highCostThreshold', parseInt(v))}
                                />
                                <SettingField
                                    label="Clean Claim Rate Target (%)"
                                    value={settings.cleanClaimThreshold}
                                    type="number"
                                    onChange={(v) => updateSetting('cleanClaimThreshold', parseInt(v))}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'eligibility' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                Eligibility Settings
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <SettingToggle
                                    label="Enable Automatic Eligibility Checks"
                                    value={settings.autoEligibility}
                                    onChange={(v) => updateSetting('autoEligibility', v)}
                                />
                                <SettingField
                                    label="Batch Eligibility Run Time"
                                    value={settings.eligibilityBatchTime}
                                    type="time"
                                    onChange={(v) => updateSetting('eligibilityBatchTime', v)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                Alert Settings
                            </h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <SettingField
                                    label="Denial Rate Alert Threshold (%)"
                                    value={settings.denialAlertThreshold}
                                    type="number"
                                    onChange={(v) => updateSetting('denialAlertThreshold', parseInt(v))}
                                    hint="Alert when denial rate exceeds this threshold"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>
                                User Management
                            </h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Admin User', email: 'admin@clinic.com', role: 'Administrator', active: true },
                                        { name: 'Jane Smith', email: 'jane@clinic.com', role: 'Billing Manager', active: true },
                                        { name: 'John Doe', email: 'john@clinic.com', role: 'Front Desk', active: true }
                                    ].map((user, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '600' }}>{user.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                                            </td>
                                            <td style={{ padding: '12px' }}>{user.role}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    backgroundColor: '#d1fae5',
                                                    color: '#059669'
                                                }}>
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Save Button */}
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                        <button style={{
                            padding: '14px 32px',
                            backgroundColor: '#a941c6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingField({ label, value, onChange, type = 'text', options, hint }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#0f172a' }}>
                {label}
            </label>
            {type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}
                />
            )}
            {hint && <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>{hint}</p>}
        </div>
    );
}

function SettingToggle({ label, value, onChange }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{label}</span>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: '50px',
                    height: '28px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: value ? '#a941c6' : '#e2e8f0',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s'
                }}
            >
                <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: '3px',
                    left: value ? '25px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
            </button>
        </div>
    );
}

export default ReportsDashboard;
