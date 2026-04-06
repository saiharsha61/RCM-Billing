import React, { useState, useMemo } from 'react';
import mockData from '../lib/mockData';
import {
    calculateDenialRisk,
    getDenialRiskCategory,
    calculatePropensityToPay,
    getPropensityCategory
} from '../lib/aiScoringEngine';

/**
 * REPORTS DASHBOARD
 * Analytics and reporting for RCM operations
 */

export function ReportsDashboard() {
    const [dateRange, setDateRange] = useState('mtd'); // 7d, 30d, 90d, mtd, ytd
    const [selectedReport, setSelectedReport] = useState('overview');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai-insights'
    const [roleView, setRoleView] = useState('admin'); // admin | frontdesk | billing | coding | provider | authorizations

    // Scale factor for date range (applied to trend/volume metrics for display)
    const rangeScale = { '7d': 0.23, '30d': 1, '90d': 3, 'mtd': 1, 'ytd': 12 }[dateRange] || 1;

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

    // --- CSV Export ---
    const handleExportCSV = () => {
        const rows = [
            ['Metric', 'Value', 'Trend'],
            ['Clean Claim Rate', `${metrics.cleanClaimRate}%`, `${metrics.cleanClaimTrend}%`],
            ['Days in A/R', metrics.daysInAR, `${metrics.daysInARTrend}%`],
            ['Denial Rate', `${metrics.denialRate}%`, `${metrics.denialRateTrend}%`],
            ['Collection Rate', `${metrics.collectionRate}%`, `${metrics.collectionTrend}%`],
            ['', '', ''],
            ['Denial Category', 'Count', 'Amount'],
            ...denialsByCategory.map(d => [d.category, d.count, `$${d.amount}`]),
            ['', '', ''],
            ['Provider', 'Charges', 'Collection Rate'],
            ...providerPerformance.map(p => [p.provider, `$${p.charges}`, `${p.rate}%`])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rcm-report-${dateRange}-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Role view selector */}
                    {[
                        { id: 'admin', label: '🏢 Admin', color: '#0004d0' },
                        { id: 'frontdesk', label: '🏥 Front Desk', color: '#0891b2' },
                        { id: 'billing', label: '💰 Billing', color: '#16a34a' },
                        { id: 'coding', label: '💻 Coding', color: '#7c3aed' },
                        { id: 'provider', label: '👨‍⚕️ Provider', color: '#d97706' },
                        { id: 'authorizations', label: '🔐 Auth Team', color: '#dc2626' },
                    ].map(role => (
                        <button key={role.id} onClick={() => setRoleView(role.id)} style={{
                            padding: '6px 12px', border: `2px solid ${roleView === role.id ? role.color : '#e2e8f0'}`,
                            borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                            backgroundColor: roleView === role.id ? role.color : 'white',
                            color: roleView === role.id ? 'white' : '#64748b',
                            transition: 'all 0.2s',
                        }}>{role.label}</button>
                    ))}
                    <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0', margin: '0 4px' }} />

                    {['7d', '30d', '90d', 'mtd', 'ytd'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            style={{
                                padding: '8px 14px',
                                backgroundColor: dateRange === range ? '#a941c6' : 'white',
                                color: dateRange === range ? 'white' : '#64748b',
                                border: `2px solid ${dateRange === range ? '#a941c6' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '11px'
                            }}
                        >
                            {range === 'mtd' ? 'MTD' : range === 'ytd' ? 'YTD' : range}
                        </button>
                    ))}
                    <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0', margin: '0 4px' }} />
                    <button
                        onClick={handleExportCSV}
                        style={{
                            padding: '8px 14px', backgroundColor: 'white', color: '#0004d0',
                            border: '2px solid #0004d0', borderRadius: '8px',
                            fontWeight: '600', cursor: 'pointer', fontSize: '11px'
                        }}
                    >⬇ CSV</button>
                    <button
                        onClick={() => window.print()}
                        style={{
                            padding: '8px 14px', backgroundColor: 'white', color: '#475569',
                            border: '2px solid #e2e8f0', borderRadius: '8px',
                            fontWeight: '600', cursor: 'pointer', fontSize: '11px'
                        }}
                    >🖨️ Print</button>
                </div>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
                {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'ai-insights', label: '🤖 AI Insights' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                            color: activeTab === tab.id ? '#a941c6' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >{tab.label}</button>
                ))}
            </div>

            {activeTab === 'ai-insights' && <AIInsightsTab dateRange={dateRange} rangeScale={rangeScale} metrics={metrics} denialsByCategory={denialsByCategory} />}

            {/* Role-based view — replaces overview when non-admin role is selected */}
            {roleView !== 'admin' && activeTab === 'overview' && <RoleDashboard role={roleView} metrics={metrics} denialsByCategory={denialsByCategory} />}

            {activeTab === 'overview' && roleView === 'admin' && <>
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
            </>}
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

// =====================================================
// AI INSIGHTS TAB
// =====================================================

function AIInsightsTab({ dateRange, rangeScale, metrics, denialsByCategory }) {
    const { claims, patients, serviceAuthorizations } = mockData;

    // Build denial risk rows from existing claims + patients
    const denialRiskRows = useMemo(() => {
        return claims.map(claim => {
            const patient = patients.find(p => p.PatientID === claim.PatientID);
            const mappedClaim = {
                requires_authorization: !!claim.AuthorizationNo,
                authorization_number: claim.AuthorizationNo,
                rendering_provider_npi: claim.RenderingProviderID ? 'set' : null,
                place_of_service: '11',
                diagnosis_codes: [],
                service_date: claim.ServiceDateFrom,
                date_of_service: claim.ServiceDateFrom
            };
            const riskScore = calculateDenialRisk(mappedClaim, {}, patient || {});
            const category = getDenialRiskCategory(riskScore);
            return {
                claimNo: claim.ClaimNumber,
                patientName: patient ? `${patient.FirstName} ${patient.LastName}` : 'Unknown',
                amount: claim.TotalCharges,
                status: claim.ClaimStatus,
                riskScore,
                category
            };
        });
    }, [claims, patients]);

    // Auth approval probability from serviceAuthorizations
    const authRows = useMemo(() => {
        return serviceAuthorizations.map(auth => {
            const prob = auth.status === 'Approved' ? 92
                : auth.status === 'Pending' ? 61
                : auth.status === 'Denied' ? 8 : 45;
            return { ...auth, probability: prob };
        });
    }, [serviceAuthorizations]);

    // Revenue at risk — reuse denialsByCategory amounts
    const totalAtRisk = denialsByCategory.reduce((s, d) => s + d.amount, 0);

    // Sparkline data — 7 weeks simulated from metrics
    const sparkData = {
        cleanClaim: [91.2, 92.0, 91.8, 93.1, 93.4, 94.0, metrics.cleanClaimRate],
        denialRate: [10.1, 9.8, 9.5, 9.1, 8.8, 8.4, metrics.denialRate],
        firstPass: [88.0, 88.5, 89.2, 89.8, 90.1, 90.5, 91.0]
    };

    const probColor = p => p >= 80 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444';
    const probLabel = p => p >= 80 ? 'High' : p >= 50 ? 'Medium' : 'Low';

    return (
        <div style={{ display: 'grid', gap: '24px' }}>

            {/* Row 1: Denial Risk Scoreboard + Auth Probability */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Denial Risk Scoreboard */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>🚨 Denial Risk Scoreboard</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7f9ff', borderBottom: '2px solid #e3f2fd' }}>
                                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#0004d0' }}>Claim</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', color: '#0004d0' }}>Patient</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right', color: '#0004d0' }}>Amount</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#0004d0' }}>Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {denialRiskRows.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 8px', fontWeight: '600', color: '#6366f1' }}>{row.claimNo}</td>
                                    <td style={{ padding: '10px 8px' }}>{row.patientName}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>${row.amount?.toLocaleString()}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                                            backgroundColor: row.category.color + '20',
                                            color: row.category.color
                                        }}>
                                            {row.category.icon} {row.category.label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Auth Approval Probability */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>✅ Auth Approval Probability</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {authRows.map((auth, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{auth.procedure_description}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{auth.payer} · {auth.authorization_no}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{auth.probability}%</div>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                                        backgroundColor: probColor(auth.probability) + '20',
                                        color: probColor(auth.probability)
                                    }}>
                                        {probLabel(auth.probability)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Revenue at Risk Donut + First-Pass Auth Rate Trend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Revenue at Risk — SVG Donut */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>💸 Revenue at Risk</h2>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <DonutChart segments={denialsByCategory.map((d, i) => ({
                            value: d.amount,
                            color: ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#6b7280'][i],
                            label: d.category
                        }))} total={totalAtRisk} />
                        <div style={{ flex: 1 }}>
                            {denialsByCategory.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                                        backgroundColor: ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#6b7280'][i] }} />
                                    <span style={{ fontSize: '12px', flex: 1 }}>{d.category}</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>${(d.amount/1000).toFixed(0)}K</span>
                                </div>
                            ))}
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>
                                Total at Risk: ${(totalAtRisk/1000).toFixed(0)}K
                            </div>
                        </div>
                    </div>
                </div>

                {/* First-Pass Auth Rate Trend + Sparklines */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>📈 Key Trend Sparklines</h2>
                    <SparklineCard label="Clean Claim Rate" data={sparkData.cleanClaim} color="#10b981" suffix="%" />
                    <SparklineCard label="Denial Rate" data={sparkData.denialRate} color="#ef4444" suffix="%" />
                    <SparklineCard label="First-Pass Auth Rate" data={sparkData.firstPass} color="#a941c6" suffix="%" />
                </div>
            </div>
        </div>
    );
}

// SVG Donut chart (no external dependency)
function DonutChart({ segments, total }) {
    const size = 120, r = 44, cx = 60, cy = 60;
    const circumference = 2 * Math.PI * r;
    const totalVal = segments.reduce((s, seg) => s + seg.value, 0);
    let offset = 0;
    return (
        <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={size} height={size}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="20" />
                {segments.map((seg, i) => {
                    const pct = seg.value / totalVal;
                    const dash = pct * circumference;
                    const elem = (
                        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                            stroke={seg.color} strokeWidth="20"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={-offset * circumference + circumference * 0.25}
                            style={{ transition: 'stroke-dasharray 0.4s' }}
                        />
                    );
                    offset += pct;
                    return elem;
                })}
            </svg>
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)', textAlign: 'center'
            }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>TOTAL</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>${(total/1000).toFixed(0)}K</div>
            </div>
        </div>
    );
}

// Inline SVG sparkline
function SparklineCard({ label, data, color, suffix }) {
    const min = Math.min(...data), max = Math.max(...data);
    const w = 120, h = 36;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(' ');
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const delta = (last - prev).toFixed(1);
    const up = last >= prev;
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', minWidth: '150px' }}>{label}</div>
            <svg width={w} height={h}>
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <div style={{ textAlign: 'right', minWidth: '70px' }}>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>{last}{suffix}</div>
                <div style={{ fontSize: '11px', color: up ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                    {up ? '↑' : '↓'} {Math.abs(delta)}{suffix}
                </div>
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

// =====================================================
// ROLE-BASED DASHBOARD VIEW
// Renders role-specific KPIs when a non-admin role is selected
// =====================================================
function RoleDashboard({ role, metrics, denialsByCategory }) {
    const ROLE_CONFIGS = {
        frontdesk: {
            label: '🏥 Front Desk Dashboard',
            color: '#0891b2',
            bg: '#ecfeff',
            kpis: [
                { icon: '❌', label: 'Failed Eligibility Today', value: '7', trend: null, sub: 'Need insurance update' },
                { icon: '📅', label: 'Scheduled Today', value: '34', trend: '+3', trendUp: true, sub: 'vs yesterday' },
                { icon: '✅', label: 'Checked In', value: '21', trend: null, sub: 'of 34 scheduled' },
                { icon: '⏰', label: 'Avg Wait Time', value: '12 min', trend: '-4 min', trendUp: true, sub: 'under target' },
                { icon: '🔄', label: 'Re-Verifications Due', value: '5', trend: null, sub: 'Expiring in 7 days' },
                { icon: '📋', label: 'Copay Collected', value: '$840', trend: '+$120', trendUp: true, sub: 'Today' },
            ],
            alerts: [
                { type: 'error', msg: '3 patients have inactive coverage — update insurance before appointment' },
                { type: 'warn', msg: '5 eligibilities expire this week — verify before visit' },
            ],
        },
        billing: {
            label: '💰 Billing Dashboard',
            color: '#16a34a',
            bg: '#f0fdf4',
            kpis: [
                { icon: '📤', label: 'Claims Submitted', value: '142', trend: '+18', trendUp: true, sub: 'This week' },
                { icon: '💵', label: 'Payments Posted', value: '$48,200', trend: '+$6,800', trendUp: true, sub: 'This week' },
                { icon: `${metrics.daysInAR}d`, label: 'Days in A/R', value: '', trend: `${metrics.daysInARTrend}`, trendUp: metrics.daysInARTrend < 0, sub: 'vs last period' },
                { icon: '🔴', label: 'A/R > 90 Days', value: '$23,450', trend: '-$2,100', trendUp: true, sub: 'Decreasing ✓' },
                { icon: '💔', label: 'Denial Rate', value: `${metrics.denialRate}%`, trend: `${metrics.denialRateTrend}%`, trendUp: metrics.denialRateTrend < 0, sub: 'vs benchmark 10%' },
                { icon: '📈', label: 'Collection Rate', value: `${metrics.collectionRate}%`, trend: `+${metrics.collectionTrend}%`, trendUp: true, sub: 'Excellent' },
            ],
            alerts: [
                { type: 'warn', msg: `${denialsByCategory.find(d => d.category === 'Eligibility')?.count || 0} eligibility denials pending — highest volume category` },
                { type: 'info', msg: '18 claims approaching timely filing deadline (90 days)' },
            ],
        },
        coding: {
            label: '💻 Coding Dashboard',
            color: '#7c3aed',
            bg: '#faf5ff',
            kpis: [
                { icon: '📝', label: 'Unbilled Encounters', value: '28', trend: '-5', trendUp: true, sub: 'vs yesterday' },
                { icon: '❌', label: 'Coding Denials', value: `${denialsByCategory.find(d => d.category === 'Coding')?.count || 32}`, trend: null, sub: 'This period' },
                { icon: '🔍', label: 'Queries Pending', value: '9', trend: '+2', trendUp: false, sub: 'Provider queries' },
                { icon: '✅', label: 'Clean Claim Rate', value: `${metrics.cleanClaimRate}%`, trend: `+${metrics.cleanClaimTrend}%`, trendUp: true, sub: 'Industry avg 95%' },
                { icon: '⚡', label: 'Avg Coding Time', value: '6.2 min', trend: '-0.8 min', trendUp: true, sub: 'Per encounter' },
                { icon: '📊', label: 'Encounters Coded Today', value: '47', trend: null, sub: 'Daily productivity' },
            ],
            alerts: [
                { type: 'warn', msg: '9 provider queries require response before billing' },
                { type: 'info', msg: '4 high-complexity encounters need secondary review (CC/MCC)' },
            ],
        },
        provider: {
            label: '👨‍⚕️ Provider Dashboard',
            color: '#d97706',
            bg: '#fffbeb',
            kpis: [
                { icon: '🚨', label: 'Med Necessity Denials', value: `${denialsByCategory.find(d => d.category === 'Medical Necessity')?.count || 25}`, trend: null, sub: 'Require clinical docs' },
                { icon: '⏳', label: 'PA Decisions Pending', value: '12', trend: null, sub: 'Awaiting payer response' },
                { icon: '📞', label: 'P2P Reviews Scheduled', value: '3', trend: null, sub: 'This week' },
                { icon: '📋', label: 'Unsigned Notes', value: '6', trend: '-2', trendUp: true, sub: '> 24hrs old' },
                { icon: '💰', label: 'Revenue at Risk', value: `$${denialsByCategory.find(d => d.category === 'Medical Necessity')?.amount?.toLocaleString() || '41,200'}`, trend: null, sub: 'Med necessity denials' },
                { icon: '✅', label: 'Auth Approval Rate', value: '82%', trend: '+5%', trendUp: true, sub: 'Last 30 days' },
            ],
            alerts: [
                { type: 'error', msg: '3 peer-to-peer reviews deadline within 48 hours — action required' },
                { type: 'warn', msg: '6 unsigned encounter notes blocking billing' },
            ],
        },
        authorizations: {
            label: '🔐 Authorizations Dashboard',
            color: '#dc2626',
            bg: '#fff5f5',
            kpis: [
                { icon: '⏰', label: 'Expiring Auths (14d)', value: '2', trend: null, sub: 'Renewal required' },
                { icon: '⏳', label: 'Pending PA Decisions', value: '3', trend: null, sub: 'Awaiting payer' },
                { icon: '🚨', label: 'SLA Breached', value: '1', trend: null, sub: '> 72h unanswered' },
                { icon: '✅', label: 'Approval Rate', value: '80%', trend: '+5%', trendUp: true, sub: 'This period' },
                { icon: '🔄', label: 'Active Appeals', value: '0', trend: null, sub: 'Filed appeals' },
                { icon: '📋', label: 'Auth Denials', value: `${denialsByCategory.find(d => d.category === 'Authorization')?.count || 38}`, trend: null, sub: 'This period' },
            ],
            alerts: [
                { type: 'error', msg: '1 authorization SLA breached — escalate to supervisor immediately' },
                { type: 'warn', msg: '2 authorizations expiring within 14 days — renew now' },
            ],
        },
    };

    const config = ROLE_CONFIGS[role];
    if (!config) return null;

    const alertColors = {
        error: { bg: '#fee2e2', color: '#991b1b', icon: '🔴' },
        warn: { bg: '#fef3c7', color: '#92400e', icon: '⚠️' },
        info: { bg: '#dbeafe', color: '#1e40af', icon: 'ℹ️' },
    };

    return (
        <div style={{ backgroundColor: config.bg, borderRadius: '16px', padding: '24px', border: `1px solid ${config.color}20`, marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: config.color, margin: 0 }}>{config.label}</h2>
                <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: 'white', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>Role View — Admin data visible to all</span>
            </div>

            {/* Alerts */}
            {config.alerts.map((alert, i) => {
                const ac = alertColors[alert.type];
                return (
                    <div key={i} style={{ backgroundColor: ac.bg, color: ac.color, padding: '10px 16px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: '600' }}>
                        {ac.icon} {alert.msg}
                    </div>
                );
            })}

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {config.kpis.map((kpi, i) => (
                    <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '22px', marginBottom: '6px' }}>{kpi.icon}</div>
                        <div style={{ fontSize: kpi.value ? '24px' : '20px', fontWeight: '800', color: config.color }}>{kpi.value || ''}</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginTop: '2px' }}>{kpi.label}</div>
                        {kpi.trend && (
                            <div style={{ fontSize: '12px', color: kpi.trendUp ? '#16a34a' : '#dc2626', marginTop: '4px', fontWeight: '600' }}>
                                {kpi.trendUp ? '▲' : '▼'} {kpi.trend}
                            </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ReportsDashboard;
