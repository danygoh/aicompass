// API client for AI Compass
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001/api';

export async function startAssessment() {
  const res = await fetch(`${API_BASE}/assessment/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  return res.json();
}

export async function getAssessment(id: string) {
  const res = await fetch(`${API_BASE}/assessment/${id}`);
  return res.json();
}

export async function saveProfile(id: string, data: { name: string; email: string; role: string; company_name?: string; company_industry?: string; company_country?: string }) {
  const res = await fetch(`${API_BASE}/assessment/${id}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function saveAnswer(id: string, questionId: number, answer: number) {
  const res = await fetch(`${API_BASE}/assessment/${id}/answer`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, answer })
  });
  return res.json();
}

export async function getQuestions() {
  const res = await fetch(`${API_BASE}/assessment/questions`);
  return res.json();
}

export async function submitAssessment(id: string) {
  const res = await fetch(`${API_BASE}/assessment/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function getReport(id: string) {
  const res = await fetch(`${API_BASE}/assessment/${id}/report`);
  return res.json();
}

export async function getValidationData(id: string) {
  const res = await fetch(`${API_BASE}/validation/${id}`);
  return res.json();
}

export async function submitValidation(id: string, data: { validated: boolean; corrections?: any; notes?: string }) {
  const res = await fetch(`${API_BASE}/validation/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function triggerIntelligenceCollection(id: string) {
  const res = await fetch(`${API_BASE}/intelligence/collect/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

export async function getIntelligenceStatus(id: string) {
  const res = await fetch(`${API_BASE}/intelligence/status/${id}`);
  return res.json();
}

export async function createCohort(data: { company_name: string; industry: string }) {
  const res = await fetch(`${API_BASE}/cohort/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getCohortInfo(code: string) {
  const res = await fetch(`${API_BASE}/cohort/info/${code}`);
  return res.json();
}

export async function getCompanyDashboard(companyId: string) {
  const res = await fetch(`${API_BASE}/cohort/dashboard/${companyId}`);
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/cohort/leaderboard`);
  return res.json();
}

// Auth
export async function register(data: { email: string; password: string; name: string }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function login(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const res = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Payments
export async function getPricing() {
  const res = await fetch(`${API_BASE}/payments/pricing`);
  return res.json();
}

export async function createCheckout(tier: string, companyId?: string) {
  const res = await fetch(`${API_BASE}/payments/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, company_id: companyId })
  });
  return res.json();
}

export async function createBulkCodes(companyId: string, quantity: number) {
  const res = await fetch(`${API_BASE}/payments/bulk-codes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_id: companyId, quantity })
  });
  return res.json();
}
