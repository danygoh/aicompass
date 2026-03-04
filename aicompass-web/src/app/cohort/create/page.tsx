'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCohort } from '@/lib/api';

export default function CreateCohortPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await createCohort(formData);
      setResult(data);
    } catch (err) {
      console.error('Error creating cohort:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <button
          onClick={() => router.push('/')}
          className="text-purple-300 hover:text-white mb-6"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Create Company Cohort</h1>
        <p className="text-purple-200 mb-8">Set up a company to track team AI readiness</p>

        {!result ? (
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
                  placeholder="Acme Inc"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
                  placeholder="Technology, Finance, Healthcare..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Cohort'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Cohort Created!</h2>
              
              <div className="bg-white/10 rounded-xl p-6 mt-6">
                <p className="text-purple-300 text-sm mb-2">Invite Code</p>
                <p className="text-4xl font-bold text-white font-mono tracking-wider">{result.invite_code}</p>
              </div>

              <p className="text-purple-300 text-sm mt-6">
                Share this code with your team to take the assessment
              </p>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => router.push(`/dashboard?id=${result.company_id}`)}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
