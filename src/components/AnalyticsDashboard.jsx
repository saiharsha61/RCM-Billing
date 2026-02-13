import React, { useState, useMemo } from 'react';
import mockData from '../lib/mockData';
import { aiScoring } from '../lib/aiScoringEngine';

export function AnalyticsDashboard() {
    console.log('AnalyticsDashboard mounting', { mockData, aiScoring });
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
                    Analytics & Business Intelligence
                </h2>
                <p style={{ color: '#64748b' }}>
                    Revenue Cycle Management performance metrics and operational insights
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'claims', label: 'Claims AI', icon: '🤖' },
                    { id: 'providers', label: 'Providers', icon: '👨‍⚕️' },
                    { id: 'collections', label: 'Collections AI', icon: '💰' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ marginRight: '6px' }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'claims' && <ClaimsAITab />}
            {activeTab === 'providers' && <ProvidersTab />}
            {activeTab === 'collections' && <CollectionsAITab />}
        </div>
    );
}

// KPI Card Component
function KPICard({ title, value, unit, trend, icon, color }) {
    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{title}</div>
                <div style={{ fontSize: '24px' }}>{icon}</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: color, marginBottom: '8px' }}>
                {unit === '$' && '$'}{value}{unit !== '$' && unit}
            </div>
            {trend && (
                <div style={{ fontSize: '13px', color: trend > 0 ? '#10b981' : '#ef4444' }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
                </div>
            )}
        </div>
    );
}

// Overview Tab
function OverviewTab() {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <KPICard title="Days in A/R" value="42" unit=" days" trend={-2.3} icon="📅" color="#3b82f6" />
                <KPICard title="Collection Rate" value="93.5" unit="%" trend={+1.5} icon="💰" color="#10b981" />
                <KPICard title="Denial Rate" value="7.2" unit="%" trend={-0.8} icon="❌" color="#ef4444" />
                <KPICard title="First-Pass Accept" value="88.5" unit="%" trend={+2.1} icon="✅" color="#8b5cf6" />
                <KPICard title="Total Patient Balance" value="89,432" unit="$" trend={-5.2} icon="👤" color="#f59e0b" />
                <KPICard title="Claims Submitted" value="247" unit="" trend={+8.3} icon="📋" color="#06b6d4" />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <ARAgingChart />
                <TopPayersChart />
            </div>
        </div>
    );
}

