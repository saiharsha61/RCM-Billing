import React, { useState } from 'react';
import { DENIAL_ROUTING_RULES } from '../lib/denialRouter';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const MOCK_CLAIMS = [
    { id:1, claimNumber:'CLM-2025-001', patient:'Suarez, Pedro',    dos:'2025-03-01', provider:'Dr. Farias-Jimenez', payer:'Medicare',    amount:850.00, paid:680.00, status:'Billed',   carcCode:'', age:22, procedures:[{cpt:'99215',mod:'',dx:'1',units:1,charge:350},{cpt:'93000',mod:'',dx:'1',units:1,charge:500}] },
    { id:2, claimNumber:'CLM-2025-002', patient:'Garcia, Maria',    dos:'2025-03-03', provider:'Dr. Garza Jr',       payer:'BCBS Texas',   amount:245.00, paid:0,      status:'New',    carcCode:'', age:18, procedures:[{cpt:'99213',mod:'',dx:'1',units:1,charge:245}] },
    { id:3, claimNumber:'CLM-2025-003', patient:'Wilson, James',    dos:'2025-02-20', provider:'Dr. Morales',        payer:'Aetna',        amount:620.00, paid:0,      status:'Hold',   carcCode:'', age:33, procedures:[{cpt:'99214',mod:'',dx:'1',units:1,charge:280},{cpt:'36415',mod:'',dx:'1',units:1,charge:340}] },
    { id:4, claimNumber:'CLM-2025-004', patient:'Nguyen, Kim',      dos:'2025-02-10', provider:'Dr. Reyes',          payer:'UHC',          amount:390.00, paid:0,      status:'Denied', carcCode:'97', age:42, procedures:[{cpt:'97001',mod:'',dx:'1',units:1,charge:390}] },
    { id:5, claimNumber:'CLM-2025-005', patient:'Martinez, Roberto',dos:'2025-01-28', provider:'Dr. Johnson',        payer:'Medicare',    amount:175.00, paid:175.00, status:'Paid',   carcCode:'', age:55, procedures:[{cpt:'99212',mod:'',dx:'1',units:1,charge:175}] },
    { id:6, claimNumber:'CLM-2025-006', patient:'Smith, John',      dos:'2025-01-15', provider:'Dr. Chen',           payer:'Cigna',        amount:510.00, paid:0,      status:'Rejected',carcCode:'4', age:67, procedures:[{cpt:'99215',mod:'',dx:'1',units:1,charge:510}] },
    { id:7, claimNumber:'CLM-2025-007', patient:'Davis, Sarah',     dos:'2025-02-28', provider:'Dr. Rodriguez',      payer:'BCBS Texas',   amount:320.00, paid:256.00, status:'Paid',   carcCode:'', age:25, procedures:[{cpt:'99213',mod:'',dx:'1',units:1,charge:320}] },
];

const MOCK_ERA = [
    { id:1, eraNum:'ERA-2025-0301', payer:'Medicare',   payDate:'2025-03-15', totalPaid:680.00, applied:680.00,  unapplied:0,    claimRef:'CLM-2025-001' },
    { id:2, eraNum:'ERA-2025-0302', payer:'BCBS Texas', payDate:'2025-03-18', totalPaid:256.00, applied:256.00,  unapplied:0,    claimRef:'CLM-2025-007' },
    { id:3, eraNum:'ERA-2025-0303', payer:'Aetna',      payDate:'2025-03-20', totalPaid:500.00, applied:0,       unapplied:500.00,claimRef:'' },
    { id:4, eraNum:'ERA-2025-0304', payer:'UHC',        payDate:'2025-03-22', totalPaid:800.00, applied:0,       unapplied:800.00,claimRef:'' },
];

const PATIENTS_LIST = [
    { id:1, name:'Pedro Suarez',    payer:'Medicare',  memberId:'MED-9609-TX' },
    { id:2, name:'Maria Garcia',    payer:'BCBS Texas',memberId:'BCB-7842-TX' },
    { id:3, name:'James Wilson',    payer:'Aetna',     memberId:'AET-5531-TX' },
    { id:4, name:'Kim Nguyen',      payer:'UHC',       memberId:'UHC-3310-TX' },
    { id:5, name:'Roberto Martinez',payer:'Medicare',  memberId:'MED-8812-TX' },
];

const PROVIDERS_LIST = ['Dr. Farias-Jimenez','Dr. Garza Jr','Dr. Morales','Dr. Reyes','Dr. Johnson','Dr. Chen','Dr. Rodriguez'];

const STATUS_COLORS = { New:'#3b82f6', Hold:'#f59e0b', Billed:'#8b5cf6', Rejected:'#ef4444', Denied:'#dc2626', Paid:'#059669' };

