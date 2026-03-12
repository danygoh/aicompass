'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'admins' | 'reports' | 'cohorts' | 'payments' | 'plans' | 'settings' | 'api';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Tab>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  const [cohortMembers, setCohortMembers] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState({ search: '', cohort: '' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', company: '', tier: 'FREE' });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, a, c, p, r] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/assessments').then(r => r.json()),
        fetch('/api/admin/cohorts').then(r => r.json()),
        fetch('/api/admin/payments').then(r => r.json()),
        fetch('/api/admin/reports').then(r => r.json()),
      ]);
      setUsers(u.users || []);
      setAssessments(a.assessments || []);
      setCohorts(c.cohorts || []);
      setPayments(p.payments || []);
      setReports(r.reports || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Stats calculations
  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const startedAssessments = assessments.filter(a => a.status === 'STARTED');
  const completionRate = assessments.length > 0 ? Math.round((completedAssessments.length / assessments.length) * 100) : 0;
  
  const tierStats = {
    free: users.filter(u => u.tier === 'Free' || u.tier === 'FREE').length,
    paid: users.filter(u => u.tier && u.tier !== 'Free' && u.tier !== 'FREE').length,
    cohort: users.filter(u => u.tier === 'Cohort').length,
  };

  const recentActivity = [...users].sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()).slice(0, 20);
  const latestReports = [...reports].sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()).slice(0, 20);

  // Monthly revenue
  const monthlyRevenue = payments.filter(p => p.status === 'completed').reduce((acc: any, p) => {
    const month = new Date(p.createdAt).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + (p.amount || 0);
    return acc;
  }, {});

  const saveUser = async () => {
    if (!editingUser) return;
    await fetch('/api/admin/users/' + editingUser.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingUser.name, subscription: editingUser.tier }) });
    setEditingUser(null);
    loadData();
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password) return;
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    setShowAddUser(false);
    setNewUser({ name: '', email: '', password: '', company: '', tier: 'FREE' });
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

  const downloadUsersXLS = () => {
    const headers = ['Name', 'Email', 'Company', 'Industry', 'Tier', 'Joined', 'Last Login', 'Last Completed', 'Score', 'Assessments'];
    const rows = users.map(u => [
      u.name, 
      u.email, 
      u.company, 
      u.industry, 
      u.tier, 
      new Date(u.joinedAt).toLocaleDateString(),
      u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-',
      u.lastCompletedAt ? new Date(u.lastCompletedAt).toLocaleString() : '-',
      u.lastScore || '-',
      u.assessmentCount
    ]);
    const csv = [headers, ...rows].map(row => row.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.xls';
    a.click();
  };

  const downloadReport = async (report: any) => {
    // Fetch fresh report data from API using stored assessment
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            firstName: report.userName?.split(' ')[0] || '',
            lastName: report.userName?.split(' ').slice(1).join(' ') || '',
            company: report.company || '',
            industry: report.industry || '',
            country: '',
            seniority: '',
          },
          responses: [],
          intelligence: {},
          totalScore: report.totalScore,
          dimensionScores: report.dimensionScores,
          tier: report.tier,
          reportId: report.id,
        }),
      });
      
      var reportData = await response.json();
    } catch (e) {
      console.error('Failed to fetch report:', e);
      reportData = {};
    }
    
    const rd = reportData || {};
    const executiveSummary = rd.executiveSummary || '';
    const recommendations = rd.recommendations || [];
    const nextSteps = rd.nextSteps || [];
    const overview = rd.findings?.overview || '';
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Compass Report - ${report.userName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e3a5f; line-height: 1.6; }
    h1 { color: #1e3a5f; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
    h2 { color: #0d9488; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h3 { color: #1e3a5f; margin-top: 20px; }
    .score { font-size: 64px; font-weight: bold; color: #f59e0b; }
    .score-label { font-size: 14px; color: #6b7280; }
    .tier { display: inline-block; background: #f0fdfa; color: #0d9488; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; color: #6b7280; font-size: 12px; font-weight: 600; }
    .dimension-bar { height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
    .dimension-fill { height: 100%; background: linear-gradient(90deg, #0d9488, #14b8a6); border-radius: 6px; }
    .priority-high { color: #dc2626; font-weight: 600; }
    .priority-medium { color: #d97706; font-weight: 600; }
    .recommendation { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 12px 0; border-left: 4px solid #0d9488; }
    .actions-list { padding-left: 20px; }
    .actions-list li { margin: 8px 0; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 12px 0; }
  </style>
</head>
<body>
  <h1>🤖 AI Compass Assessment Report</h1>
  <p class="score-label">Generated: ${report.completedAt ? new Date(report.completedAt).toLocaleString() : new Date().toLocaleString()}</p>
  
  <h2>👤 User Information</h2>
  <table>
    <tr><th style="width:150px">Name</th><td>${report.userName}</td></tr>
    <tr><th>Email</th><td>${report.email}</td></tr>
    <tr><th>Company</th><td>${report.company || 'Not specified'}</td></tr>
    <tr><th>Industry</th><td>${report.industry || 'Not specified'}</td></tr>
  </table>
  
  <h2>📊 Assessment Results</h2>
  <div style="display:flex;align-items:center;gap:30px;margin:20px 0;">
    <div class="score">${report.totalScore || 0}</div>
    <div><div class="score-label">out of 100</div><span class="tier">${report.tier || 'Beginner'}</span></div>
  </div>
  
  <h2>📈 Dimension Scores</h2>
  <table>
    <tr><th>Dimension</th><th style="width:100px">Score</th><th>Progress</th></tr>
    <tr><td>AI Literacy</td><td><strong>${report.dimensionScores?.[0] || 0}/20</strong></td><td><div class="dimension-bar"><div class="dimension-fill" style="width:${((report.dimensionScores?.[0] || 0)/20)*100}%"></div></div></td></tr>
    <tr><td>Strategy & Vision</td><td><strong>${report.dimensionScores?.[1] || 0}/20</strong></td><td><div class="dimension-bar"><div class="dimension-fill" style="width:${((report.dimensionScores?.[1] || 0)/20)*100}%"></div></div></td></tr>
    <tr><td>Data & Infrastructure</td><td><strong>${report.dimensionScores?.[2] || 0}/20</strong></td><td><div class="dimension-bar"><div class="dimension-fill" style="width:${((report.dimensionScores?.[2] || 0)/20)*100}%"></div></div></td></tr>
    <tr><td>Culture & Skills</td><td><strong>${report.dimensionScores?.[3] || 0}/20</strong></td><td><div class="dimension-bar"><div class="dimension-fill" style="width:${((report.dimensionScores?.[3] || 0)/20)*100}%"></div></div></td></tr>
    <tr><td>Governance & Ethics</td><td><strong>${report.dimensionScores?.[4] || 0}/20</strong></td><td><div class="dimension-bar"><div class="dimension-fill" style="width:${((report.dimensionScores?.[4] || 0)/20)*100}%"></div></div></td></tr>
  </table>
  
  ${executiveSummary ? `<h2>📝 Executive Summary</h2><div class="info-box">${executiveSummary.replace(/\n/g, '<br>')}</div>` : ''}
  
  ${overview ? `<h2>🏢 Industry & Company Overview</h2><div class="info-box">${overview.replace(/\n/g, '<br>')}</div>` : ''}
  
  ${recommendations.length > 0 ? `<h2>💡 Recommendations</h2>
  ${recommendations.map((rec: any) => `
    <div class="recommendation">
      <h3>${rec.title || 'Recommendation'}</h3>
      <p><span class="priority-${rec.priority || 'medium'}">${(rec.priority || 'medium').toUpperCase()} PRIORITY</span> · ${rec.dimension || ''}</p>
      <p>${rec.description || ''}</p>
      ${rec.whyItMatters ? `<p><strong>Why it matters:</strong> ${rec.whyItMatters}</p>` : ''}
      ${rec.actions && rec.actions.length > 0 ? `<p><strong>Action Items:</strong></p><ul class="actions-list">${rec.actions.map((a: any) => `<li>${a}</li>`).join('')}</ul>` : ''}
      ${rec.timeline ? `<p><strong>Timeline:</strong> ${rec.timeline}</p>` : ''}
      ${rec.impact ? `<p><strong>Impact:</strong> ${rec.impact}</p>` : ''}
    </div>
  `).join('')}` : ''}
  
  ${nextSteps.length > 0 ? `<h2>🎯 Next Steps</h2>
  <ol>
  ${nextSteps.map((step: any) => `<li>${typeof step === 'string' ? step : step.text || ''}</li>`).join('')}
  </ol>
  ` : ''}
  
  <div class="footer">
    <p>🔷 AI Compass — AI Readiness Assessment Platform</p>
    <p>This report is confidential and intended for the use of the assessed individual/organisation.</p>
    <p>For questions or support, contact your AI Compass administrator.</p>
  </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Compass-Report-${(report.userName || 'User').replace(/\s+/g, '-')}-${new Date(report.completedAt || Date.now()).toISOString().split('T')[0]}.html`;
    a.click();
  };

  const downloadAllReportsXLS = () => {
    const headers = ['Name', 'Email', 'Company', 'Industry', 'Score', 'Tier', 'Completed'];
    const rows = reports.map(r => [
      r.userName, r.email, r.company, r.industry, r.totalScore, r.tier, r.completedAt ? new Date(r.completedAt).toLocaleString() : '-'
    ]);
    const csv = [headers, ...rows].map(row => row.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-reports.xls';
    a.click();
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !userFilter.search || u.name.toLowerCase().includes(userFilter.search.toLowerCase()) || u.email.toLowerCase().includes(userFilter.search.toLowerCase());
    const matchCohort = !userFilter.cohort || u.cohort === userFilter.cohort;
    const isNotAdmin = u.role !== 'ADMIN';
    return matchSearch && matchCohort && isNotAdmin;
  });

  const filteredAdmins = users.filter(u => u.role === 'ADMIN');

  if (status === 'loading' || (status === 'authenticated' && loading)) return <div style={{padding:40,textAlign:'center'}}>Loading...</div>;
  if (status !== 'authenticated' || (session?.user as any)?.role !== 'ADMIN') return null;

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <aside style={{width:260,background:'#fff',borderRight:'1px solid #e5e7eb',padding:20,display:'flex',flexDirection:'column'}}>
        <div style={{fontFamily:'Fraunces, serif',fontSize:18,color:'#1e3a5f'}}>AI <span style={{color:'#f59e0b'}}>Compass</span></div>
        <div style={{fontSize:11,color:'#6b7280',marginTop:4,marginBottom:20}}>Admin Dashboard</div>
        <nav style={{flex:1}}>
          {[
            {id:'overview',icon:'📊',label:'Overview',badge:0},
            {id:'users',icon:'👥',label:'Clients',badge:users.filter(u => u.role !== 'ADMIN').length},
            {id:'admins',icon:'🔐',label:'Admins',badge:users.filter(u => u.role === 'ADMIN').length},
            {id:'reports',icon:'📄',label:'Reports',badge:reports.length},
            {id:'cohorts',icon:'🏫',label:'Cohorts',badge:cohorts.length},
            {id:'payments',icon:'💳',label:'Payments',badge:0},
            {id:'plans',icon:'📦',label:'Plans & Pricing',badge:0},
            {id:'settings',icon:'⚙️',label:'Settings',badge:0},
            {id:'api',icon:'🔌',label:'API',badge:0}
          ].map(item => (
            <button key={item.id} onClick={()=>{setSelectedCohort(null);setActivePanel(item.id as Tab)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',background:activePanel===item.id?'#f0fdfa':'transparent',border:'none',borderRadius:8,fontSize:13,color:activePanel===item.id?'#0d9488':'#374151',cursor:'pointer',textAlign:'left',marginBottom:4}}>
              {item.icon} {item.label} {item.badge>0&&<span style={{marginLeft:'auto',fontSize:10,background:'#0d9488',color:'#fff',padding:'2px 6px',borderRadius:10}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{marginTop:'auto',paddingTop:20,borderTop:'1px solid #e5e7eb'}}><button onClick={loadData} style={{fontSize:12,color:'#6b7280',background:'none',border:'none',cursor:'pointer'}}>Refresh</button></div>
      </aside>

      <div style={{flex:1,padding:24,background:'#f9fafb',overflowY:'auto'}}>
        <h1 style={{fontSize:24,fontWeight:600,color:'#1e3a5f',margin:0,marginBottom:24}}>
          {activePanel==='overview'&&'Overview'}
          {activePanel==='users'&&'Clients'}
          {activePanel==='admins'&&'Admins'}
          {activePanel==='reports'&&'Reports'}
          {activePanel==='cohorts'&&(selectedCohort?selectedCohort.name:'Cohorts')}
          {activePanel==='payments'&&'Payments'}
          {activePanel==='plans'&&'Plans & Pricing'}
          {activePanel==='settings'&&'Settings'}
          {activePanel==='api'&&'API & Integrations'}
        </h1>
        {selectedCohort&&<button onClick={()=>setSelectedCohort(null)} style={{marginBottom:16,padding:'8px 16px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:6,cursor:'pointer'}}>Back</button>}

        {/* OVERVIEW */}
        {activePanel==='overview'&&(
          <div>
            {/* Stats Grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#000'}}>{users.length}</div><div style={{fontSize:12,color:'#6b7280'}}>Total Users</div></div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#000'}}>{completedAssessments.length}</div><div style={{fontSize:12,color:'#6b7280'}}>Completed</div></div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#000'}}>{completionRate}%</div><div style={{fontSize:12,color:'#6b7280'}}>Completion Rate</div></div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:32,fontWeight:600,color:'#16a34a'}}>${payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}</div><div style={{fontSize:12,color:'#6b7280'}}>Revenue</div></div>
            </div>

            {/* Tier Distribution */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
                <div style={{fontSize:14,fontWeight:600,color:'#000',marginBottom:12}}>Tier Distribution</div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{width:12,height:12,background:'#6b7280',borderRadius:2}}></div><span style={{fontSize:13}}>Free: {tierStats.free}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{width:12,height:12,background:'#0d9488',borderRadius:2}}></div><span style={{fontSize:13}}>Paid: {tierStats.paid}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:12,height:12,background:'#f59e0b',borderRadius:2}}></div><span style={{fontSize:13}}>Cohort: {tierStats.cohort}</span></div>
              </div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
                <div style={{fontSize:14,fontWeight:600,color:'#000',marginBottom:12}}>Assessment Status</div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{width:12,height:12,background:'#16a34a',borderRadius:2}}></div><span style={{fontSize:13}}>Completed: {completedAssessments.length}</span></div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><div style={{width:12,height:12,background:'#f59e0b',borderRadius:2}}></div><span style={{fontSize:13}}>Started: {startedAssessments.length}</span></div>
              </div>
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
                <div style={{fontSize:14,fontWeight:600,color:'#000',marginBottom:12}}>Monthly Revenue</div>
                {Object.entries(monthlyRevenue).length > 0 ? Object.entries(monthlyRevenue).map(([month, amt]) => (
                  <div key={month} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span>{month}</span><span style={{fontWeight:600}}>${(amt as number).toLocaleString()}</span></div>
                )) : <div style={{fontSize:13,color:'#6b7280'}}>No revenue data</div>}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20,marginBottom:24}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000',marginBottom:12}}>Recent Activity (Last 20)</div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>USER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>COMPANY</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>LAST ACTIVE</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ASSESSMENTS</th></tr></thead>
                <tbody>
                  {recentActivity.map((u,i)=><tr key={i}><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><div style={{fontWeight:600,color:'#000'}}>{u.name}</div><div style={{fontSize:11,color:'#6b7280'}}>{u.email}</div></td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{u.company || '-'}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{u.lastActive}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{u.assessments}</td></tr>)}
                  {recentActivity.length===0&&<tr><td colSpan={4} style={{padding:40,textAlign:'center',color:'#6b7280'}}>No users</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Latest Reports */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000',marginBottom:12}}>Latest Reports (Last 20)</div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>USER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>COMPANY</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>SCORE</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>TIER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>COMPLETED</th></tr></thead>
                <tbody>
                  {latestReports.map((a,i)=><tr key={i}><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><div style={{fontWeight:600,color:'#000'}}>{a.user}</div></td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{a.company || '-'}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}><span style={{fontWeight:600,color:'#f59e0b'}}>{a.score}</span></td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{a.tier || '-'}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{a.completedAt ? new Date(a.completedAt).toLocaleDateString() : '-'}</td></tr>)}
                  {latestReports.length===0&&<tr><td colSpan={5} style={{padding:40,textAlign:'center',color:'#6b7280'}}>No reports</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {activePanel==='users'&&(
          <div>
            <div style={{display:'flex',gap:12,marginBottom:16}}>
              <input placeholder="Search users..." value={userFilter.search} onChange={e=>setUserFilter({...userFilter,search:e.target.value})} style={{padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,flex:1,maxWidth:300}} />
              <select value={userFilter.cohort} onChange={e=>setUserFilter({...userFilter,cohort:e.target.value})} style={{padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,minWidth:150}}>
                <option value="">All Cohorts</option>
                {cohorts.map(c=><option key={c.id} value={c.code}>{c.name}</option>)}
              </select>
              <button onClick={downloadUsersXLS} style={{padding:'10px 20px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,cursor:'pointer'}}>Download XLS</button>
              <button onClick={()=>setShowAddUser(true)} style={{padding:'10px 20px',background:'#0d9488',border:'none',borderRadius:8,color:'#fff',cursor:'pointer'}}>+ Add User</button>
            </div>

            {showAddUser && (
              <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20,marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Add New Client User</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                  <div><label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Name *</label><input placeholder="Full name" value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})} style={{width:'100%',padding:10,border:'1px solid #e5e7eb',borderRadius:8}} /></div>
                  <div><label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Email *</label><input placeholder="email@example.com" type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} style={{width:'100%',padding:10,border:'1px solid #e5e7eb',borderRadius:8}} /></div>
                  <div><label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Password *</label><input placeholder="Temporary password" type="password" value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} style={{width:'100%',padding:10,border:'1px solid #e5e7eb',borderRadius:8}} /></div>
                  <div><label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Company</label><input placeholder="Company name" value={newUser.company} onChange={e=>setNewUser({...newUser,company:e.target.value})} style={{width:'100%',padding:10,border:'1px solid #e5e7eb',borderRadius:8}} /></div>
                  <div><label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Tier</label><select value={newUser.tier} onChange={e=>setNewUser({...newUser,tier:e.target.value})} style={{width:'100%',padding:10,border:'1px solid #e5e7eb',borderRadius:8}}><option value="FREE">Free</option><option value="PROFESSIONAL">Professional</option><option value="TEAM">Team</option><option value="ENTERPRISE">Enterprise</option></select></div>
                  <div style={{display:'flex',alignItems:'flex-end',gap:8}}><button onClick={createUser} style={{padding:'10px 20px',background:'#0d9488',border:'none',borderRadius:8,color:'#fff',cursor:'pointer'}}>Create User</button><button onClick={()=>setShowAddUser(false)} style={{padding:'10px 20px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,cursor:'pointer'}}>Cancel</button></div>
                </div>
              </div>
            )}

            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>USER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>COMPANY</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>TIER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>JOINED</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>LAST LOGIN</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>LAST COMPLETED</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>SCORE</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ACTIONS</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u=>(
                    <tr key={u.id}>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}>{editingUser?.id===u.id?<input value={editingUser.name} onChange={e=>setEditingUser({...editingUser,name:e.target.value})} style={{padding:4,border:'1px solid #e5e7eb',borderRadius:4,color:'#000'}} />:<><div style={{fontWeight:600,color:'#000'}}>{u.name}</div><div style={{fontSize:11,color:'#6b7280'}}>{u.email}</div></>}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{u.company || '-'}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}>{editingUser?.id===u.id?<select value={editingUser.tier} onChange={e=>setEditingUser({...editingUser,tier:e.target.value})}><option>FREE</option><option>PROFESSIONAL</option><option>TEAM</option><option>ENTERPRISE</option></select>:<span style={{fontSize:11,padding:'4px 8px',background:'#f3f4f6',borderRadius:4,color:'#000'}}>{u.tier||'FREE'}</span>}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000',fontSize:12}}>{new Date(u.joinedAt).toLocaleDateString()}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000',fontSize:12}}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000',fontSize:12}}>{u.lastCompletedAt ? new Date(u.lastCompletedAt).toLocaleDateString() : '-'}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',fontSize:12,fontWeight:600,color:u.lastScore ? '#f59e0b':'#6b7280'}}>{u.lastScore || '-'}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}>{editingUser?.id===u.id?<><button onClick={saveUser} style={{padding:'4px 8px',background:'#0d9488',border:'none',borderRadius:4,color:'#fff',cursor:'pointer',marginRight:4}}>Save</button><button onClick={()=>setEditingUser(null)} style={{padding:'4px 8px',border:'1px solid #e5e7eb',borderRadius:4,cursor:'pointer'}}>Cancel</button></>:<><button onClick={()=>setEditingUser({id:u.id,name:u.name,tier:u.tier||'FREE'})} style={{padding:'4px 8px',border:'1px solid #e5e7eb',borderRadius:4,cursor:'pointer',marginRight:4,color:'#000'}}>Edit</button><button onClick={()=>deleteUser(u.id)} style={{padding:'4px 8px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:4,color:'#dc2626',cursor:'pointer'}}>Delete</button></>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length===0&&<div style={{padding:40,textAlign:'center',color:'#6b7280'}}>No users found</div>}
            </div>
          </div>
        )}

        {/* ADMINS */}
        {activePanel==='admins'&&(
          <div>
            <div style={{marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button onClick={() => {
                const name = prompt('Admin name:');
                const email = prompt('Admin email:');
                const password = prompt('Temporary password:');
                if (name && email && password) {
                  fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: 'ADMIN' })
                  }).then(() => loadData());
                }
              }} style={{padding:'10px 20px',background:'#0d9488',border:'none',borderRadius:8,color:'#fff',cursor:'pointer'}}>+ Add Admin</button>
            </div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>NAME</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>EMAIL</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>CREATED</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ACTIONS</th></tr></thead>
                <tbody>
                  {filteredAdmins.map(a=>(
                    <tr key={a.id}>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',fontWeight:600,color:'#000'}}>{a.name}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{a.email}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{new Date(a.joinedAt).toLocaleDateString()}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}>
                        <button style={{padding:'4px 8px',border:'1px solid #e5e7eb',borderRadius:4,cursor:'pointer',marginRight:4}}>Edit</button>
                        <button onClick={() => {
                          if (confirm('Delete this admin? This cannot be undone.')) {
                            fetch('/api/admin/users/' + a.id, { method: 'DELETE' }).then(() => loadData());
                          }
                        }} style={{padding:'4px 8px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:4,color:'#dc2626',cursor:'pointer'}}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAdmins.length===0&&<div style={{padding:40,textAlign:'center',color:'#6b7280'}}>No admins found</div>}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {activePanel==='reports'&&(
          <div>
            <div style={{display:'flex',gap:12,marginBottom:16}}>
              <button onClick={downloadAllReportsXLS} style={{padding:'10px 20px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,cursor:'pointer'}}>Download All (XLS)</button>
            </div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>USER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>COMPANY</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>SCORE</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>TIER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>COMPLETED</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ACTIONS</th></tr></thead>
                <tbody>
                  {reports.map(r=>(
                    <tr key={r.id}>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><div style={{fontWeight:600,color:'#000'}}>{r.userName}</div><div style={{fontSize:11,color:'#6b7280'}}>{r.email}</div></td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{r.company || '-'}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',fontWeight:600,color:'#f59e0b'}}>{r.totalScore}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{r.tier || '-'}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{r.completedAt ? new Date(r.completedAt).toLocaleString() : '-'}</td>
                      <td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><button onClick={()=>downloadReport(r)} style={{padding:'4px 8px',background:'#0d9488',border:'none',borderRadius:4,color:'#fff',cursor:'pointer'}}>Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reports.length===0&&<div style={{padding:40,textAlign:'center',color:'#6b7280'}}>No reports available</div>}
            </div>
          </div>
        )}

        {/* COHORTS */}
        {activePanel==='cohorts'&&!selectedCohort&&(
          <div><div style={{marginBottom:16}}><button onClick={createCohort} style={{padding:'10px 20px',background:'#0d9488',border:'none',borderRadius:8,color:'#fff',cursor:'pointer'}}>+ New Cohort</button></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>{cohorts.map(c=>(<div key={c.id} onClick={()=>openCohort(c)} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div style={{fontWeight:600,color:'#000'}}>{c.name}</div><span style={{fontSize:10,padding:'3px 8px',borderRadius:4,background:c.status==='ACTIVE'?'#dcfce7':'#f3f4f6',color:c.status==='ACTIVE'?'#16a34a':'#6b7280'}}>{c.status}</span></div><div style={{fontFamily:'monospace',fontSize:12,color:'#6b7280',marginBottom:16}}>{c.code}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:12,color:'#6b7280'}}>{c.maxUsers||'∞'} participants</span><button onClick={(e)=>{e.stopPropagation();deleteCohort(c.id);}} style={{padding:'4px 8px',fontSize:11,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:4,color:'#dc2626',cursor:'pointer'}}>Delete</button></div></div>))}{cohorts.length===0&&<div style={{gridColumn:'1/-1',padding:40,textAlign:'center',color:'#6b7280'}}>No cohorts yet</div>}</div></div>
        )}

        {activePanel==='cohorts'&&selectedCohort&&(
          <div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20,marginBottom:16}}><div style={{fontSize:14,fontWeight:600,marginBottom:16,color:'#000'}}>Add Member</div><select id="add-user-select" style={{padding:10,border:'1px solid #e5e7eb',borderRadius:8,minWidth:250}}><option value="">Select user...</option>{users.filter(u=>!cohortMembers.some((m:any)=>m.id===u.id)).map(u=><option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select><button onClick={()=>{const s=document.getElementById('add-user-select')as HTMLSelectElement;if(s.value)addUserToCohort(s.value);}} style={{padding:'10px 20px',background:'#0d9488',border:'none',borderRadius:8,color:'#fff',cursor:'pointer',marginLeft:8}}>Add</button></div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,marginBottom:16,color:'#000'}}>Members ({cohortMembers.length})</div><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>USER</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>EMAIL</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ACTIONS</th></tr></thead><tbody>{cohortMembers.map((m:any)=>(<tr key={m.id}><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{m.name}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{m.email}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><button onClick={()=>removeUserFromCohort(m.id)} style={{padding:'4px 8px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:4,color:'#dc2626',cursor:'pointer'}}>Remove</button></td></tr>))}{cohortMembers.length===0&&<tr><td colSpan={3} style={{padding:40,textAlign:'center',color:'#6b7280'}}>No members</td></tr>}</tbody></table></div></div>
        )}

        {/* PAYMENTS */}
        {activePanel==='payments'&&(
          <div><div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginBottom:24}}><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:28,fontWeight:600,color:'#16a34a'}}>${payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}</div><div style={{fontSize:12,color:'#6b7280'}}>Total Revenue</div></div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:28,fontWeight:600,color:'#000'}}>{payments.length}</div><div style={{fontSize:12,color:'#6b7280'}}>Transactions</div></div></div><div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}><div style={{fontSize:14,fontWeight:600,color:'#000'}}>Recent transactions</div><table style={{width:'100%',borderCollapse:'collapse',marginTop:16}}><thead><tr><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>ORGANISATION</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>PLAN</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>AMOUNT</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>STATUS</th><th style={{textAlign:'left',padding:12,fontSize:11,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #e5e7eb'}}>DATE</th></tr></thead><tbody>{payments.map((p,i)=>(<tr key={i}><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{p.org}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{p.plan}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>${p.amount}</td><td style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><span style={{fontSize:11,padding:'4px 8px',borderRadius:4,background:p.status==='completed'?'#dcfce7':'#fef3c7',color:p.status==='completed'?'#16a34a':'#d97706'}}>{p.status}</span></td><td style={{padding:12,borderBottom:'1px solid #e5e7eb',color:'#000'}}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td></tr>))}{payments.length===0&&<tr><td colSpan={5} style={{padding:40,textAlign:'center',color:'#6b7280'}}>No payments</td></tr>}</tbody></table></div></div>
        )}

        {/* PLANS */}
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

        {/* SETTINGS */}
        {activePanel==='settings'&&(
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {/* Assessment Config */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>Assessment Configuration</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4,marginBottom:16}}>Control assessment behaviour and flow</div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>Payment Gate Enabled</div><div style={{fontSize:11,color:'#6b7280'}}>Require payment before viewing report</div></div><div style={{width:44,height:24,background:'#0d9488',borderRadius:24}}></div></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>Require Account</div><div style={{fontSize:11,color:'#6b7280'}}>Users must sign up before assessment</div></div><div style={{width:44,height:24,background:'#0d9488',borderRadius:24}}></div></div>
              <div style={{padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div style={{fontSize:13,fontWeight:500,color:'#000',marginBottom:6}}>Questions Count</div><input type="number" defaultValue={25} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8,width:100}} /></div>
              <div style={{padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div style={{fontSize:13,fontWeight:500,color:'#000',marginBottom:6}}>Passing Score (%)</div><input type="number" defaultValue={50} style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8,width:100}} /></div>
            </div>

            {/* Email Settings */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>Email Settings</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4,marginBottom:16}}>Configure email notifications</div>
              <div style={{marginBottom:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>From Email</label><input defaultValue="noreply@aicompass.ai" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13}} /></div>
              <div style={{marginBottom:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>Reply-To Email</label><input defaultValue="support@nexusfrontiertech.com" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13}} /></div>
              <div style={{marginBottom:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>Email Subject - Assessment Complete</label><input defaultValue="Your AI Compass Report is Ready" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13}} /></div>
            </div>

            {/* Cohort Settings */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>Cohort Settings</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4,marginBottom:16}}>Default cohort configuration</div>
              <div style={{marginBottom:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>Default Cohort Code Prefix</label><input defaultValue="AIC" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13}} /></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>Auto-create Cohort on Signup</div><div style={{fontSize:11,color:'#6b7280'}}>Create cohort automatically for new organisations</div></div><div style={{width:44,height:24,background:'#e5e7eb',borderRadius:24}}></div></div>
            </div>

            {/* Platform Info */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>Platform Information</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4,marginBottom:16}}>Environment and deployment details</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><div style={{fontSize:11,color:'#6b7280'}}>Environment</div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>Production</div></div>
                <div><div style={{fontSize:11,color:'#6b7280'}}>NEXTAUTH_URL</div><div style={{fontSize:13,fontWeight:500,color:'#000',wordBreak:'break-all'}}>https://teal-gaufre-4fee83.netlify.app</div></div>
                <div><div style={{fontSize:11,color:'#6b7280'}}>Database</div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>Neon PostgreSQL</div></div>
                <div><div style={{fontSize:11,color:'#6b7280'}}>Last Updated</div><div style={{fontSize:13,fontWeight:500,color:'#000'}}>{new Date().toLocaleDateString()}</div></div>
              </div>
            </div>

            {/* Data Export */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>Data Export</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4,marginBottom:16}}>Export platform data</div>
              <div style={{display:'flex',gap:12}}>
                <button onClick={downloadUsersXLS} style={{padding:'10px 20px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,cursor:'pointer'}}>Export Users (XLS)</button>
                <button style={{padding:'10px 20px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,cursor:'pointer'}}>Export Assessments (CSV)</button>
                <button style={{padding:'10px 20px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,cursor:'pointer'}}>Export Payments (CSV)</button>
              </div>
            </div>

            {/* Audit Log */}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>Recent Admin Actions</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4,marginBottom:16}}>Track recent administrative changes</div>
              <div style={{fontSize:13,color:'#6b7280',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><span style={{color:'#000',fontWeight:500}}>Max</span> created user <span style={{color:'#0d9488'}}>admin@compass.ai</span> - {new Date().toLocaleString()}</div>
              <div style={{fontSize:13,color:'#6b7280',padding:'12px 0',borderBottom:'1px solid #e5e7eb'}}><span style={{color:'#000',fontWeight:500}}>Max</span> updated cohort <span style={{color:'#0d9488'}}>OXSAID-2026</span> - {new Date().toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* API */}
        {activePanel==='api'&&(
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>DeepSeek API</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>Powers intelligence research</div>
              <div style={{marginTop:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>API Key</label><input type="password" defaultValue="sk-xxxxxxxxxxxxxxxx" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,fontFamily:'monospace'}} /></div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:20}}>
              <div style={{fontSize:14,fontWeight:600,color:'#000'}}>Anthropic API</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>Powers report generation</div>
              <div style={{marginTop:12}}><label style={{display:'block',fontSize:12,fontWeight:500,color:'#000',marginBottom:6}}>API Key</label><input type="password" defaultValue="sk-ant-xxxxxxxxxxxxxxxx" style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,fontFamily:'monospace'}} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
