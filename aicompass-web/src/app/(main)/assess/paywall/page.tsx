'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/store';
import { COHORT_CODES, DIMENSIONS } from '@/data/questions';

export default function PaywallPage() {
  const router = useRouter();
  const { totalScore, dimensionScores, calculateScores, profile, setProfile, responses, intelligence, tier } = useAssessmentStore();
  const [selectedPlan, setSelectedPlan] = useState<'professional' | 'cohort'>('professional');
  const [cohortCode, setCohortCode] = useState(profile.cohortCode || '');
  const [cohortError, setCohortError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (totalScore === null) {
      calculateScores();
    }
  }, []);

  // Save assessment to database
  const saveAssessment = async () => {
    try {
      const tierName = totalScore !== null 
        ? (totalScore >= 81 ? 'Advanced' : totalScore >= 63 ? 'Intermediate' : totalScore >= 45 ? 'Developing' : 'Beginner')
        : 'Beginner';

      const response = await fetch('/api/user/assessment/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          responses: responses || [],
          intelligence,
          totalScore: totalScore || 0,
          dimensionScores: (dimensionScores || [0, 0, 0, 0, 0]).map((score, idx) => ({
            dimension: ['AI Literacy', 'Data Readiness', 'Workflow Integration', 'Governance & Risk', 'Strategic Alignment'][idx] || `Dimension ${idx + 1}`,
            score: score || 0,
          })),
          tier: tierName,
          reportId: `AIC-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Assessment saved:', data);
        return data.assessmentId;
      }
    } catch (err) {
      console.error('Failed to save assessment:', err);
    }
    return null;
  };

  const handleUnlock = async () => {
    setProcessing(true);
    
    if (selectedPlan === 'cohort') {
      // Validate cohort code via API
      const response = await fetch('/api/cohorts/validate?code=' + encodeURIComponent(cohortCode));
      const validation = await response.json();
      
      if (!validation.valid) {
        setCohortError(validation.error || 'Code not recognised. Check with your organisation.');
        setProcessing(false);
        return;
      }
      
      // Save cohort code and subscription
      setProfile({ cohortCode: validation.cohort.code, subscription: 'cohort' });
    } else if (selectedPlan === 'professional') {
      setProfile({ subscription: 'professional' });
    }

    // Save assessment before navigating
    await saveAssessment();
    
    setTimeout(() => {
      router.push('/assess/generate');
    }, 1500);
  };

  const handleDemo = async () => {
    setProfile({ subscription: 'free' });
    // Save assessment before navigating
    await saveAssessment();
    router.push('/assess/generate');
  };

  const getTierName = () => {
    if (totalScore === null) return 'Calculating...';
    if (totalScore >= 81) return 'Advanced';
    if (totalScore >= 63) return 'Intermediate';
    if (totalScore >= 45) return 'Developing';
    return 'Beginner';
  };

  const getTierClass = () => {
    if (totalScore === null) return '';
    if (totalScore >= 81) return 't-adv';
    if (totalScore >= 63) return 't-int';
    if (totalScore >= 45) return 't-dev';
    return 't-beg';
  };

  return (
    <div id="s-paywall">
      {/* Navigation */}
      <nav id="nav">
        <div className="nav-logo">AI <em>Compass</em></div>
      </nav>

      {/* Progress Bar */}
      <div id="prog-strip">
        <div id="prog-fill" style={{ width: '75%' }} />
      </div>

      {/* Background */}
      <div className="orb o1" />
      <div className="orb o2" />

      <div className="pw-wrap">
        {/* Header */}
        <div className="pw-header">
          <div className="pw-badge">🎯 Your Report is Ready</div>
          <h2 className="pw-h2">Unlock Your Intelligence Report</h2>
          <p className="pw-sub">Your AI Compass assessment is complete. Choose a plan to access your full 11-section personalised report.</p>
        </div>

        {/* Score Teaser */}
        <div className="pw-tease-card">
          <div className="pw-tease-left">
            <div className="pw-score-lbl">Your Overall Score</div>
            <div className="pw-score-big">{totalScore || '--'}</div>
            <div className={`pw-tier-badge ${getTierClass()}`}>{getTierName()}</div>
            <div className="pw-score-note">Full breakdown locked below</div>
          </div>
          <div className="pw-tease-right">
            <div className="pw-tease-dim-lbl">5 Dimensions · Locked</div>
            <div className="pw-tease-dims">
              {DIMENSIONS.map((dim, idx) => (
                <div key={dim} className="pw-dim-row">
                  <span className="pw-dim-name">{dim}</span>
                  <div className="pw-dim-bar-bg">
                    <div className="pw-dim-bar-f" style={{ 
                      width: `${((dimensionScores[idx] || 0) / 20) * 100}%`,
                      background: 'var(--gold)'
                    }} />
                  </div>
                  <span className="pw-dim-score">{dimensionScores[idx] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Locked Preview */}
        <div className="pw-locked-preview">
          <div className="pw-locked-title">🔒 Your report includes:</div>
          <div className="pw-locked-grid">
            <div className="pwlg">📐 Dimension Deep Dive</div>
            <div className="pwlg">👥 Peer Benchmarks</div>
            <div className="pwlg">⚖️ Regulatory Scorecard</div>
            <div className="pwlg">⚠️ Risk Register</div>
            <div className="pwlg">🗺️ 90-Day Roadmap</div>
            <div className="pwlg">💼 Career Value Matrix</div>
            <div className="pwlg">🔍 Competitive Intel</div>
            <div className="pwlg">📚 Learning Pathway</div>
            <div className="pwlg">📄 PDF Download</div>
          </div>
        </div>

        {/* Plans */}
        <div className="pw-plans">
          <div 
            className={`pw-plan pw-plan-featured ${selectedPlan === 'professional' ? 'pw-sel' : ''}`}
            onClick={() => setSelectedPlan('professional')}
          >
            <div className="pw-plan-pop">Full Report</div>
            <div className="pw-plan-name">Professional</div>
            <div className="pw-plan-price"><span>$</span>199</div>
            <div className="pw-plan-desc">Full report + PDF + shareable link</div>
            <ul className="pw-plan-feats">
              <li>Full 11-section report</li>
              <li>PDF download</li>
              <li>Shareable link</li>
              <li>Valid 12 months</li>
            </ul>
          </div>
          <div 
            className={`pw-plan ${selectedPlan === 'cohort' ? 'pw-sel' : ''}`}
            onClick={() => setSelectedPlan('cohort')}
          >
            <div className="pw-plan-name">Cohort Code</div>
            <div className="pw-plan-price pw-plan-free">Free</div>
            <div className="pw-plan-desc">If your organisation has enrolled you</div>
            <ul className="pw-plan-feats">
              <li>Enter your cohort code below</li>
              <li>Full access included</li>
              <li>No payment needed</li>
            </ul>
          </div>
        </div>

        {/* Cohort Code Box */}
        {selectedPlan === 'cohort' && (
          <div className="pw-cohort-box">
            <div className="pw-cohort-title">Enter your cohort code</div>
            <div className="pw-cohort-sub">Provided by your organisation, programme, or instructor</div>
            <div style={{ display: 'flex', gap: '9px', alignItems: 'center' }}>
              <input 
                className="pw-fi pw-fi-code" 
                type="text" 
                value={cohortCode}
                onChange={(e) => {
                  setCohortCode(e.target.value.toUpperCase());
                  setCohortError('');
                }}
                placeholder="e.g. OXSAID-2026-Q1"
              />
              <button 
                className="btn-pay" 
                style={{ width: 'auto', padding: '11px 20px', flexShrink: 0 }}
                onClick={handleUnlock}
                disabled={processing}
              >
                {processing ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {cohortError && <div className="pw-cohort-msg" style={{ color: 'var(--red)' }}>{cohortError}</div>}
          </div>
        )}

        {/* Payment Button - Airwallex */}
        {selectedPlan === 'professional' && (
          <div className="pw-pay-form" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <button 
              className="btn-pay" 
              id="btn-pay-now" 
              style={{ marginTop: '16px', padding: '14px 40px', fontSize: '16px' }}
              onClick={() => window.location.href = 'https://pay.airwallex.com/hkhgnpzy47hf'}
            >
              Continue to Payment →
            </button>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#999' }}>🔒 Secure payment by Airwallex</div>
          </div>
        )}

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button 
            className="btn-demo-unlock" 
            onClick={() => router.push('/')}
            style={{ fontSize: '9px' }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