// ─────────────────────────────────────────────
// CLAIMS HUB (main export - inline, no modal)
// ─────────────────────────────────────────────
export function ClaimsHub() {
    const [claims, setClaims] = useState(MOCK_CLAIMS);
    const [activeTab, setActiveTab] = useState('worklist');
    const [scrubTarget, setScrubTarget] = useState(null);

    const TABS = [
        { id:'worklist',  label:'📋 Worklist' },
        { id:'new-claim', label:'➕ New Claim' },
        { id:'scrubber',  label:'🔍 Scrubber' },
        { id:'payments',  label:'💵 Payments / EOB' },
        { id:'denials',   label:'❌ Denials' },
        { id:'aging',     label:'📊 AR Aging' },
    ];

    const handleScrub = (claim) => { setScrubTarget(claim); setActiveTab('scrubber'); };
    const handleSubmit = (id) => setClaims(cs => cs.map(c => c.id===id ? {...c, status:'Billed'} : c));

    return (
        <div style={{ padding:'24px', maxWidth:'1400px' }}>
            {/* Header */}
            <div style={{ marginBottom:'24px' }}>
                <h1 style={{ fontSize:'26px', fontWeight: '800', color:'#0004d0', margin:'0 0 4px 0' }}>🗂️ Claims Hub</h1>
                <p style={{ color:'#64748b', margin:0 }}>Submit, track, post payments, and manage denials</p>
            </div>

            {/* KPI Strip */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginBottom:'24px' }}>
                {[
                    { label:'Total Claims', value: claims.length, color:'#0004d0' },
                    { label:'Pending / New', value: claims.filter(c=>c.status==='New').length, color:'#3b82f6' },
                    { label:'Denied', value: claims.filter(c=>c.status==='Denied').length, color:'#dc2626' },
                    { label:'Total Billed', value:`$${claims.reduce((s,c)=>s+c.amount,0).toLocaleString()}`, color:'#7c3aed' },
                    { label:'Total Collected', value:`$${claims.reduce((s,c)=>s+c.paid,0).toLocaleString()}`, color:'#059669' },
                ].map(k => (
                    <div key={k.label} style={{ backgroundColor:'white', borderRadius:'10px', padding:'14px 18px', border:'1px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize:'22px', fontWeight:'800', color:k.color }}>{k.value}</div>
                        <div style={{ fontSize:'12px', color:'#64748b', fontWeight:'600' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Bar */}
            <div style={{ display:'flex', gap:'4px', backgroundColor:'#f1f5f9', borderRadius:'10px', padding:'4px', width:'fit-content', marginBottom:'24px', flexWrap:'wrap' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                        padding:'9px 18px', fontSize:'13px', fontWeight:'700', border:'none', cursor:'pointer', borderRadius:'8px',
                        backgroundColor: activeTab===t.id ? 'white' : 'transparent',
                        color: activeTab===t.id ? '#a941c6' : '#64748b',
                        boxShadow: activeTab===t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        transition:'all 0.2s',
                    }}>{t.label}</button>
                ))}
            </div>

            {activeTab==='worklist'  && <WorklistTab  claims={claims} onScrub={handleScrub} onSubmit={handleSubmit} />}
            {activeTab==='new-claim' && <NewClaimTab  onAdd={c=>{ setClaims(cs=>[...cs,{...c,id:cs.length+1,status:'New',paid:0,age:0}]); setActiveTab('worklist'); }} />}
            {activeTab==='scrubber'  && <ScrubberTab  claims={claims} initialClaim={scrubTarget} />}
            {activeTab==='payments'  && <PaymentsTab  claims={claims} />}
            {activeTab==='denials'   && <DenialsTab   claims={claims} />}
            {activeTab==='aging'     && <AgingTab      claims={claims} />}
        </div>
    );
}

// ─────────────────────────────────────────────
// TAB 1: WORKLIST
// ─────────────────────────────────────────────
function WorklistTab({ claims, onScrub, onSubmit }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [payerFilter, setPayerFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);

    const payers = [...new Set(claims.map(c=>c.payer))];
    const filtered = claims.filter(c => {
        const q = search.toLowerCase();
        const matchQ = !q || c.patient.toLowerCase().includes(q) || c.claimNumber.toLowerCase().includes(q);
        const matchS = statusFilter==='all' || c.status===statusFilter;
        const matchP = payerFilter==='all' || c.payer===payerFilter;
        return matchQ && matchS && matchP;
    });

    const toggleId = id => setSelectedIds(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
    const ageColor = age => age > 90 ? '#dc2626' : age > 60 ? '#d97706' : age > 30 ? '#f59e0b' : '#64748b';

    const cs = { padding:'11px 12px', fontSize:'13px', color:'#0f172a', borderBottom:'1px solid #f1f5f9' };
    const hs = { padding:'10px 12px', fontSize:'11px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', textAlign:'left' };

    return (
        <div style={{ backgroundColor:'white', borderRadius:'12px', border:'1px solid #e2e8f0' }}>
            {/* Filters */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search patient or claim #..." style={{ flex:1, minWidth:'200px', padding:'9px 14px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'13px' }} />
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'13px' }}>
                    <option value="all">All Statuses</option>
                    {['New','Hold','Billed','Rejected','Denied','Paid'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <select value={payerFilter} onChange={e=>setPayerFilter(e.target.value)} style={{ padding:'9px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'13px' }}>
                    <option value="all">All Payers</option>
                    {payers.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                {selectedIds.length>0 && <span style={{ fontSize:'13px', color:'#a941c6', fontWeight:'700' }}>{selectedIds.length} selected</span>}
            </div>

            <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ backgroundColor:'#f8fafc' }}>
                        <tr>
                            <th style={hs}><input type="checkbox" onChange={e=>setSelectedIds(e.target.checked ? filtered.map(c=>c.id) : [])} /></th>
                            <th style={hs}>Claim #</th>
                            <th style={hs}>Patient</th>
                            <th style={hs}>DOS</th>
                            <th style={hs}>Provider</th>
                            <th style={hs}>Payer</th>
                            <th style={hs}>Billed</th>
                            <th style={hs}>Age</th>
                            <th style={hs}>Status</th>
                            <th style={hs}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} style={{ backgroundColor: selectedIds.includes(c.id) ? '#faf5ff' : 'white' }}>
                                <td style={cs}><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={()=>toggleId(c.id)} /></td>
                                <td style={cs}><span style={{ fontFamily:'monospace', fontWeight:'700', color:'#a941c6' }}>{c.claimNumber}</span></td>
                                <td style={cs}>{c.patient}</td>
                                <td style={cs}>{c.dos}</td>
                                <td style={cs}>{c.provider}</td>
                                <td style={cs}>{c.payer}</td>
                                <td style={cs}><strong>${c.amount.toFixed(2)}</strong></td>
                                <td style={cs}><span style={{ fontWeight:'700', color:ageColor(c.age) }}>{c.age}d</span></td>
                                <td style={cs}>
                                    <span style={{ padding:'3px 10px', borderRadius:'10px', fontSize:'11px', fontWeight:'700', backgroundColor:`${STATUS_COLORS[c.status] || '#64748b'}18`, color:STATUS_COLORS[c.status]||'#64748b' }}>
                                        {c.status}
                                    </span>
                                </td>
                                <td style={cs}>
                                    <div style={{ display:'flex', gap:'6px' }}>
                                        {c.status==='New' && <><Btn color="#7c3aed" onClick={()=>onScrub(c)}>🔍 Scrub</Btn><Btn color="#10b981" onClick={()=>onSubmit(c.id)}>Submit</Btn></>}
                                        {c.status==='Hold' && <Btn color="#f59e0b" onClick={()=>{}}>Edit</Btn>}
                                        {(c.status==='Rejected'||c.status==='Denied') && <Btn color="#ef4444" onClick={()=>{}}>Resubmit</Btn>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ padding:'12px 20px', borderTop:'1px solid #f1f5f9', fontSize:'12px', color:'#94a3b8' }}>
                Showing {filtered.length} of {claims.length} claims
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// TAB 2: NEW CLAIM
// ─────────────────────────────────────────────
function NewClaimTab({ onAdd }) {
    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({ patientId:'', payer:'', memberId:'', provider:'', dos:today, pos:'11', authNum:'', facility:'Main Clinic — Mission, TX' });
    const [lines, setLines] = useState([{ cpt:'', mod:'', dx:'1', units:1, charge:'' }]);
    const [submitted, setSubmitted] = useState(false);

    const sf = (k,v) => setForm(f=>({...f,[k]:v}));
    const sl = (i,k,v) => setLines(ls => ls.map((l,idx) => idx===i ? {...l,[k]:v} : l));
    const addLine = () => setLines(ls=>[...ls,{cpt:'',mod:'',dx:'1',units:1,charge:''}]);
    const removeLine = i => setLines(ls=>ls.filter((_,idx)=>idx!==i));
    const totalCharge = lines.reduce((s,l)=>s+(parseFloat(l.charge||0)*parseInt(l.units||1)),0);

    const handlePatient = e => {
        const p = PATIENTS_LIST.find(p=>p.id===Number(e.target.value));
        if(p) setForm(f=>({...f,patientId:p.id,payer:p.payer,memberId:p.memberId,patientName:p.name}));
    };
    const handleSubmit = () => {
        if(!form.patientId||!form.provider||lines.every(l=>!l.cpt)) return;
        onAdd({ claimNumber:`CLM-2025-${String(Date.now()).slice(-4)}`, patient:form.patientName, dos:form.dos, provider:form.provider, payer:form.payer, amount:totalCharge, procedures:lines });
        setSubmitted(true);
    };

    const F = { width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'13px', boxSizing:'border-box' };
    const L = { display:'block', fontSize:'11px', fontWeight:'700', color:'#374151', marginBottom:'4px', textTransform:'uppercase' };

    if(submitted) return (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'48px' }}>✅</div>
            <h3 style={{ color:'#16a34a', fontSize:'20px', fontWeight:'800' }}>Claim Created!</h3>
            <p style={{ color:'#64748b' }}>Added to the Worklist with status <strong>New</strong>.</p>
            <button onClick={()=>{setSubmitted(false);setForm({patientId:'',payer:'',memberId:'',provider:'',dos:today,pos:'11',authNum:'',facility:'Main Clinic — Mission, TX'});setLines([{cpt:'',mod:'',dx:'1',units:1,charge:''}])}}
                style={{ marginTop:'16px', padding:'10px 24px', borderRadius:'8px', backgroundColor:'#a941c6', color:'white', border:'none', fontSize:'14px', fontWeight:'700', cursor:'pointer' }}>
                + New Claim
            </button>
        </div>
    );

    return (
        <div style={{ backgroundColor:'white', borderRadius:'12px', padding:'24px', border:'1px solid #e2e8f0', maxWidth:'860px' }}>
            <h3 style={{ margin:'0 0 20px 0', fontSize:'17px', fontWeight:'800', color:'#0f172a' }}>➕ New Claim</h3>

            <SecH icon="👤" label="Patient & Insurance" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
                <div><label style={L}>Patient *</label>
                    <select onChange={handlePatient} value={form.patientId} style={F}>
                        <option value="">Select patient...</option>
                        {PATIENTS_LIST.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div><label style={L}>Payer</label><input readOnly value={form.payer} style={{...F,backgroundColor:'#f1f5f9'}} /></div>
                <div><label style={L}>Member ID</label><input readOnly value={form.memberId} style={{...F,backgroundColor:'#f1f5f9'}} /></div>
            </div>

            <SecH icon="🏥" label="Provider & Location" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
                <div><label style={L}>Rendering Provider *</label>
                    <select value={form.provider} onChange={e=>sf('provider',e.target.value)} style={F}>
                        <option value="">Select...</option>
                        {PROVIDERS_LIST.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div><label style={L}>Place of Service</label>
                    <select value={form.pos} onChange={e=>sf('pos',e.target.value)} style={F}>
                        <option value="11">11 — Office</option>
                        <option value="02">02 — Telehealth</option>
                        <option value="21">21 — Inpatient Hospital</option>
                        <option value="22">22 — Outpatient Hospital</option>
                    </select>
                </div>
                <div><label style={L}>Auth #</label><input value={form.authNum} onChange={e=>sf('authNum',e.target.value)} placeholder="Optional" style={F} /></div>
                <div><label style={L}>Date of Service *</label><input type="date" value={form.dos} onChange={e=>sf('dos',e.target.value)} style={F} /></div>
                <div style={{ gridColumn:'2/4' }}><label style={L}>Facility</label>
                    <select value={form.facility} onChange={e=>sf('facility',e.target.value)} style={F}>
                        {['Main Clinic — Mission, TX','North Campus — McAllen, TX','South Campus — Edinburg, TX','Telehealth Pod A'].map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            <SecH icon="🔬" label="Procedure Lines" />
            <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'12px' }}>
                <thead><tr style={{ backgroundColor:'#f8fafc' }}>
                    {['CPT/HCPCS','Modifier','DX Pointer','Units','Charge ($)',''].map(h=><th key={h} style={{ padding:'8px 10px', fontSize:'11px', fontWeight:'700', color:'#64748b', textAlign:'left' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                    {lines.map((l,i)=>(
                        <tr key={i}>
                            <td style={{ padding:'6px 4px' }}><input value={l.cpt} onChange={e=>sl(i,'cpt',e.target.value)} placeholder="99214" style={{...F,width:'100px'}} /></td>
                            <td style={{ padding:'6px 4px' }}><input value={l.mod} onChange={e=>sl(i,'mod',e.target.value)} placeholder="25" style={{...F,width:'60px'}} /></td>
                            <td style={{ padding:'6px 4px' }}><input value={l.dx} onChange={e=>sl(i,'dx',e.target.value)} placeholder="1" style={{...F,width:'60px'}} /></td>
                            <td style={{ padding:'6px 4px' }}><input type="number" min="1" value={l.units} onChange={e=>sl(i,'units',e.target.value)} style={{...F,width:'60px'}} /></td>
                            <td style={{ padding:'6px 4px' }}><input type="number" value={l.charge} onChange={e=>sl(i,'charge',e.target.value)} placeholder="0.00" style={{...F,width:'90px'}} /></td>
                            <td style={{ padding:'6px 4px' }}>{lines.length>1&&<button onClick={()=>removeLine(i)} style={{ border:'none', background:'none', color:'#ef4444', cursor:'pointer', fontSize:'16px' }}>✕</button>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={addLine} style={{ fontSize:'13px', color:'#7c3aed', border:'1px dashed #7c3aed', background:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', marginBottom:'20px' }}>+ Add Line</button>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'16px', borderTop:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a' }}>Total: <span style={{ color:'#a941c6' }}>${totalCharge.toFixed(2)}</span></div>
                <button onClick={handleSubmit} style={{ padding:'12px 28px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#a941c6,#7c3aed)', color:'white', fontSize:'14px', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(169,65,198,0.35)' }}>
                    📤 Create Claim
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// TAB 3: SCRUBBER
// ─────────────────────────────────────────────
function ScrubberTab({ claims, initialClaim }) {
    const [selected, setSelected] = useState(initialClaim || null);
    const [results, setResults] = useState(null);

    const runScrub = (claim) => {
        setSelected(claim);
        const r = [];
        const checks = [
            { key:'demographics', label:'Patient Demographics',    pass: !!claim.patient,          warn: false,  msg: claim.patient ? 'Patient name verified' : 'Missing patient info' },
            { key:'dos',          label:'Date of Service',         pass: !!claim.dos,               warn: false,  msg: claim.dos ? `DOS: ${claim.dos}` : 'DOS missing' },
            { key:'provider',     label:'Provider NPI',            pass: !!claim.provider,          warn: false,  msg: `Valid NPI on file for ${claim.provider}` },
            { key:'cpts',         label:'CPT/HCPCS Codes',         pass: claim.procedures.length>0, warn: false,  msg: `${claim.procedures.length} procedure line(s) present` },
            { key:'dx',           label:'Diagnosis Pointer',        pass: true,                      warn: false,  msg: 'All procedures linked to valid ICD-10 codes' },
            { key:'ncci',         label:'NCCI Edits',              pass: true,                      warn: false,  msg: 'No unbundling issues detected' },
            { key:'modifier',     label:'Modifier Check',           pass: true,                      warn: claim.procedures.some(p=>!p.mod), msg: claim.procedures.some(p=>!p.mod) ? 'One or more procedures missing modifier — verify if required' : 'Modifiers validated' },
            { key:'auth',         label:'Prior Authorization',      pass: claim.amount <= 500,       warn: claim.amount > 300 && claim.amount <= 500, msg: claim.amount > 500 ? 'High-cost claim requires auth # — missing' : claim.amount > 300 ? 'Verify auth on file for this payer' : 'No auth required' },
            { key:'timely',       label:'Timely Filing',            pass: claim.age <= 90,           warn: claim.age > 60, msg: claim.age > 90 ? `⚠️ ${claim.age} days old — may exceed timely filing limit!` : claim.age > 60 ? `${claim.age} days — approaching filing deadline` : 'Within timely filing window' },
            { key:'eligibility',  label:'Eligibility Verification', pass: true,                      warn: false,  msg: 'Active coverage confirmed for date of service' },
        ];
        checks.forEach(c => r.push({ label:c.label, level: !c.pass ? 'error' : c.warn ? 'warning' : 'success', msg: c.msg }));
        setResults(r);
    };

    const levelColor = { error:'#dc2626', warning:'#d97706', success:'#16a34a' };
    const levelBg    = { error:'#fee2e2', warning:'#fef3c7', success:'#dcfce7' };
    const levelIcon  = { error:'❌', warning:'⚠️', success:'✅' };
    const hasError   = results?.some(r=>r.level==='error');
    const hasWarn    = results?.some(r=>r.level==='warning');

    return (
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:'20px' }}>
            {/* Claim picker */}
            <div style={{ backgroundColor:'white', borderRadius:'12px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
                <div style={{ padding:'14px 16px', borderBottom:'1px solid #e2e8f0', fontSize:'13px', fontWeight:'700', color:'#64748b' }}>SELECT CLAIM TO SCRUB</div>
                {claims.filter(c=>c.status!=='Paid').map(c=>(
                    <div key={c.id} onClick={()=>runScrub(c)} style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #f1f5f9', backgroundColor: selected?.id===c.id ? '#faf5ff' : 'white', transition:'background 0.15s' }}>
                        <div style={{ fontWeight:'700', fontSize:'13px', color:'#a941c6' }}>{c.claimNumber}</div>
                        <div style={{ fontSize:'12px', color:'#64748b' }}>{c.patient} · {c.payer}</div>
                        <div style={{ fontSize:'12px', color:'#64748b' }}>${c.amount} · <span style={{ color:STATUS_COLORS[c.status] }}>{c.status}</span></div>
                    </div>
                ))}
            </div>

            {/* Results */}
            <div style={{ backgroundColor:'white', borderRadius:'12px', border:'1px solid #e2e8f0' }}>
                {!results ? (
                    <div style={{ padding:'60px 20px', textAlign:'center', color:'#94a3b8' }}>
                        <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔍</div>
                        <div style={{ fontSize:'16px', fontWeight:'600' }}>Select a claim to run the scrubber</div>
                    </div>
                ) : (
                    <>
                        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e2e8f0', backgroundColor: hasError ? '#fee2e2' : hasWarn ? '#fef3c7' : '#dcfce7' }}>
                            <div style={{ fontSize:'16px', fontWeight:'800' }}>
                                {hasError ? '❌ Issues Found — Cannot Submit' : hasWarn ? '⚠️ Warnings — Review Before Submitting' : '✅ Claim Ready to Submit'}
                            </div>
                            <div style={{ fontSize:'13px', color:'#64748b', marginTop:'2px' }}>{selected.claimNumber} · {selected.patient}</div>
                        </div>
                        <div style={{ padding:'20px' }}>
                            {results.map((r,i)=>(
                                <div key={i} style={{ padding:'12px 14px', marginBottom:'10px', borderRadius:'8px', backgroundColor:levelBg[r.level], borderLeft:`4px solid ${levelColor[r.level]}` }}>
                                    <div style={{ fontWeight:'700', fontSize:'13px', color:levelColor[r.level] }}>{levelIcon[r.level]} {r.label}</div>
                                    <div style={{ fontSize:'12px', color:'#64748b', marginTop:'2px' }}>{r.msg}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// TAB 4: PAYMENTS / EOB
// ─────────────────────────────────────────────
function PaymentsTab({ claims }) {
    const [era, setEra] = useState(MOCK_ERA);
    const [posting, setPosting] = useState(null);

    const handlePost = (eraId, claimNum) => {
        setEra(es => es.map(e => e.id===eraId ? {...e, applied:e.totalPaid, unapplied:0, claimRef:claimNum, posted:true} : e));
        setPosting(null);
    };

    return (
        <div style={{ display:'grid', gap:'20px' }}>
            {/* Summary KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
                {[
                    { label:'Total Received', value:`$${era.reduce((s,e)=>s+e.totalPaid,0).toLocaleString()}`, color:'#059669' },
                    { label:'Applied', value:`$${era.reduce((s,e)=>s+e.applied,0).toLocaleString()}`, color:'#3b82f6' },
                    { label:'Unapplied', value:`$${era.reduce((s,e)=>s+e.unapplied,0).toLocaleString()}`, color:'#d97706' },
                ].map(k=>(
                    <div key={k.label} style={{ backgroundColor:'white', borderRadius:'10px', padding:'16px 20px', border:'1px solid #e2e8f0' }}>
                        <div style={{ fontSize:'22px', fontWeight:'800', color:k.color }}>{k.value}</div>
                        <div style={{ fontSize:'12px', color:'#64748b', fontWeight:'600' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ERA Table */}
            <div style={{ backgroundColor:'white', borderRadius:'12px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #e2e8f0', fontWeight:'800', fontSize:'15px', color:'#0f172a' }}>📋 Electronic Remittance Advice (ERA)</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ backgroundColor:'#f8fafc' }}>
                        <tr>{['ERA #','Payer','Pay Date','Total','Applied','Unapplied','Claim Ref','Action'].map(h=><th key={h} style={{ padding:'10px 14px', fontSize:'11px', fontWeight:'700', color:'#64748b', textAlign:'left', textTransform:'uppercase' }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {era.map(e=>(
                            <tr key={e.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                                <td style={{ padding:'12px 14px', fontFamily:'monospace', fontWeight:'700', color:'#7c3aed' }}>{e.eraNum}</td>
                                <td style={{ padding:'12px 14px', fontSize:'13px' }}>{e.payer}</td>
                                <td style={{ padding:'12px 14px', fontSize:'13px' }}>{e.payDate}</td>
                                <td style={{ padding:'12px 14px', fontWeight:'700' }}>${e.totalPaid.toFixed(2)}</td>
                                <td style={{ padding:'12px 14px', color:'#059669', fontWeight:'600' }}>${e.applied.toFixed(2)}</td>
                                <td style={{ padding:'12px 14px', color: e.unapplied>0 ? '#d97706' : '#94a3b8', fontWeight:'600' }}>${e.unapplied.toFixed(2)}</td>
                                <td style={{ padding:'12px 14px', fontSize:'12px', color:'#64748b' }}>{e.claimRef || '—'}</td>
                                <td style={{ padding:'12px 14px' }}>
                                    {e.unapplied>0 && !e.posted
                                        ? <button onClick={()=>setPosting(e)} style={{ padding:'5px 12px', borderRadius:'6px', backgroundColor:'#059669', color:'white', border:'none', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>Post Payment</button>
                                        : <span style={{ fontSize:'12px', color:'#059669', fontWeight:'700' }}>✅ Posted</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Post Payment Modal */}
            {posting && (
                <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
                    <div style={{ backgroundColor:'white', borderRadius:'12px', padding:'28px', width:'420px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin:'0 0 16px 0', fontSize:'17px', fontWeight:'800' }}>Post Payment — {posting.eraNum}</h3>
                        <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'16px' }}>Amount: <strong>${posting.unapplied.toFixed(2)}</strong> — Apply to claim:</p>
                        <select style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'13px', marginBottom:'16px' }}
                            onChange={e=>setPosting(p=>({...p,_target:e.target.value}))} defaultValue="">
                            <option value="">Select claim...</option>
                            {claims.filter(c=>c.status==='Billed').map(c=><option key={c.id} value={c.claimNumber}>{c.claimNumber} — {c.patient}</option>)}
                        </select>
                        <div style={{ display:'flex', gap:'10px' }}>
                            <button onClick={()=>handlePost(posting.id, posting._target)} style={{ flex:1, padding:'10px', borderRadius:'8px', backgroundColor:'#059669', color:'white', border:'none', fontWeight:'700', cursor:'pointer' }}>✅ Confirm Post</button>
                            <button onClick={()=>setPosting(null)} style={{ flex:1, padding:'10px', borderRadius:'8px', backgroundColor:'#f1f5f9', color:'#475569', border:'none', fontWeight:'700', cursor:'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// TAB 5: DENIALS
// ─────────────────────────────────────────────
function DenialsTab({ claims }) {
    const denied = claims.filter(c => c.status==='Denied' || c.status==='Rejected');
    const [appeals, setAppeals] = useState({});

    const getRouting = (carc) => {
        const rule = DENIAL_ROUTING_RULES[carc];
        return rule || { department:'Billing', priority:'medium', sla:'72 hours', description:'Review and resubmit' };
    };

    return (
        <div style={{ backgroundColor:'white', borderRadius:'12px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight:'800', fontSize:'15px', color:'#0f172a' }}>❌ Denial Worklist</div>
                <span style={{ backgroundColor:'#fee2e2', color:'#dc2626', padding:'4px 12px', borderRadius:'10px', fontSize:'12px', fontWeight:'700' }}>{denied.length} Active Denials</span>
            </div>
            {denied.length === 0 ? (
                <div style={{ padding:'60px 20px', textAlign:'center', color:'#94a3b8' }}>
                    <div style={{ fontSize:'36px', marginBottom:'10px' }}>🎉</div>
                    <div style={{ fontWeight:'700' }}>No active denials!</div>
                </div>
            ) : (
                <div style={{ padding:'16px 20px' }}>
                    {denied.map(c => {
                        const routing = getRouting(c.carcCode);
                        const appealing = appeals[c.id];
                        return (
                            <div key={c.id} style={{ backgroundColor:'#fff5f5', borderRadius:'10px', border:'1px solid #fecaca', padding:'16px', marginBottom:'14px' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
                                    <div>
                                        <span style={{ fontFamily:'monospace', fontWeight:'800', color:'#dc2626', fontSize:'14px' }}>{c.claimNumber}</span>
                                        <span style={{ marginLeft:'12px', fontSize:'13px', color:'#374151' }}>{c.patient}</span>
                                        <span style={{ marginLeft:'8px', fontSize:'12px', color:'#94a3b8' }}>· {c.payer} · ${c.amount}</span>
                                    </div>
                                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                                        {c.carcCode && <span style={{ backgroundColor:'#fee2e2', color:'#dc2626', padding:'3px 10px', borderRadius:'8px', fontSize:'12px', fontWeight:'700' }}>CARC {c.carcCode}</span>}
                                        <span style={{ backgroundColor: routing.priority==='high'?'#fee2e2':'#fef3c7', color: routing.priority==='high'?'#dc2626':'#d97706', padding:'3px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:'700', textTransform:'uppercase' }}>{routing.priority} priority</span>
                                    </div>
                                </div>
                                <div style={{ marginTop:'10px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'8px' }}>
                                    <div style={{ fontSize:'12px', color:'#64748b' }}><strong>Route to:</strong> {routing.department}</div>
                                    <div style={{ fontSize:'12px', color:'#64748b' }}><strong>SLA:</strong> {routing.sla}</div>
                                    <div style={{ fontSize:'12px', color:'#64748b' }}><strong>Action:</strong> {routing.description}</div>
                                    <div style={{ fontSize:'12px', color:'#64748b' }}><strong>Age:</strong> <span style={{ color: c.age>60?'#dc2626':'#d97706' }}>{c.age} days</span></div>
                                </div>
                                <div style={{ marginTop:'12px', display:'flex', gap:'8px' }}>
                                    <button onClick={()=>setAppeals(a=>({...a,[c.id]:!a[c.id]}))} style={{ padding:'6px 14px', borderRadius:'6px', border:'none', backgroundColor: appealing ? '#dcfce7' : '#a941c6', color:'white', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
                                        {appealing ? '✅ Appeal Filed' : '🔄 File Appeal'}
                                    </button>
                                    <button style={{ padding:'6px 14px', borderRadius:'6px', border:'1px solid #e2e8f0', backgroundColor:'white', color:'#475569', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>📄 View Remit</button>
                                    <button style={{ padding:'6px 14px', borderRadius:'6px', border:'1px solid #e2e8f0', backgroundColor:'white', color:'#475569', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>📞 P2P Request</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// TAB 6: AR AGING
// ─────────────────────────────────────────────
function AgingTab({ claims }) {
    const buckets = [
        { label:'0–30 days',    max:30,  min:0,   color:'#3b82f6' },
        { label:'31–60 days',   max:60,  min:31,  color:'#10b981' },
        { label:'61–90 days',   max:90,  min:61,  color:'#f59e0b' },
        { label:'91–120 days',  max:120, min:91,  color:'#ef4444' },
        { label:'120+ days',    max:9999,min:121, color:'#dc2626' },
    ];

    const unpaid = claims.filter(c => c.status !== 'Paid');
    const payers = [...new Set(unpaid.map(c=>c.payer))];

    const getAmt = (claims, min, max) => claims.filter(c=>c.age>=min&&c.age<=max).reduce((s,c)=>s+c.amount,0);
    const totalUnpaid = unpaid.reduce((s,c)=>s+c.amount,0);

    return (
        <div style={{ display:'grid', gap:'20px' }}>
            {/* Bucket summary */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px' }}>
                {buckets.map(b => {
                    const amt = getAmt(unpaid, b.min, b.max);
                    const pct = totalUnpaid > 0 ? Math.round((amt/totalUnpaid)*100) : 0;
                    return (
                        <div key={b.label} style={{ backgroundColor:'white', borderRadius:'12px', padding:'16px', border:`2px solid ${b.color}30`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize:'20px', fontWeight:'800', color:b.color }}>${amt.toLocaleString()}</div>
                            <div style={{ fontSize:'12px', fontWeight:'700', color:'#374151', marginTop:'2px' }}>{b.label}</div>
                            <div style={{ height:'4px', backgroundColor:'#f1f5f9', borderRadius:'2px', marginTop:'8px' }}>
                                <div style={{ height:'100%', width:`${pct}%`, backgroundColor:b.color, borderRadius:'2px' }} />
                            </div>
                            <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>{pct}% of total A/R</div>
                        </div>
                    );
                })}
            </div>

            {/* Per-payer breakdown */}
            <div style={{ backgroundColor:'white', borderRadius:'12px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #e2e8f0', fontWeight:'800', fontSize:'14px', color:'#0f172a' }}>📊 A/R Aging by Payer</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead style={{ backgroundColor:'#f8fafc' }}>
                        <tr>
                            <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#64748b', textTransform:'uppercase' }}>Payer</th>
                            {buckets.map(b=><th key={b.label} style={{ padding:'10px 14px', textAlign:'right', fontSize:'11px', fontWeight:'700', color:b.color, textTransform:'uppercase' }}>{b.label}</th>)}
                            <th style={{ padding:'10px 14px', textAlign:'right', fontSize:'11px', fontWeight:'700', color:'#0f172a', textTransform:'uppercase' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payers.map(payer => {
                            const pc = unpaid.filter(c=>c.payer===payer);
                            return (
                                <tr key={payer} style={{ borderBottom:'1px solid #f1f5f9' }}>
                                    <td style={{ padding:'12px 14px', fontWeight:'700', fontSize:'13px' }}>{payer}</td>
                                    {buckets.map(b=>(
                                        <td key={b.label} style={{ padding:'12px 14px', textAlign:'right', fontSize:'13px', fontWeight: getAmt(pc,b.min,b.max)>0 ? '700' : '400', color: getAmt(pc,b.min,b.max)>0 ? b.color : '#94a3b8' }}>
                                            {getAmt(pc,b.min,b.max)>0 ? `$${getAmt(pc,b.min,b.max).toLocaleString()}` : '—'}
                                        </td>
                                    ))}
                                    <td style={{ padding:'12px 14px', textAlign:'right', fontWeight:'800', fontSize:'13px' }}>${pc.reduce((s,c)=>s+c.amount,0).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                        <tr style={{ backgroundColor:'#f8fafc', fontWeight:'800' }}>
                            <td style={{ padding:'12px 14px', fontSize:'13px' }}>TOTAL</td>
                            {buckets.map(b=><td key={b.label} style={{ padding:'12px 14px', textAlign:'right', fontSize:'13px', color:b.color }}>${getAmt(unpaid,b.min,b.max).toLocaleString()}</td>)}
                            <td style={{ padding:'12px 14px', textAlign:'right', fontSize:'13px', color:'#0004d0' }}>${totalUnpaid.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function Btn({ color, onClick, children }) {
    return <button onClick={onClick} style={{ padding:'5px 10px', borderRadius:'6px', backgroundColor:color, color:'white', border:'none', fontSize:'11px', fontWeight:'700', cursor:'pointer', whiteSpace:'nowrap' }}>{children}</button>;
}
function SecH({ icon, label }) {
    return <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'10px', paddingBottom:'7px', borderBottom:'1px solid #e2e8f0' }}>
        <span style={{ fontSize:'15px' }}>{icon}</span>
        <span style={{ fontSize:'11px', fontWeight:'800', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
    </div>;
}

// Legacy export for backward compat
export function ClaimsWorklist({ onClose }) {
    return (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ backgroundColor:'white', borderRadius:'12px', width:'95%', maxWidth:'1200px', maxHeight:'90vh', overflow:'auto' }}>
                <div style={{ padding:'16px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h2 style={{ margin:0, fontWeight:'800' }}>Claims Hub</h2>
                    <button onClick={onClose} style={{ padding:'6px 14px', border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer', background:'white' }}>✕ Close</button>
                </div>
                <ClaimsHub />
            </div>
        </div>
    );
}
