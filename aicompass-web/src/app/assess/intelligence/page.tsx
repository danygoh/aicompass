'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { triggerIntelligenceCollection, getIntelligenceStatus } from '@/lib/api';

export default function IntelligencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push('/');
      return;
    }
    checkStatus();
  }, [id, router]);

  const checkStatus = async () => {
    try {
      const s = await getIntelligenceStatus(id!);
      setStatus(s);
      
      // If already completed, redirect to validation
      if (s.status === 'completed') {
        router.push(`/assess/validation?id=${id}`);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    setCollecting(true);
    try {
      await triggerIntelligenceCollection(id!);
      await checkStatus();
    } catch (err) {
      console.error('Error collecting:', err);
    } finally {
      setCollecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0119 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Intelligence Collection</h1>
        <p className="text-purple-200 mb-8">
          We're researching your company to personalize your assessment
        </p>

        {status?.status === 'not_started' && (
          <div>
            <p className="text-purple-300 mb-6">
              This will search for information about your company across 12 categories.
            </p>
            <button
              onClick={handleCollect}
              disabled={collecting}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {collecting ? 'Researching...' : 'Start Research'}
            </button>
          </div>
        )}

        {collecting && (
          <div className="mt-8">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-blue-300">Searching 12 data sources...</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-purple-300 hover:text-white"
          >
            ← Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
