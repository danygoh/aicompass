'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getValidationData, submitValidation, triggerIntelligenceCollection, getIntelligenceStatus } from '@/lib/api';

interface Category {
  id: string;
  label: string;
  answer: string;
  results: { title: string; url: string }[];
}

export default function ValidationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [recollecting, setRecollecting] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push('/');
      return;
    }
    loadValidationData();
  }, [id, router]);

  const loadValidationData = async () => {
    try {
      const validationData = await getValidationData(id!);
      setData(validationData);
    } catch (err) {
      console.error('Error loading validation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (valid: boolean) => {
    setSaving(true);
    try {
      await submitValidation(id!, {
        validated: valid,
        notes: valid ? 'Data validated by user' : 'User rejected data'
      });
      
      if (valid) {
        // Proceed to questions
        router.push(`/assess/questions?id=${id}`);
      } else {
        // Re-collect intelligence
        await handleRecollect();
      }
    } catch (err) {
      console.error('Error submitting validation:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRecollect = async () => {
    setRecollecting(true);
    try {
      await triggerIntelligenceCollection(id!);
      await loadValidationData();
    } catch (err) {
      console.error('Error re-collecting:', err);
    } finally {
      setRecollecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 mb-4">No intelligence data to validate</p>
          <button onClick={() => router.push('/')} className="text-purple-300 hover:text-white">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Validate Intelligence</h1>
          <p className="text-purple-200">
            Review the collected data about {data.company_name}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-purple-300 mb-2">
            <span>Step 2 of 3</span>
            <span>Intelligence Validation</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '66%' }} />
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-white font-semibold mb-4">Company Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-purple-300 text-sm">Company</p>
              <p className="text-white text-lg">{data.company_name}</p>
            </div>
            <div>
              <p className="text-purple-300 text-sm">Industry</p>
              <p className="text-white text-lg">{data.industry || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 mb-8">
          {data.categories.map((cat: Category) => (
            <div key={cat.id} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-3">{cat.label}</h3>
              
              {cat.answer ? (
                <div className="mb-4">
                  <p className="text-purple-200 text-sm mb-2">AI Summary:</p>
                  <p className="text-white">{cat.answer}</p>
                </div>
              ) : (
                <p className="text-purple-400 italic mb-4">No summary available</p>
              )}
              
              {cat.results && cat.results.length > 0 && (
                <div>
                  <p className="text-purple-300 text-sm mb-2">Sources:</p>
                  <ul className="space-y-1">
                    {cat.results.slice(0, 3).map((r: any, idx: number) => (
                      <li key={idx}>
                        <a 
                          href={r.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm truncate block"
                        >
                          • {r.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => handleValidate(false)}
            disabled={saving || recollecting}
            className="flex-1 px-6 py-4 bg-red-500/20 border border-red-500/30 text-red-200 font-semibold rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
          >
            {recollecting ? 'Re-collecting...' : 'Looks Wrong - Re-collect'}
          </button>
          <button
            onClick={() => handleValidate(true)}
            disabled={saving}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
          >
            {saving ? 'Validating...' : 'Looks Correct - Continue'}
          </button>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
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
