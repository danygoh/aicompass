'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
  const [activePanel, setActivePanel] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  const [cohortMembers, setCohortMembers] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, a, c, p] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/assessments').then(r => r.json()),
        fetch('/api/admin/cohorts').then(r => r.json()),
        fetch('/api/admin/payments').then(r => r.json()),
      ]);
      setUsers(u.users || []);
      setAssessments(a.assessments || []);
      setCohorts(c.cohorts || []);
      setPayments(p.payments || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const stats = { 
    totalUsers: users.length, 
    totalAssessments: assessments.length, 
    totalCohorts: cohorts.length, 
    revenue: payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + (p.amount || 0), 0),
  };

  const saveUser = async () => {
    if (!editingUser) return;
    await fetch('/api/admin/users/' + editingUser.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingUser.name, subscription: editingUser.tier }) });
    setEditingUser(null);
    loadData();
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete user?')) return;
    await fetch('/api/admin/users/' + id, { method: 'DELETE' });
    loadData();
  };

  const openCohort = async (cohort: any) => {
    setSelectedCohort(cohort);
    const res = await fetch('/api/admin/cohorts/' + cohort.id + '/members');
    const data = await res.json();
    setCohortMembers(data.members || []);
  };

  const addUserToCohort = async (userId: string) => {
    if (!selectedCohort) return;
    await fetch('/api/admin/cohorts/' + selectedCohort.id + '/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
    const res = await fetch('/api/admin/cohorts/' + selectedCohort.id + '/members');
    const data = await res.json();
    setCohortMembers(data.members || []);
  };

  const removeUserFromCohort = async (userId: string) => {
    if (!selectedCohort) return;
    await fetch('/api/admin/cohorts/' + selectedCohort.id + '/members?userId=' + userId, { method: 'DELETE' });
    const res = await fetch('/api/admin/cohorts/' + selectedCohort.id + '/members');
    const data = await res.json();
    setCohortMembers(data.members || []);
  };

  const deleteCohort = async (id: string) => { if (!confirm('Delete cohort?')) return; await fetch('/api/admin/cohorts?id=' + id, { method: 'DELETE' }); loadData(); };
  const createCohort = async () => { const name = prompt('Cohort name:'); const code = prompt('Code:'); if (name && code) { await fetch('/api/admin/cohorts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, code }) }); loadData(); }};

  if (loading) return <div style={{padding:40,textAlign:'center'}}>Loading...</div>;

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <aside style={{width:260,background:'#fff',borderRight:'1px solid #e5e7eb',padding:20,display:'flex',flexDirection:'column'}}>
        <div style={{fontFamily:'Fraunces, serif',fontSize:18,color:'#1e3a5f'}}>AI <span style={{color:'#f59e0b'}}>Compass</span></div>
        <div style={{fontSize:11,color:'#6b7280',marginTop:4,marginBottom:20}}>Admin Dashboard</div>
        <nav style={{flex:1}}>
          {[
            {id:'overview',icon:'📊',label:'Overview',badge:0},
            {id:'users',icon:'👥',label:'Users',badge:users.length},
            {id:'cohorts',icon:'🏫',label:'Cohorts',badge:cohorts.length},
            {id:'payments',icon:'💳',label:'Payments',badge:0},
            {id:'plans',icon:'📦',label:'Plans & Pricing',badge:0},
            {id:'settings',icon:'⚙️',label:'Settings',badge:0},
            {id:'api',icon:'🔌',label:'API',badge:0}
          ].map(item => (
            <button key={item.id} onClick={()=>{setSelectedCohort(null);setActivePanel(item.id)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',background:activePanel===item.id?'#f0fdfa':'transparent',border:'none',borderRadius:8,fontSize:13,color:activePanel===item.id?'#0d9488':'#374151',cursor:'pointer',textAlign:'left',marginBottom:4}}>
              {item.icon} {item.label} {item.badge>0&&<span style={{marginLeft:'auto',fontSize:10,background:'#0d9488',color:'#fff',padding:'2px 6px',borderRadius:10}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{marginTop:'auto',paddingTop:20,borderTop:'1px solid #e5e7eb'}}><button onClick={loadData} style={{fontSize:12,color:'#6b7280',background:'none',border:'none',cursor:'pointer'}}>Refresh</button></div>
      </aside>

      <div style={{flex:1,padding:24,background:'#f9fafb',overflowY:'auto'}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#1e3a5f',margin:0,marginBottom:24}}>
          {activePanel==='overview'&&'Overview'}
          {activePanel==='users'&&'Users'}
          {activePanel==='cohorts'&&(selectedCohort?selectedCohort.name:'Cohorts')}
          {activePanel==='payments'&&'Payments'}
          {activePanel==='plans'&&'Plans & Pricing'}
          {activePanel==='settings'&&'Settings'}
          {activePanel==='api'&&'API & Integrations'}
        </h1>
        {selectedCohort&&<button onClick={()=>setSelectedCohort(null)} style={{marginBottom:16,padding:'8px 16px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:6,cursor:'pointer'}}>Back</button>}

        {activePanel==='overview'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#000'}}>{stats.totalUsers}</div><div style={{fontSize:12,color:'#6b7280'}}>Total Users</div></div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#000'}}>{stats.totalAssessments}</div><div style={{fontSize:12,color:'#6b7280'}}>Assessments</div></div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#000'}}>{stats.totalCohorts}</div><div style={{fontSize:12,color:'#6b7280'}}>Cohorts</div></div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#16a34a'}}>${stats.revenue.toLocaleString()}</div><div style={{fontSize:12,color:'#6b7280'}}>Revenue</div></div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,color:'#000',marginBottom:12}}>Recent completions</div>
              {assessments.slice(0,5).map((a,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div><div style={{fontWeight:600,color:'#000'}}>{a.user}</div><div style={{fontSize:12,color:'#6b7280'}}>{a.company}</div></div><div style={{textAlign:'right'}}><div style={{fontWeight:600,color:'#f59e0b'}}>{a.score}</div></div></div>)}
              {assessments.length===0&&<div style={{padding:20,textAlign:'center',color:'#6b7280'}}>No assessments</div>}
            </div>
          </div>
        )}

        {activePanel==='users'&&(
          <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>USER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>TIER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ACTIONS</th></tr></thead><tbody>
              {users.map(u=>(
                <tr key={u.id}><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}>{editingUser?.id===u.id?<input value={editingUser.name} onChange={e=>setEditingUser({...editingUser,name:e.target.value})} style={{padding:4,border:'1px solid #e5e7eb',borderRadius:4,color:'#000'}} />:<><div style={{fontWeight:600,color:'#000'}}>{u.name}</div><div style={{fontSize:11,color:'#6b7280'}}>{u.email}</div></>}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}>{editingUser?.id===u.id?<select value={editingUser.tier} onChange={e=>setEditingUser({...editingUser,tier:e.target.value})}><option>FREE</option><option>PROFESSIONAL</option><option>TEAM</option><option>ENTERPRISE</option></select>:<span style={{fontSize:11,padding:'4px 8px',background:'#f3f4f6',borderRadius:4,color:'#000'}}>{u.tier||'FREE'}</span>}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}>{editingUser?.id===u.id?<><button onClick={saveUser} style={{padding:'4px 8px',background:'#0d9488',border:'none',borderRadius:4,color:'#fff',cursor:'pointer',marginRight:4}}>Save</button><button onClick={()=>setEditingUser(null)} style={{padding:'4px 8px',border:'1px solid #e5e7eb',borderRadius:4,cursor:'pointer'}}>Cancel</button></>:<><button onClick={()=>setEditingUser({id:u.id,name:u.name,tier:u.tier||'FREE'})} style={{padding:'4px 8px',border:'1px solid #e5e7eb',borderRadius:4,cursor:'pointer',marginRight:4,color:'#000'}}>Edit</button><button onClick={()=>deleteUser(u.id)} style={{padding:'4px 8px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:4,color:'#dc2626',cursor:'pointer'}}>Delete</button></>}</td></tr>))}
            </tbody></table>
          </div>
        )}

        {activePanel==='cohorts'&&!selectedCohort&&(
          <div><div style={{marginBottom:16}}><button onClick={createCohort} style={{padding:'10px 20px',background:'#0d9488',border:'none',borderRadius:8,color:'#fff',cursor:'pointer'}}>+ New Cohort</button></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>{cohorts.map(c=>(<div key={c.id} onClick={()=>openCohort(c)} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div style={{fontWeight:600,color:'#000'}}>{c.name}</div><span style={{fontSize:10,padding:'3px 8px',borderRadius:4,background:c.status==='ACTIVE'?'#dcfce7':'#f3f4f6',color:c.status==='ACTIVE'?'#16a34a':'#6b7280'}}>{c.status}</span></div><div style={{fontFamily:'monospace',fontSize:12,color:'#6b7280',marginBottom:16}}>{c.code}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:12,color:'#6b7280'}}>{c.maxUsers||'∞'} participants</span><button onClick={(e)=>{e.stopPropagation();deleteCohort(c.id);}} style={{padding:'4px 8px',fontSize:11,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:4,color:'#dc2626',cursor:'pointer'}}>Delete</button></div></div>))}{cohorts.length===0&&<div style={{gridColumn:'1/-1',padding:40,textAlign:'center',color:'#6b7280'}}>No cohorts yet</div>}</div></div>
        )}

        {activePanel==='cohorts'&&selectedCohort&&(
          <div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20,marginBottom:16}}><div style={{fontSize:14,fontWeight:600,marginBottom:16,color:'#000'}}>Add Member</div><select id="add-user-select" style={{padding:10,border:'1px solid #e5e7eb',borderRadius:8,minWidth:250}}><option value="">Select user...</option>{users.filter(u=>!cohortMembers.some((m:any)=>m.id===u.id)).map(u=><option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select><button onClick={()=>{const s=document.getElementById('add-user-select')as HTMLSelectElement;if(s.value)addUserToCohort(s.value);}} style={{padding:'10px 20px',background:'#0d9488',border:'none',borderRadius:8,color:'#fff',cursor:'pointer',marginLeft:8}}>Add</button></div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,marginBottom:16,color:'#000'}}>Members ({cohortMembers.length})</div><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>USER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>EMAIL</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ACTIONS</th></tr></thead><tbody>{cohortMembers.map((m:any)=>(<tr key={m.id}><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{m.name}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{m.email}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><button onClick={()=>removeUserFromCohort(m.id)} style={{padding:'4px 8px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:4,color:'#dc2626',cursor:'pointer'}}>Remove</button></td></tr>))}{cohortMembers.length===0&&<tr><td colSpan={3} style={{padding:40,textAlign:'center',color:'#6b7280'}}>No members</td></tr>}</tbody></table></div></div>
        )}

        {activePanel==='payments'&&(
          <div><div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginBottom:24}}><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:28,fontWeight:600,color:'#16a34a'}}>${stats.revenue.toLocaleString()}</div><div style={{fontSize:12,color:'#6b7280'}}>Total Revenue</div></div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:28,fontWeight:600,color:'#000'}}>{payments.length}</div><div style={{fontSize:12,color:'#6b7280'}}>Transactions</div></div></div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,color:'#000'}}>Recent transactions</div><table style={{width:'100%',borderCollapse:'collapse',marginTop:16}}><thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ORGANISATION</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>PLAN</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>AMOUNT</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>STATUS</th></tr></thead><tbody>{payments.map((p,i)=>(<tr key={i}><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{p.org}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{p.plan}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>${p.amount}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><span style={{fontSize:11,padding:'4px 8px',borderRadius:4,background:p.status==='succeeded'?'#dcfce7':'#fef3c7',color:p.status==='succeeded'?'#16a34a':'#d97706'}}>{p.status}</span></td></tr>))}{payments.length===0&&<tr><td colSpan={4} style={{padding:40,textAlign:'center',color:'#6b7280'}}>No payments</td></tr>}</tbody></table></div></div>
        )}

        {activePanel==='plans'&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {[
              {name:'Professional',price:499,desc:'For individuals'},
              {name:'Team',price:399,desc:'For teams'},
              {name:'Enterprise',price:0,desc:'Custom pricing'}
            ].map((plan,i)=>(
              <div key={i} style={{background:'#fff',border:plan.name==='Professional'?'2px solid #0d9488':'1px solid #e5e7eb',borderRadius:12,padding:24,position:'relative'}}>
                {plan.name==='Professional'&&<div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'#0d9488',color:'#fff',fontSize:10,padding:'4px 12px',borderRadius:10,fontWeight:600}}>Popular</div>}
                <div style={{fontSize:16,fontWeight:600,color:'#000',textAlign:'center'}}>{plan.name}</div>
                <div style={{fontSize:32,fontWeight:600,color:'#000',textAlign:'center',margin:'12px 0'}}>{plan.price===0?'Custom':'$'+plan.price}</div>
                <div style={{fontSize:12,color:'#6b7280',textAlign:'center'}}>{plan.desc}</div>
              </div>
            ))}
          </div>
        )}

        {activePanel==='settings'&&(
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,color:'#000'}}>Platform Settings</div><div style={{fontSize:12,color:'#6b7280',marginTop:4}}>Control core assessment behaviour</div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>Payment gate enabled</div><div style={{fontSize:11,color:'#6b7280'}}>Require payment before report</div></div><div style={{width:44,height:24,background:'#0d9488',borderRadius:24}}></div></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>Require account</div><div style={{fontSize:11,color:'#6b7280'}}>Users must sign up first</div></div><div style={{width:44,height:24,background:'#e5e7eb',borderRadius:24}}></div></div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,color:'#000'}}>Branding</div>
              <div style={{marginTop:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>Platform Name</label><input defaultValue="AI Compass" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13}} /></div>
              <div style={{marginTop:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>Organisation</label><input defaultValue="Nexus FrontierTech" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13}} /></div>
            </div>
          </div>
        )}

        {activePanel==='api'&&(
          <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,color:'#000'}}>Anthropic API</div><div style={{fontSize:12,color:'#6b7280',marginTop:4}}>Powers intelligence research</div>
            <div style={{marginTop:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>API Key</label><input type="password" defaultValue="sk-ant-xxxxx" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,fontFamily:'monospace'}} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
