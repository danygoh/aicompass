'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAssessment } from '@/lib/api';

export default function GeneratingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Preparing your personalized report...');

  useEffect(() => {
    if (!id) {
      router.push('/');
      return;
    }

    // Simulate progress while AI generates report
    const messages = [
      'Preparing your personalized report...',
      'Analyzing your responses...',
      'Comparing against industry benchmarks...',
      'Generating AI recommendations...',
      'Finalizing your results...',
    ];

    let currentMsg = 0;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 95));
      if (currentMsg < messages.length - 1) {
        currentMsg++;
        setMessage(messages[currentMsg]);
      }
    }, 2000);

    // Poll for completion
    const checkReport = setInterval(async () => {
      try {
        const assessment = await getAssessment(id!);
        // Report is generated synchronously on submit, so just check status
        if (assessment.status === 'completed') {
          clearInterval(interval);
          clearInterval(checkReport);
          router.push(`/report/${id}`);
        }
      } catch (err) {
        console.error('Error checking:', err);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(checkReport);
    };
  }, [id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 mb-8">
          <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">Generating Your Report</h1>
        
        <p className="text-purple-200 mb-8">{message}</p>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-purple-400 text-sm">
          This may take a few seconds...
        </p>
      </div>
    </div>
  );
}
