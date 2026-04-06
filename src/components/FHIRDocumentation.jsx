import React, { useState } from 'react';
import { fhirServer } from '../lib/fhirServer';
import { fhirAuth } from '../lib/fhirAuth';
import { routeDenial, DENIAL_ROUTING_RULES, CARC_DESCRIPTIONS } from '../lib/denialRouter';

export function FHIRDocumentation() {
    const [activeTab, setActiveTab] = useState('overview');
    const [testEndpoint, setTestEndpoint] = useState('');
    const [testMethod, setTestMethod] = useState('GET');
    const [testParams, setTestParams] = useState('');
    const [testResult, setTestResult] = useState(null);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
                    FHIR R4 API Documentation
                </h2>
                <p style={{ color: '#64748b' }}>
                    Fast Healthcare Interoperability Resources (FHIR) RESTful API for healthcare data exchange
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: '📋' },
                    { id: 'auth', label: 'Authentication', icon: '🔐' },
                    { id: 'endpoints', label: 'Endpoints', icon: '🔌' },
                    { id: 'examples', label: 'Examples', icon: '💡' },
                    { id: 'tester', label: 'API Tester', icon: '🧪' },
                    { id: 'denials', label: 'Denials API', icon: '⚖️' }
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

            {/* Tab Content */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'auth' && <AuthenticationTab />}
                {activeTab === 'endpoints' && <EndpointsTab />}
                {activeTab === 'examples' && <ExamplesTab />}
                {activeTab === 'tester' && <APITesterTab />}
                {activeTab === 'denials' && <DenialsAPITab />}
            </div>
        </div>
    );
}

// =====================================================
// OVERVIEW TAB
// =====================================================

function OverviewTab() {
    return (
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>What is FHIR?</h3>

            <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                <strong>FHIR (Fast Healthcare Interoperability Resources)</strong> is a standard for exchanging healthcare
                information electronically. It defines a set of "Resources" that represent granular clinical concepts like
                Patient, Observation, Condition, and MedicationRequest.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #3b82f6' }}>
                <strong style={{ color: '#1e293b', display: 'block', marginBottom: '8px' }}>Base URL</strong>
                <code style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    http://localhost:5174/fhir
                </code>
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>Supported Resources</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {[
                    { name: 'Patient', icon: '👤', desc: 'Demographics, identifiers, contact information' },
                    { name: 'Observation', icon: '📊', desc: 'Vitals, lab results with LOINC codes' },
                    { name: 'Condition', icon: '🏥', desc: 'Diagnoses, problems with ICD-10 codes' },
                    { name: 'MedicationRequest', icon: '💊', desc: 'Prescriptions with RxNorm/NDC codes' },
                    { name: 'DocumentReference', icon: '📄', desc: 'Scanned documents, clinical notes' }
                ].map(resource => (
                    <div key={resource.name} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{resource.icon}</div>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{resource.name}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>{resource.desc}</div>
                    </div>
                ))}
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>FHIR Version</h4>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
                This API implements <strong>FHIR R4 (v4.0.1)</strong>, the most widely adopted version.
            </p>
        </div>
    );
}

// =====================================================
// AUTHENTICATION TAB
// =====================================================

