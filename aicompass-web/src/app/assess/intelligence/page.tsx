'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { triggerIntelligenceCollection, getIntelligenceStatus } from '@/lib/api';

export default function IntelligencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [status, setStatus] = useState<string>('loading');
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState('');

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
      if (s.status === 'completed') {
        setStatus('completed');
      } else if (s.status === 'not_started' || s.status === 'failed') {
        setStatus('not_started');
      } else {
        setStatus('collecting');
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setStatus('not_started');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    setCollecting(true);
    setError('');
    try {
      const result = await triggerIntelligenceCollection(id!);
      if (result.categories_collected > 0) {
        setStatus('completed');
        // Redirect to validation after a short delay
        setTimeout(() => {
          router.push(`/assess/validation?id=${id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Error collecting:', err);
      setError('Failed to collect intelligence. You can skip this step.');
      setStatus('error');
    } finally {
      setCollecting(false);
    }
  };

  const handleSkip = () => {
    router.push(`/assess/questions?id=${id}`);
  };

  const handleGoToValidation = () => {
    router.push(`/assess/validation?id=${id}`);
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
          We're researching {id ? 'your company' : ''} to personalize your assessment
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {status === 'completed' && (
          <div>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-300 mb-4">Research completed!</p>
            <button
              onClick={handleGoToValidation}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-500"
            >
              Continue to Validation
            </button>
          </div>
        )}

        {status === 'not_started' && (
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
            <div className="mt-4">
              <button
                onClick={handleSkip}
                className="text-purple-400 hover:text-white text-sm"
              >
                Skip this step →
              </button>
            </div>
          </div>
        )}

        {status === 'collecting' && (
          <div>
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-blue-300">Searching 12 data sources...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <button
              onClick={handleSkip}
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500"
            >
              Skip to Questions
            </button>
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
