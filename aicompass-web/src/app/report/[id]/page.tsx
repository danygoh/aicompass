'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getReport, getAssessment } from '@/lib/api';

interface Report {
  header: { name: string; role: string; company: string };
  score_card: { total_score: number; tier: string; dimensions: any[] };
  executive_summary: string;
  dimension_deep_dive: any[];
  priority_recommendations: string[];
  next_steps: string[];
}

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const data = await getReport(id);
      setReport(data);
    } catch (err) {
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    // Spec colors: Beginner=#FDECEA, Developing=#FFF3E0, Intermediate=#E8F5E9, Advanced=#E3EBF5
    switch (tier) {
      case 'Beginner': return 'bg-[#FDECEA] text-red-800 border-red-200';
      case 'Developing': return 'bg-[#FFF3E0] text-amber-800 border-amber-200';
      case 'Intermediate': return 'bg-[#E8F5E9] text-green-800 border-green-200';
      case 'Advanced': return 'bg-[#E3EBF5] text-navy-800 border-navy-200';
      default: return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 mb-4">{error || 'Report not found'}</p>
          <button onClick={() => router.push('/')} className="text-purple-300 hover:text-white">
            Start New Assessment →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h1>
          <p className="text-purple-200">Your AI Compass Report</p>
        </div>

        {/* Score Card */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-purple-200 mb-1">Your Score</p>
              <div className="text-6xl font-bold text-white">{report.score_card.total_score}</div>
              <p className="text-purple-300 text-sm mt-1">out of 100</p>
            </div>
            <div className="text-center">
              <span className={`inline-block px-6 py-3 rounded-xl border ${getTierColor(report.score_card.tier)} text-xl font-semibold`}>
                {report.score_card.tier}
              </span>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{report.header.name}</p>
              <p className="text-purple-300 text-sm">{report.header.role}</p>
              {report.header.company && (
                <p className="text-purple-400 text-sm">{report.header.company}</p>
              )}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Executive Summary</h2>
          <p className="text-purple-200 leading-relaxed">
            {report.executive_summary}
          </p>
        </div>

        {/* Dimension Scores */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Dimension Breakdown</h2>
          <div className="space-y-4">
            {report.dimension_deep_dive.map((dim) => (
              <div key={dim.dimension} className="flex items-center gap-4">
                <div className="w-24 text-purple-200 text-sm font-medium">{dim.label}</div>
                <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${dim.percentage}%` }}
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="text-white font-semibold">{dim.score}</span>
                  <span className="text-purple-400 text-sm">/20</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Priority Recommendations</h2>
          <ul className="space-y-3">
            {report.priority_recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-purple-200">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Next Steps</h2>
          <ul className="space-y-3">
            {report.next_steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-300 text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-purple-200">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
