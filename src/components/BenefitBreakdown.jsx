import React from 'react';

/**
 * BENEFIT BREAKDOWN COMPONENT
 * Displays detailed benefit calculations with remaining amounts
 * Based on INFINX Patient Access Plus benefit grid
 */

export function BenefitBreakdown({ eligibilityData }) {
    if (!eligibilityData || !eligibilityData.benefits) {
        return null;
    }

    const benefits = eligibilityData.benefits;

    // Calculate remaining amounts
    const deductibleRemaining = (benefits.deductible || 0) - (benefits.deductible_met || 0);
    const oopRemaining = (benefits.max_out_of_pocket || 0) - (benefits.out_of_pocket_met || 0);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Get color based on remaining amount (green = good, red = high remaining)
    const getRemainingColor = (remaining, total) => {
        if (!total || total === 0) return '#64748b';
        const percentage = (remaining / total) * 100;
        if (percentage > 75) return '#dc2626'; // High remaining (bad)
        if (percentage > 25) return '#f59e0b'; // Medium remaining
        return '#16a34a'; // Low remaining (good - almost met)
    };

    return (
        <div style={{
            backgroundColor: '#f8f9fa',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '2px solid #cbd5e1'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: 0
                }}>
                    General Benefits
                </h3>
                <NetworkTypeBadge networkType={benefits.network_type || 'IN-NETWORK'} />
            </div>

            {/* Benefits Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
            }}>
                {/* Deductible */}
                <BenefitItem
                    label="Deductible"
                    value={formatCurrency(benefits.deductible)}
                    subLabel={benefits.deductible_coverage_type || 'FAMILY'}
                />

                {/* Deductible Remaining */}
                <BenefitItem
                    label="Deductible Remaining"
                    value={formatCurrency(deductibleRemaining)}
                    valueColor={getRemainingColor(deductibleRemaining, benefits.deductible)}
                    subLabel={benefits.network_type || 'IN-NETWORK'}
                    isHighlight={true}
                />

                {/* Out of Pocket */}
                <BenefitItem
                    label="Out of Pocket"
                    value={formatCurrency(benefits.max_out_of_pocket)}
                    subLabel={benefits.oop_coverage_type || 'FAMILY'}
                />

                {/* OOP Remaining */}
                <BenefitItem
                    label="OOP Remaining"
                    value={formatCurrency(oopRemaining)}
                    valueColor={getRemainingColor(oopRemaining, benefits.max_out_of_pocket)}
                    subLabel="REMAINING"
                    isHighlight={true}
                />

                {/* Copay (if available) */}
                {benefits.copay && (
                    <>
                        <BenefitItem
                            label="Copay (PCP)"
                            value={formatCurrency(benefits.copay)}
                            subLabel="PER VISIT"
                        />
                        <BenefitItem
                            label="Copay (Specialist)"
                            value={formatCurrency(benefits.specialist_copay)}
                            subLabel="PER VISIT"
                        />
                    </>
                )}

                {/* Coinsurance */}
                {benefits.coinsurance && (
                    <BenefitItem
                        label="Coinsurance"
                        value={`${benefits.coinsurance}%`}
                        subLabel={benefits.network_type || 'IN-NETWORK'}
                    />
                )}
            </div>

            {/* Coverage Type Info */}
            <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#64748b'
            }}>
                <strong>Coverage Type:</strong> {benefits.deductible_coverage_type || 'FAMILY'} |
                <strong style={{ marginLeft: '12px' }}>Network:</strong> {benefits.network_type || 'IN-NETWORK'}
            </div>
        </div>
    );
}

/**
 * Individual Benefit Item
 */
function BenefitItem({ label, value, valueColor = '#0f172a', subLabel, isHighlight = false }) {
    return (
        <div style={{
            backgroundColor: isHighlight ? '#ffffff' : 'transparent',
            padding: isHighlight ? '12px' : '8px',
            borderRadius: isHighlight ? '8px' : '0',
            border: isHighlight ? '2px solid #a941c6' : 'none'
        }}>
            <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: valueColor,
                marginBottom: '4px'
            }}>
                {value}
            </div>
            {subLabel && (
                <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    textTransform: 'uppercase'
                }}>
                    {subLabel}
                </div>
            )}
        </div>
    );
}

/**
 * Network Type Badge
 */
function NetworkTypeBadge({ networkType }) {
    const isInNetwork = networkType === 'IN-NETWORK';

    return (
        <div style={{
            padding: '6px 12px',
            backgroundColor: isInNetwork ? '#d1fae5' : '#fee2e2',
            color: isInNetwork ? '#065f46' : '#991b1b',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {networkType}
        </div>
    );
}