// Claims AI Tab
function ClaimsAITab() {
    const claimsWithRisk = (mockData.claims || []).map(claim => ({
        ...claim,
        denial_risk: aiScoring.calculateDenialRisk(claim, mockData.medicareOfTexasPayer || {})
    }));

    const highRisk = claimsWithRisk.filter(c => c.denial_risk >= 0.6).length;
    const mediumRisk = claimsWithRisk.filter(c => c.denial_risk >= 0.3 && c.denial_risk < 0.6).length;
    const lowRisk = claimsWithRisk.filter(c => c.denial_risk < 0.3).length;

    return (
        <div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🤖 AI Denial Risk Distribution</h3>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981' }}>{lowRisk}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>Low Risk (&lt; 30%)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f59e0b' }}>{mediumRisk}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>Medium Risk (30-60%)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444' }}>{highRisk}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>High Risk (&gt; 60%)</div>
                    </div>
                </div>
            </div>

            {/* High-Risk Claims Needing Review */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>⚠️ High-Risk Claims Needing Review</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Claim ID</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Patient</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Risk Score</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Issues</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claimsWithRisk.filter(c => c.denial_risk >= 0.6).slice(0, 5).map((claim, i) => {
                            const riskCategory = aiScoring.getDenialRiskCategory(claim.denial_risk);
                            const recommendations = aiScoring.getClaimScrubRecommendations(claim, claim.denial_risk);

                            return (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontWeight: '600' }}>CLM-{claim.claim_id}</td>
                                    <td style={{ padding: '12px' }}>Patient {claim.patient_id}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{
                                            background: riskCategory.color + '20',
                                            color: riskCategory.color,
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {riskCategory.icon} {(claim.denial_risk * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                                        {recommendations.length > 0 ? recommendations[0].message : 'Review required'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Providers Tab
function ProvidersTab() {
    return (
        <div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🩺 Wound Care Specialists (Mission, TX)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {(mockData.woundCareProviders || []).map(provider => (
                        <div key={provider.ProviderID} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                            <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                Dr. {provider.LastName}, {provider.FirstName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                                {provider.SpecialtyType} • NPI: {provider.NPI}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                📍 {provider.facility}, {provider.city}, {provider.state}
                            </div>
                            <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '8px' }}>
                                📞 {provider.Phone} • ✉️ {provider.Email}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Provider Performance */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📊 Provider Productivity (Last 30 Days)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Provider</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Encounters</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Revenue</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Avg E&M</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...(mockData.providers || []), ...(mockData.woundCareProviders || [])].slice(0, 7).map((prov, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>Dr. {prov.LastName}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{prov.SpecialtyType}</div>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{Math.floor(Math.random() * 80) + 20}</td>
                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>${((Math.random() * 40000) + 20000).toFixed(0).toLocaleString()}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{(Math.random() * 2 + 3).toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}

// Collections AI Tab
function CollectionsAITab() {
    const patientsWithScores = [mockData.pedroSuarezPatient, ...(mockData.patients || [])].filter(Boolean).map(p => ({
        ...p,
        propensity_score: p.propensity_to_pay_score || aiScoring.calculatePropensityToPay(p, p.PatientBalance || 0)
    })).sort((a, b) => a.propensity_score - b.propensity_score);

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Patient Balance</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>$89,432</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏥</div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Insurance Balance</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>$195,000</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Total A/R</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>$284,432</div>
                </div>
            </div>

            {/* AI Collection Priority */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🤖 AI-Driven Collection Priority</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Patient</th>
                            <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Balance</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Propensity Score</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Strategy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patientsWithScores.slice(0, 10).map((patient, i) => {
                            const category = aiScoring.getPropensityCategory(patient.propensity_score);
                            const strategy = aiScoring.getContactStrategy(patient.propensity_score, patient);

                            return (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{patient.FirstName} {patient.LastName}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>MRN: {patient.AccountNumber}</div>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                                        ${(patient.PatientBalance || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{
                                            background: category.color + '20',
                                            color: category.color,
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {category.icon} {(patient.propensity_score * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                                        {strategy.strategy}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Simple AR Aging Chart
function ARAgingChart() {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>A/R Aging Buckets</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
                {[
                    { label: '0-30', amount: 45, color: '#10b981' },
                    { label: '31-60', amount: 28, color: '#3b82f6' },
                    { label: '61-90', amount: 15, color: '#f59e0b' },
                    { label: '91+', amount: 12, color: '#ef4444' }
                ].map((bucket, i) => {
                    const maxAmount = 45;
                    const height = (bucket.amount / maxAmount) * 100;

                    return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '100%',
                                height: `${height}%`,
                                background: bucket.color,
                                borderRadius: '4px 4px 0 0',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '8px 0'
                            }}>
                                ${bucket.amount}K
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                                {bucket.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Top Payers Chart
function TopPayersChart() {
    const payers = [
        { name: 'Medicare', amount: 125, color: '#3b82f6' },
        { name: 'Commercial', amount: 95, color: '#10b981' },
        { name: 'Medicaid', amount: 45, color: '#f59e0b' }
    ];

    const total = payers.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Revenue by Payer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {payers.map((payer, i) => {
                    const percentage = (payer.amount / total) * 100;

                    return (
                        <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{payer.name}</span>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                                    ${payer.amount}K ({percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${percentage}%`, height: '100%', background: payer.color, borderRadius: '4px' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
