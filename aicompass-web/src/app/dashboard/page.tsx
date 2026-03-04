'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCompanyDashboard, getLeaderboard } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'overview' | 'leaderboard'>('overview');

  useEffect(() => {
    if (!companyId) {
      router.push('/');
      return;
    }
    loadDashboard();
  }, [companyId, router]);

  const loadDashboard = async () => {
    try {
      const dashboardData = await getCompanyDashboard(companyId!);
      setData(dashboardData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    // Spec colors: Beginner=#FDECEA, Developing=#FFF3E0, Intermediate=#E8F5E9, Advanced=#E3EBF5
    switch (tier) {
      case 'Beginner': return 'bg-[#FDECEA] text-red-800';
      case 'Developing': return 'bg-[#FFF3E0] text-amber-800';
      case 'Intermediate': return 'bg-[#E8F5E9] text-green-800';
      case 'Advanced': return 'bg-[#E3EBF5] text-blue-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data || data.total_assessments === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Company Dashboard</h1>
          <p className="text-purple-200 mb-8">No completed assessments yet</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{data.company.name}</h1>
            <p className="text-purple-200">{data.company.industry} • Invite Code: <span className="font-mono bg-white/10 px-2 py-1 rounded">{data.company.invite_code}</span></p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            New Assessment
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 rounded-lg ${tab === 'overview' ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`px-4 py-2 rounded-lg ${tab === 'leaderboard' ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200'}`}
          >
            Leaderboard
          </button>
        </div>

        {tab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-purple-300 text-sm">Total Assessments</p>
                <p className="text-4xl font-bold text-white">{data.summary.total_assessments}</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-purple-300 text-sm">Average Score</p>
                <p className="text-4xl font-bold text-white">{data.summary.average_score}</p>
                <p className="text-purple-400 text-sm">out of 100</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-purple-300 text-sm">Highest Score</p>
                <p className="text-4xl font-bold text-green-400">{data.summary.max_score}</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-purple-300 text-sm">Lowest Score</p>
                <p className="text-4xl font-bold text-red-400">{data.summary.min_score}</p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Dimension Breakdown</h2>
              <div className="space-y-4">
                {Object.entries(data.dimensions).map(([dim, score]: [string, any]) => (
                  <div key={dim} className="flex items-center gap-4">
                    <div className="w-40 text-purple-200 text-sm">{dim}</div>
                    <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-white font-semibold">{score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Distribution */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Tier Distribution</h2>
              <div className="flex gap-4">
                {Object.entries(data.tiers).map(([tier, count]: [string, any]) => (
                  <div key={tier} className={`px-4 py-2 rounded-lg ${getTierColor(tier)}`}>
                    <span className="font-semibold">{count}</span> {tier}
                  </div>
                ))}
              </div>
            </div>

            {/* Individuals */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Individual Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-purple-300 text-sm border-b border-white/10">
                      <th className="text-left py-3">Name</th>
                      <th className="text-left py-3">Role</th>
                      <th className="text-right py-3">Score</th>
                      <th className="text-right py-3">Tier</th>
                      <th className="text-right py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.individuals.map((person: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-3 text-white">{person.name}</td>
                        <td className="py-3 text-purple-300">{person.role}</td>
                        <td className="py-3 text-right text-white font-semibold">{person.score}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-1 rounded text-sm ${getTierColor(person.tier)}`}>
                            {person.tier}
                          </span>
                        </td>
                        <td className="py-3 text-right text-purple-400 text-sm">
                          {person.completed_at ? new Date(person.completed_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'leaderboard' && (
          <Leaderboard />
        )}
      </div>
    </div>
  );
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => {
      setLeaderboard(data.leaderboard || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-white">Loading leaderboard...</div>;
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Industry Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-purple-300 text-sm border-b border-white/10">
              <th className="text-left py-3">#</th>
              <th className="text-left py-3">Company</th>
              <th className="text-left py-3">Industry</th>
              <th className="text-right py-3">Assessments</th>
              <th className="text-right py-3">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((company, idx) => (
              <tr key={idx} className="border-b border-white/5">
                <td className="py-3 text-purple-300">{idx + 1}</td>
                <td className="py-3 text-white font-semibold">{company.company}</td>
                <td className="py-3 text-purple-300">{company.industry}</td>
                <td className="py-3 text-right text-purple-300">{company.assessments}</td>
                <td className="py-3 text-right text-white font-bold">{company.average_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
