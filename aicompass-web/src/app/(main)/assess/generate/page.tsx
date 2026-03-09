'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/store';

const GENERATE_STEPS = [
  'Synthesising your responses',
  'Analysing intelligence data',
  'Generating peer benchmarks',
  'Building strategic recommendations',
  'Creating your report',
];

export default function GeneratePage() {
  const router = useRouter();
  const store = useAssessmentStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const profile = store.profile;
  const responses = store.responses;
  const intelligence = store.intelligence;
  const totalScore = store.totalScore;
  const dimensionScores = store.dimensionScores;
  const tier = store.tier;
  const reportId = store.reportId;
  const calculateScores = store.calculateScores;
  const generateReportId = store.generateReportId;
  const setReportData = store.setReportData;

  useEffect(() => {
    // Run on mount
    calculateScores();
    generateReportId();
    loadFromDatabase();
    runAnimation();
  }, []);

  // Load assessment from database if store is empty
  const loadFromDatabase = async () => {
    const { responses, totalScore } = store;
    
    // If we already have responses, skip loading
    if (responses && responses.some(r => r !== null)) {
      return;
    }
    
    // Try to load from database
    try {
      const response = await fetch('/api/user/assessment/latest');
      if (response.ok) {
        const data = await response.json();
        if (data.assessment) {
          // Load data into store
          const { setResponse, setProfile, setIntelligence, setFieldState } = useAssessmentStore.getState();
          
          if (data.assessment.profile) {
            setProfile(data.assessment.profile);
          }
          
          if (data.assessment.intelligence) {
            setIntelligence(data.assessment.intelligence);
          }
          
          if (data.assessment.responses) {
            data.assessment.responses.forEach((r: any, idx: number) => {
              if (r.answer !== null) {
                setResponse(idx, r.answer);
              }
            });
          }
          
          console.log('Loaded assessment from database');
        }
      }
    } catch (err) {
      console.error('Failed to load from database:', err);
    }
  };

  const runAnimation = async () => {
    // Run animation steps
    for (let i = 0; i < GENERATE_STEPS.length; i++) {
      setCurrentStep(i);
      setProgress(((i + 1) / GENERATE_STEPS.length) * 100);
      await new Promise(r => setTimeout(r, 600));
    }

    // Generate report via API
    try {
      const payload = {
        profile,
        responses,
        intelligence,
        totalScore: totalScore || 75,
        dimensionScores: dimensionScores || [16, 18, 14, 15, 12],
        tier: tier || 'Progressive',
        reportId,
      };

      console.log('Generating report with payload:', payload);

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const reportData = await response.json();
      setReportData(reportData);
      console.log('Report generated:', reportData.reportId);
      
      // Navigate to report
      router.push(`/assess/report/${reportId || 'preview'}`);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
      // Navigate anyway
      router.push(`/assess/report/${reportId || 'preview'}`);
    }
  };

  const getTierEmoji = () => {
    if ((totalScore || 0) >= 81) return '🚀';
    if ((totalScore || 0) >= 63) return '⚡';
    if ((totalScore || 0) >= 45) return '📈';
    return '🌱';
  };

  const getTierName = () => {
    const score = totalScore || 0;
    if (score >= 81) return 'Advanced';
    if (score >= 63) return 'Progressive';
    if (score >= 45) return 'Developing';
    return 'Beginner';
  };

  const getTierClass = () => {
    const score = totalScore || 0;
    if (score >= 81) return 't-adv';
    if (score >= 63) return 't-int';
    if (score >= 45) return 't-dev';
    return 't-beg';
  };

  return (
    <div id="s-generate">
      <div className="gen-layout-outer">
        <div className="gen-layout">
          {/* Left - Compass */}
          <div className="gen-left">
            <div className="gen-compass-wrap">
              <div className="gen-compass-ring">
                <span className="gen-compass-emoji">{getTierEmoji()}</span>
              </div>
            </div>
            
            <div className={`gen-score-reveal ${progress >= 100 ? 'show' : ''}`}>
              <div className="gen-score-big">{totalScore || '--'}</div>
              <div className="gen-score-label">Your AI Readiness Score</div>
            </div>
            
            <div className={`gen-tier-badge ${getTierClass()} ${progress >= 100 ? 'show' : ''}`}>
              {getTierEmoji()} {getTierName()}
            </div>
            
            <div className="gen-status">
              {progress >= 100 ? 'Report ready!' : GENERATE_STEPS[currentStep]}
            </div>

            {/* CTA Button */}
            <div className={`gen-cta ${progress >= 100 ? 'show' : ''}`}>
              <button 
                className="btn-view-report"
                onClick={() => router.push(`/assess/report/${reportId || 'preview'}`)}
              >
                View Your Report →
              </button>
              <div className="gen-cta-note">Auto-saved to your account</div>
            </div>
          </div>

          {/* Right - Steps */}
          <div className="gen-right">
            <div className="gen-panel-label">Generating Report</div>
            <div className="gen-steps">
              {GENERATE_STEPS.map((step, idx) => (
                <div 
                  key={step}
                  className={`gs ${idx < currentStep ? 'done' : ''} ${idx === currentStep ? 'live' : ''}`}
                >
                  <div className="gs-icon">
                    {idx < currentStep ? <span className="gs-check">✓</span> : <span className="gs-dot" />}
                  </div>
                  <span className="gs-text">{step}</span>
                </div>
              ))}
            </div>

            <div className="gen-prog-wrap">
              <div className="gen-prog-labels">
                <span>{progress >= 100 ? 'Complete!' : 'Generating...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="gen-prog-bg">
                <div className="gen-prog-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {error && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'rgba(255,100,100,0.1)', 
                border: '1px solid rgba(255,100,100,0.3)',
                borderRadius: '8px',
                color: '#ff6b6b',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