function AuthenticationTab() {
    const [token, setToken] = useState(null);

    const generateToken = () => {
        const demoToken = fhirAuth.generateDemoToken();
        setToken(demoToken);
    };

    return (
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>OAuth 2.0 / SMART on FHIR</h3>

            <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                This API uses <strong>OAuth 2.0 authorization code flow</strong> with SMART on FHIR extensions
                for healthcare-specific scopes and launch contexts.
            </p>

            <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #f59e0b' }}>
                <strong style={{ color: '#78350f', display: 'block', marginBottom: '8px' }}>⚠️ Demo Mode</strong>
                <div style={{ color: '#92400e', fontSize: '14px' }}>
                    This is a <strong>mock implementation</strong> for demonstration purposes. In production,
                    use a certified OAuth provider (Auth0, Okta, Azure AD).
                </div>
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>Authentication Flow</h4>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {[
                    { step: '1', title: 'Authorization Request', endpoint: 'GET /fhir/authorize', desc: 'Redirect user to authorization server' },
                    { step: '2', title: 'User Login & Consent', endpoint: 'Sign In Page', desc: 'User authenticates and grants permissions' },
                    { step: '3', title: 'Authorization Code', endpoint: 'Redirect to callback', desc: 'Server returns authorization code' },
                    { step: '4', title: 'Token Exchange', endpoint: 'POST /fhir/token', desc: 'Exchange code for access token' },
                    { step: '5', title: 'API Request', endpoint: 'GET /fhir/Patient/:id', desc: 'Use bearer token in Authorization header' }
                ].map(item => (
                    <div key={item.step} style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            {item.step}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{item.title}</div>
                            <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}>
                                {item.endpoint}
                            </code>
                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{item.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>SMART Scopes</h4>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Scope</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { scope: 'patient/*.read', desc: 'Read all resources for a specific patient' },
                        { scope: 'patient/Patient.read', desc: 'Read only Patient resources' },
                        { scope: 'patient/Observation.read', desc: 'Read only Observation resources' },
                        { scope: 'user/*.read', desc: 'Read all resources for which the user has access' },
                        { scope: 'launch/patient', desc: 'Request patient context during launch' },
                        { scope: 'offline_access', desc: 'Request refresh token for long-term access' }
                    ].map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px' }}>
                                <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                    {item.scope}
                                </code>
                            </td>
                            <td style={{ padding: '12px', color: '#475569' }}>{item.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px' }}>Demo Token Generator</h4>

            <button
                onClick={generateToken}
                style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    marginBottom: '16px'
                }}
            >
                Generate Demo Token
            </button>

            {token && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Access Token:</strong>
                    <code style={{
                        background: '#1e293b',
                        color: '#10b981',
                        padding: '12px',
                        borderRadius: '6px',
                        display: 'block',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        overflowX: 'auto'
                    }}>
                        {token.access_token}
                    </code>
                    <div style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>
                        <strong>Scope:</strong> {token.scope} <br />
                        <strong>Expires in:</strong> {token.expires_in} seconds <br />
                        <strong>Patient Context:</strong> {token.patient}
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================================
// ENDPOINTS TAB
// =====================================================

function EndpointsTab() {
    const [expandedEndpoint, setExpandedEndpoint] = useState(null);

    const endpoints = [
        {
            category: 'Metadata',
            items: [
                {
                    method: 'GET',
                    path: '/fhir/metadata',
                    desc: 'Get FHIR CapabilityStatement',
                    params: [],
                    example: 'curl http://localhost:5174/fhir/metadata'
                }
            ]
        },
        {
            category: 'Patient',
            items: [
                {
                    method: 'GET',
                    path: '/fhir/Patient/:id',
                    desc: 'Read patient by ID',
                    params: [],
                    example: 'curl http://localhost:5174/fhir/Patient/patient-9609 \\\n  -H "Authorization: Bearer {token}"'
                },
                {
                    method: 'GET',
                    path: '/fhir/Patient',
                    desc: 'Search patients',
                    params: ['identifier', 'name', 'birthdate', 'gender', '_count', '_offset'],
                    example: 'curl "http://localhost:5174/fhir/Patient?name=Suarez&_count=10" \\\n  -H "Authorization: Bearer {token}"'
                }
            ]
        },
        {
            category: 'Observation',
            items: [
                {
                    method: 'GET',
                    path: '/fhir/Observation/:id',
                    desc: 'Read observation by ID',
                    params: [],
                    example: 'curl http://localhost:5174/fhir/Observation/obs-bp-123'
                },
                {
                    method: 'GET',
                    path: '/fhir/Observation',
                    desc: 'Search observations',
                    params: ['patient', 'category', 'code', 'date', '_count'],
                    example: 'curl "http://localhost:5174/fhir/Observation?patient=patient-9609&category=vital-signs"'
                }
            ]
        },
        {
            category: 'Condition',
            items: [
                {
                    method: 'GET',
                    path: '/fhir/Condition',
                    desc: 'Search conditions (diagnoses)',
                    params: ['patient', 'category', 'clinical-status', 'code'],
                    example: 'curl "http://localhost:5174/fhir/Condition?patient=patient-9609&clinical-status=active"'
                }
            ]
        },
        {
            category: 'MedicationRequest',
            items: [
                {
                    method: 'GET',
                    path: '/fhir/MedicationRequest',
                    desc: 'Search medication requests',
                    params: ['patient', 'status', 'authoredon'],
                    example: 'curl "http://localhost:5174/fhir/MedicationRequest?patient=patient-9609&status=active"'
                }
            ]
        }
    ];

    return (
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>API Endpoints</h3>

            {endpoints.map((category, i) => (
                <div key={i} style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {category.category}
                    </h4>

                    {category.items.map((endpoint, j) => {
                        const key = `${i}-${j}`;
                        const isExpanded = expandedEndpoint === key;

                        return (
                            <div key={j} style={{ background: '#f8fafc', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                                <div
                                    onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                                    style={{
                                        padding: '16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            background: endpoint.method === 'GET' ? '#10b981' : '#3b82f6',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {endpoint.method}
                                        </span>
                                        <code style={{ fontFamily: 'monospace', fontSize: '14px', color: '#1e293b' }}>
                                            {endpoint.path}
                                        </code>
                                    </div>
                                    <span>{isExpanded ? '▼' : '▶'}</span>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', marginBottom: '12px', marginTop: '12px' }}>{endpoint.desc}</p>

                                        {endpoint.params.length > 0 && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block', marginBottom: '8px' }}>Query Parameters:</strong>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {endpoint.params.map(param => (
                                                        <code key={param} style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                            {param}
                                                        </code>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block', marginBottom: '8px' }}>Example Request:</strong>
                                        <pre style={{
                                            background: '#1e293b',
                                            color: '#10b981',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            overflowX: 'auto',
                                            fontFamily: 'monospace',
                                            margin: 0
                                        }}>
                                            {endpoint.example}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// =====================================================
// EXAMPLES TAB
// =====================================================

function ExamplesTab() {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const examples = [
        {
            title: 'Get Patient Resource',
            request: `GET /fhir/Patient/patient-9609
Authorization: Bearer {access_token}`,
            response: `{
  "resourceType": "Patient",
  "id": "patient-9609",
  "identifier": [{
    "system": "http://hospital.example.org/mrn",
    "value": "9609"
  }],
  "name": [{
    "family": "Suarez",
    "given": ["Pedro"]
  }],
  "gender": "male",
  "birthDate": "1974-06-23",
  "address": [{
    "line": ["5505 LUCY DR"],
    "city": "MISSION",
    "state": "TX",
    "postalCode": "78574-6225"
  }]
}`
        },
        {
            title: 'Search Vital Signs for Patient',
            request: `GET /fhir/Observation?patient=patient-9609&category=vital-signs&_count=5
Authorization: Bearer {access_token}`,
            response: `{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 2,
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "id": "obs-bp-456",
        "status": "final",
        "category": [{
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "vital-signs"
          }]
        }],
        "code": {
          "coding": [{
            "system": "http://loinc.org",
            "code": "85354-9",
            "display": "Blood pressure panel"
          }]
        },
        "component": [
          {
            "code": {
              "coding": [{
                "system": "http://loinc.org",
                "code": "8480-6",
                "display": "Systolic blood pressure"
              }]
            },
            "valueQuantity": {
              "value": 120,
              "unit": "mmHg"
            }
          },
          {
            "code": {
              "coding": [{
                "system": "http://loinc.org",
                "code": "8462-4",
                "display": "Diastolic blood pressure"
              }]
            },
            "valueQuantity": {
              "value": 80,
              "unit": "mmHg"
            }
          }
        ]
      }
    }
  ]
}`
        }
    ];

    return (
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Request/Response Examples</h3>

            {examples.map((example, i) => (
                <div key={i} style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
                        {example.title}
                    </h4>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '14px', color: '#64748b' }}>Request</strong>
                            <button
                                onClick={() => copyToClipboard(example.request, `req-${i}`)}
                                style={{
                                    background: copiedIndex === `req-${i}` ? '#10b981' : '#64748b',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {copiedIndex === `req-${i}` ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre style={{
                            background: '#1e293b',
                            color: '#10b981',
                            padding: '16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            overflowX: 'auto',
                            fontFamily: 'monospace',
                            margin: 0
                        }}>
                            {example.request}
                        </pre>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '14px', color: '#64748b' }}>Response</strong>
                            <button
                                onClick={() => copyToClipboard(example.response, `res-${i}`)}
                                style={{
                                    background: copiedIndex === `res-${i}` ? '#10b981' : '#64748b',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {copiedIndex === `res-${i}` ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <pre style={{
                            background: '#1e293b',
                            color: '#3b82f6',
                            padding: '16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            overflowX: 'auto',
                            fontFamily: 'monospace',
                            margin: 0
                        }}>
                            {example.response}
                        </pre>
                    </div>
                </div>
            ))}
        </div>
    );
}

// =====================================================
// API TESTER TAB
// =====================================================

function APITesterTab() {
    const [endpoint, setEndpoint] = useState('/fhir/metadata');
    const [method, setMethod] = useState('GET');
    const [params, setParams] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const executeRequest = () => {
        setLoading(true);
        setResult(null);

        setTimeout(() => {
            try {
                let response;

                // Parse params
                const parsedParams = params ? JSON.parse(`{${params}}`) : {};

                // Route to appropriate endpoint
                if (endpoint.includes('/metadata')) {
                    response = fhirServer.getCapabilityStatement();
                } else if (endpoint.includes('/Patient') && method === 'GET') {
                    if (endpoint.includes('?') || Object.keys(parsedParams).length > 0) {
                        response = fhirServer.searchPatients(parsedParams);
                    } else {
                        const id = endpoint.split('/').pop();
                        response = fhirServer.readPatient(id);
                    }
                } else if (endpoint.includes('/Observation')) {
                    response = fhirServer.searchObservations(parsedParams);
                } else if (endpoint.includes('/Condition')) {
                    response = fhirServer.searchConditions(parsedParams);
                } else {
                    response = {
                        status: 404,
                        body: { error: 'Endpoint not found' }
                    };
                }

                setResult({
                    status: response.status,
                    body: JSON.stringify(response.body, null, 2)
                });
            } catch (error) {
                setResult({
                    status: 500,
                    body: JSON.stringify({ error: error.message }, null, 2)
                });
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Interactive API Tester</h3>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                    Method
                </label>
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px'
                    }}
                >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                    Endpoint
                </label>
                <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/fhir/Patient/patient-9609"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                    }}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                    Query Parameters (JSON format, without braces)
                </label>
                <textarea
                    value={params}
                    onChange={(e) => setParams(e.target.value)}
                    placeholder='"patient": "patient-9609", "category": "vital-signs"'
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        minHeight: '80px',
                        resize: 'vertical'
                    }}
                />
            </div>

            <button
                onClick={executeRequest}
                disabled={loading}
                style={{
                    background: loading ? '#94a3b8' : '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    marginBottom: '24px'
                }}
            >
                {loading ? 'Executing...' : 'Execute Request'}
            </button>

            {result && (
                <div>
                    <div style={{
                        background: result.status === 200 ? '#d1fae5' : '#fee2e2',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '600', color: result.status === 200 ? '#065f46' : '#991b1b' }}>
                            Status: {result.status}
                        </span>
                        <span style={{ fontSize: '14px', color: result.status === 200 ? '#047857' : '#dc2626' }}>
                            {result.status === 200 ? '✓ Success' : '✗ Error'}
                        </span>
                    </div>

                    <div>
                        <strong style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Response Body:</strong>
                        <pre style={{
                            background: '#1e293b',
                            color: '#3b82f6',
                            padding: '16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            overflowX: 'auto',
                            fontFamily: 'monospace',
                            margin: 0,
                            maxHeight: '400px',
                            overflow: 'auto'
                        }}>
                            {result.body}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================================
// DENIALS API TAB
// =====================================================
function DenialsAPITab() {
    const [carcLookup, setCarcLookup] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [activeSection, setActiveSection] = useState('routing');

    const PRIORITY_COLORS = { high: { bg: '#fee2e2', color: '#991b1b', label: '🔴 High' }, medium: { bg: '#fef3c7', color: '#92400e', label: '🟡 Medium' }, low: { bg: '#dcfce7', color: '#166534', label: '🟢 Low' } };
    const DEPT_ICONS = { 'Front Desk': '🏥', 'Coding': '💻', 'Provider': '👨‍⚕️', 'Authorizations': '🔐', 'Billing': '💰', 'Registration': '📝', 'Contracting': '📄' };

    const handleLookup = () => {
        const code = carcLookup.trim();
        if (!code) return;
        const result = routeDenial({ reasonCode: code, claimId: 'DEMO-001', patientName: 'Demo Patient', amount: 1000, denialDate: new Date().toISOString() });
        setLookupResult(result);
    };

    const sections = [
        { id: 'routing', label: 'Routing Rules' },
        { id: 'medical', label: 'Medical Necessity' },
        { id: 'endpoints', label: 'JS API Reference' },
        { id: 'examples', label: 'JSON Examples' },
        { id: 'lookup', label: '🔍 CARC Lookup' },
    ];

    const subTabStyle = (id) => ({
        padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
        backgroundColor: activeSection === id ? '#dc2626' : '#f1f5f9',
        color: activeSection === id ? 'white' : '#475569',
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>⚖️ Denials Management API</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>CARC-based routing engine · Medical necessity · Multi-department workflow</p>
                </div>
                <span style={{ marginLeft: 'auto', padding: '4px 12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>RCM Core</span>
            </div>

            {/* Sub-nav */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {sections.map(s => <button key={s.id} style={subTabStyle(s.id)} onClick={() => setActiveSection(s.id)}>{s.label}</button>)}
            </div>

            {/* ROUTING RULES */}
            {activeSection === 'routing' && (
                <div>
                    <p style={{ color: '#475569', marginBottom: '16px', fontSize: '14px', lineHeight: '1.6' }}>
                        The denial router maps <strong>CARC (Claim Adjustment Reason Codes)</strong> to the correct department, SLA, and priority. Each incoming denial is automatically classified into one of 7 categories.
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    {['Category', 'Department', 'Priority', 'SLA', 'CARC Codes', 'Description'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(DENIAL_ROUTING_RULES).map(([cat, rule], i) => {
                                    const pc = PRIORITY_COLORS[rule.priority];
                                    return (
                                        <tr key={cat} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' }}>{cat.replace(/([A-Z])/g, ' $1')}</td>
                                            <td style={{ padding: '10px 12px' }}>{DEPT_ICONS[rule.department] || ''} {rule.department}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', backgroundColor: pc.bg, color: pc.color }}>{pc.label}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: '600' }}>{rule.sla}h</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '200px' }}>
                                                    {rule.codes.slice(0, 6).map(c => <code key={c} style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>{c}</code>)}
                                                    {rule.codes.length > 6 && <span style={{ fontSize: '11px', color: '#94a3b8' }}>+{rule.codes.length - 6} more</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px' }}>{rule.description}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MEDICAL NECESSITY */}
            {activeSection === 'medical' && (
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>🏥 Medical Necessity Denials</h4>
                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
                        Medical necessity denials occur when a payer determines that a service is not medically necessary based on <strong>LCD (Local Coverage Determinations)</strong> or <strong>NCD (National Coverage Determinations)</strong>. These route to the <strong>Provider department</strong> with a 72-hour SLA.
                    </p>
                    {[
                        { title: 'CARC 50 — Non-covered services', carc: '50', msg: 'These are services not covered by the payer for this diagnosis. Review the LCD/NCD for the CPT code billed.', action: 'Appeal with medical record + clinical justification letter' },
                        { title: 'CARC 167 — Diagnosis not covered', carc: '167', msg: 'The ICD-10 diagnosis code billed does not support medical necessity under the applicable LCD.', action: 'Review supported ICD-10 codes in LCD. If clinically appropriate, re-code or obtain peer-to-peer.' },
                        { title: 'CARC 197 — Authorization required', carc: '197', msg: 'Service required prior authorization that was not obtained or not valid.', action: 'Check if retroactive auth is available. Submit appeal with original auth documentation.' },
                        { title: 'CARC A1 — Services not medically necessary', carc: 'A1', msg: 'Clinical documentation did not support the level or type of service.', action: 'Request peer-to-peer review with payer medical director within 72 hours.' },
                    ].map(item => (
                        <div key={item.carc} style={{ backgroundColor: 'white', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{item.title}</strong>
                                <code style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>CARC {item.carc}</code>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px 0' }}>{item.msg}</p>
                            <div style={{ backgroundColor: '#fef3c7', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                                <strong>Recommended Action:</strong> {item.action}
                            </div>
                        </div>
                    ))}
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
                        <strong style={{ color: '#166534', display: 'block', marginBottom: '8px' }}>📚 LCD/NCD Resources</strong>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#15803d', fontSize: '13px', lineHeight: '1.8' }}>
                            <li>CMS LCD Database: <code style={{ backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '3px' }}>cms.gov/medicare-coverage-database</code></li>
                            <li>NGS Medicare LCD Lookup: Filter by CPT code and state</li>
                            <li>Noridian, CGS, WPS LCDs for Texas/Southwest jurisdiction</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* JS API REFERENCE */}
            {activeSection === 'endpoints' && (
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>📦 denialRouter.js — API Reference</h4>
                    {[
                        {
                            fn: 'routeDenial(denial)', returns: 'Object',
                            desc: 'Routes a single denial to the appropriate department based on CARC code.',
                            params: [
                                { name: 'denial.reasonCode', type: 'string', desc: 'CARC code (e.g. "197", "50", "A1")' },
                                { name: 'denial.claimId', type: 'string', desc: 'Claim identifier' },
                                { name: 'denial.patientName', type: 'string', desc: 'Patient full name' },
                                { name: 'denial.amount', type: 'number', desc: 'Dollar amount of denied claim' },
                                { name: 'denial.denialDate', type: 'string', desc: 'ISO date string of denial' },
                            ],
                        },
                        {
                            fn: 'batchRouteDenials(denials[])', returns: '{ summary, byDepartment, all }',
                            desc: 'Routes multiple denials and groups results by department.',
                            params: [{ name: 'denials', type: 'Array<denial>', desc: 'Array of denial objects (same shape as routeDenial input)' }],
                        },
                        {
                            fn: 'getDenialStatistics(denials[])', returns: 'Stats Object',
                            desc: 'Returns aggregate stats: counts by dept, priority, category, overdue count.',
                            params: [{ name: 'denials', type: 'Array<routedDenial>', desc: 'Array of already-routed denial objects' }],
                        },
                        {
                            fn: 'createDenialTask(routedDenial)', returns: 'Task Object',
                            desc: 'Creates a structured task with recommended actions from a routed denial.',
                            params: [{ name: 'routedDenial', type: 'Object', desc: 'Output of routeDenial()' }],
                        },
                    ].map(api => (
                        <div key={api.fn} style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <code style={{ backgroundColor: '#1e293b', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px' }}>{api.fn}</code>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>→ <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{api.returns}</code></span>
                            </div>
                            <p style={{ color: '#475569', fontSize: '13px', margin: '8px 0' }}>{api.desc}</p>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead><tr style={{ backgroundColor: '#e2e8f0' }}>
                                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Param</th>
                                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Type</th>
                                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Description</th>
                                </tr></thead>
                                <tbody>{api.params.map(p => (
                                    <tr key={p.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '6px 10px' }}><code style={{ color: '#7c3aed' }}>{p.name}</code></td>
                                        <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#2563eb' }}>{p.type}</td>
                                        <td style={{ padding: '6px 10px', color: '#64748b' }}>{p.desc}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            {/* JSON EXAMPLES */}
            {activeSection === 'examples' && (
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>💡 JSON Request/Response Examples</h4>
                    {[
                        {
                            title: 'Route a Medical Necessity Denial (CARC 197)',
                            req: `routeDenial({
  reasonCode: "197",
  claimId: "CLM-2026-00142",
  patientName: "Pedro Suarez",
  amount: 2850.00,
  denialDate: "2026-03-23T10:00:00Z"
})`,
                            res: `{
  "claimId": "CLM-2026-00142",
  "reasonCode": "197",
  "reasonDescription": "Precertification/authorization/notification required",
  "category": "authorization",
  "department": "Authorizations",
  "priority": "high",
  "sla": 24,
  "dueDate": "2026-03-24T10:00:00Z",
  "status": "new"
}`
                        },
                        {
                            title: 'Batch Route — By Department Summary',
                            req: `batchRouteDenials([
  { reasonCode: "50", amount: 1200 },
  { reasonCode: "97", amount: 450 },
  { reasonCode: "197", amount: 2800 }
]).summary`,
                            res: `{
  "totalDenials": 3,
  "totalAmount": 4450,
  "departments": 3
  // byDepartment: Provider, Billing, Authorizations
}`
                        },
                    ].map((ex, i) => (
                        <div key={i} style={{ marginBottom: '24px' }}>
                            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>{ex.title}</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Request</div>
                                    <pre style={{ backgroundColor: '#1e293b', color: '#10b981', padding: '14px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', margin: 0, overflowX: 'auto' }}>{ex.req}</pre>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Response</div>
                                    <pre style={{ backgroundColor: '#1e293b', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', margin: 0, overflowX: 'auto' }}>{ex.res}</pre>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CARC LOOKUP */}
            {activeSection === 'lookup' && (
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>🔍 Interactive CARC Code Lookup</h4>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Enter any CARC code to instantly see its description, routing department, priority, and SLA.</p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            value={carcLookup}
                            onChange={e => setCarcLookup(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLookup()}
                            placeholder="Enter CARC code (e.g. 197, 50, A1, B7)"
                            style={{ flex: 1, padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
                        />
                        <button onClick={handleLookup} style={{ padding: '10px 24px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Look Up</button>
                    </div>

                    {lookupResult && (() => {
                        const pc = PRIORITY_COLORS[lookupResult.priority];
                        return (
                            <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <code style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626', fontFamily: 'monospace' }}>CARC {lookupResult.reasonCode}</code>
                                        <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600', marginTop: '6px' }}>{lookupResult.reasonDescription}</div>
                                    </div>
                                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', backgroundColor: pc.bg, color: pc.color }}>{pc.label} Priority</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Routes To</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{DEPT_ICONS[lookupResult.department] || ''} {lookupResult.department}</div>
                                    </div>
                                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>SLA</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{lookupResult.sla} hours</div>
                                    </div>
                                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Category</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginTop: '4px', textTransform: 'capitalize' }}>{lookupResult.category?.replace(/([A-Z])/g, ' $1')}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                                    <strong>Description:</strong> {lookupResult.categoryDescription}
                                </div>
                            </div>
                        );
                    })()}

                    <div style={{ marginTop: '24px' }}>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '10px' }}>Quick Reference — Known CARC Codes</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                            {Object.entries(CARC_DESCRIPTIONS).map(([code, desc]) => (
                                <div key={code} onClick={() => { setCarcLookup(code); }}
                                    style={{ display: 'flex', gap: '10px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', cursor: 'pointer', border: carcLookup === code ? '1px solid #dc2626' : '1px solid transparent', transition: 'border 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#fca5a5'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = carcLookup === code ? '#dc2626' : 'transparent'}
                                >
                                    <code style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', minWidth: '28px' }}>{code}</code>
                                    <span style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FHIRDocumentation;
