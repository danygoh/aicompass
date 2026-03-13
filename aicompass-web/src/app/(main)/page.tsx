'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/store';

export default function LandingPage() {
  const router = useRouter();
  const { profile, responses, reset } = useAssessmentStore();
  const [showModal, setShowModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for store to hydrate from localStorage
    setIsHydrated(true);
  }, []);

  // Check if there's existing progress
  const hasExistingData = isHydrated && (
    (profile.company && profile.industry) || 
    responses.some(r => r !== null)
  );

  const handleBeginClick = () => {
    if (hasExistingData) {
      // Show modal to choose continue or start fresh
      setShowModal(true);
    } else {
      // No existing data, go straight to profile
      router.push('/assess/profile');
    }
  };

  const handleContinue = () => {
    // Continue from where they left off - determine best page
    if (responses.some(r => r !== null)) {
      // Has answered questions, go to paywall
      router.push('/assess/paywall');
    } else if (profile.company && profile.industry) {
      // Has profile, go to collect
      router.push('/assess/collect');
    } else {
      // Just has some data, go to profile
      router.push('/assess/profile');
    }
    setShowModal(false);
  };

  const handleStartFresh = () => {
    // Clear all data and start fresh
    reset();
    router.push('/assess/profile');
    setShowModal(false);
  };

  return (
    <div id="s-land" className="screen active">
      {/* Navigation */}
      <nav id="nav">
        <div className="nav-logo">AI <em className="">Compass</em></div>
        <button className="cta-admin-btn" onClick={() => router.push('/admin/login')}>Admin Portal</button>
      </nav>

      {/* Progress Bar */}
      <div id="prog-strip">
        <div id="prog-fill" style={{ width: '0%' }} />
      </div>

      {/* Background */}
      <div className="orb o1" />
      <div className="orb o2" />

      {/* HERO SECTION */}
      <section className="land-hero">
        <div className="lh-bg">
          <div className="lh-grid"></div>
          <div className="lh-orb lh-orb-1"></div>
          <div className="lh-orb lh-orb-2"></div>
        </div>
        <div className="lh-inner">
          <div className="lh-left">
            <div className="lh-kicker">
              <span className="kicker-pip"></span>
              AI Native Foundation · Readiness Intelligence
            </div>
            <h1 className="lh-h1">
              <span className="lh-h1a">Intelligence</span>
              <span className="lh-h1b">before the first</span>
              <span className="lh-h1c"><em>question.</em></span>
            </h1>
            <p className="lh-desc">
              AI Compass is the only assessment that <strong>researches and validates intelligence about you, your company, and your industry</strong> before asking a single question — making every response count.
            </p>
            <div className="lh-steps">
              <div className="lhs-row"><span className="lhs-n">01</span><span className="lhs-t">Fill in your professional profile <span className="lhs-time">· 2 min</span></span></div>
              <div className="lhs-row"><span className="lhs-n">02</span><span className="lhs-t">AI researches 12 intelligence sources about your context <span className="lhs-time">· auto</span></span></div>
              <div className="lhs-row"><span className="lhs-n">03</span><span className="lhs-t">You review and validate every data point <span className="lhs-time">· 5 min</span></span></div>
              <div className="lhs-row"><span className="lhs-n">04</span><span className="lhs-t">Answer 25 adaptive questions calibrated to your profile <span className="lhs-time">· 10 min</span></span></div>
              <div className="lhs-row"><span className="lhs-n">05</span><span className="lhs-t">Receive your 11-section premium intelligence report <span className="lhs-time">· instant</span></span></div>
            </div>
            <div className="lh-ctas">
              <button className="btn-begin-hero" onClick={handleBeginClick}>
                <span>Begin Your Assessment</span>
                <span className="bh-arr">→</span>
              </button>
              <div className="lh-meta">
                <span className="lhm">~20 minutes</span>
                <span className="lhm">11-section report</span>
                <span className="lhm">No account required</span>
              </div>
            </div>
          </div>
          <div className="lh-right">
            {/* Report preview card */}
            <div className="preview-card">
              <div className="pc-hdr">
                <div>
                  <div className="pc-brand">AI Compass · Sample Report</div>
                  <div className="pc-name">Sarah Chen · Chief Risk Officer</div>
                </div>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#C17F24" strokeWidth="6" strokeLinecap="round" strokeDasharray="140 161" transform="rotate(-90 40 40)"/>
                  <text x="40" y="44" textAnchor="middle" fontFamily="Fraunces,serif" fontSize="18" fontWeight="600" fill="white">74</text>
                  <text x="40" y="56" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="rgba(255,255,255,0.35)">/100</text>
                </svg>
              </div>
              <div className="pc-tier">Intermediate · Financial Services · Singapore</div>
              <div className="pc-dims">
                <div className="pcd"><span className="pcd-n">AI Literacy</span><div className="pcd-bg"><div className="pcd-f" style={{width:'85%',background:'var(--green)'}}></div></div><span className="pcd-s">17</span></div>
                <div className="pcd"><span className="pcd-n">Data Readiness</span><div className="pcd-bg"><div className="pcd-f" style={{width:'65%',background:'var(--sky)'}}></div></div><span className="pcd-s">13</span></div>
                <div className="pcd"><span className="pcd-n">Workflow</span><div className="pcd-bg"><div className="pcd-f" style={{width:'70%',background:'var(--sky)'}}></div></div><span className="pcd-s">14</span></div>
                <div className="pcd"><span className="pcd-n">Governance</span><div className="pcd-bg"><div className="pcd-f" style={{width:'55%',background:'var(--amber)'}}></div></div><span className="pcd-s">11</span></div>
                <div className="pcd"><span className="pcd-n">Strategy</span><div className="pcd-bg"><div className="pcd-f" style={{width:'75%',background:'var(--sky)'}}></div></div><span className="pcd-s">15</span></div>
              </div>
              <div className="pc-tags">
                <span className="pct">12 Intel Sources</span>
                <span className="pct pct-gold">72nd Percentile</span>
              </div>
            </div>
            {/* Stats */}
            <div className="lh-stats">
              <div className="lhstat"><div className="lhstat-n">12</div><div className="lhstat-l">Intel Sources</div></div>
              <div className="lhstat"><div className="lhstat-n">25</div><div className="lhstat-l">Adaptive Qs</div></div>
              <div className="lhstat"><div className="lhstat-n">11</div><div className="lhstat-l">Report Sections</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="land-get">
        <div className="land-inner">
          <div className="land-sec-hdr">
            <div className="land-kicker-light">What's included</div>
            <h2 className="land-h2-light">Your 11-Section Intelligence Report</h2>
            <p className="land-sub-light">Every report is uniquely generated from your validated intelligence and assessment responses.</p>
          </div>
          <div className="get-cards">
            <div className="get-card get-featured">
              <div className="gc-ico">🧭</div>
              <div className="gc-title">Executive Summary</div>
              <div className="gc-desc">A personalised analysis of your AI readiness position, career trajectory outlook, and primary opportunity.</div>
              <div className="gc-badge">AI-Generated · Role-Specific</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">📊</div>
              <div className="gc-title">5-Dimension Score Card</div>
              <div className="gc-desc">Radar chart and bar analysis across AI Literacy, Data Readiness, Workflow Integration, Governance, and Strategic Alignment.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">🔬</div>
              <div className="gc-title">Dimension Deep Dive</div>
              <div className="gc-desc">Each of the 5 dimensions broken down with scores, peer benchmarks, and prioritized recommendations.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">📐</div>
              <div className="gc-title">Industry Benchmarks</div>
              <div className="gc-desc">See how you compare against industry peers, seniority levels, and functional cohorts.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">🏢</div>
              <div className="gc-title">Company AI Posture</div>
              <div className="gc-desc">Analysis of your organisation's AI strategy, readiness, and competitive positioning.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">💼</div>
              <div className="gc-title">Skills & Career Matrix</div>
              <div className="gc-desc">AI skills demand, salary premiums, and career opportunities mapped to your profile.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">⚖️</div>
              <div className="gc-title">Regulatory Scorecard</div>
              <div className="gc-desc">Relevant AI regulations, compliance requirements, and risk assessment for your jurisdiction.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">🎯</div>
              <div className="gc-title">Risk & Opportunity Register</div>
              <div className="gc-desc">Prioritised AI risks and opportunities specific to your role and organisation.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">🔍</div>
              <div className="gc-title">Competitive Intelligence</div>
              <div className="gc-desc">AI adoption signals from your competitive landscape and what they mean for your position.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">📚</div>
              <div className="gc-title">Learning Pathway</div>
              <div className="gc-desc">A personalised curriculum recommendation based on your dimension gaps and role context.</div>
            </div>
            <div className="get-card">
              <div className="gc-ico">🗺️</div>
              <div className="gc-title">90-Day Roadmap</div>
              <div className="gc-desc">A prioritized 90-day action plan with milestones to improve your AI readiness.</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="land-pricing">
        <div className="land-inner">
          <div className="land-sec-hdr" style={{textAlign:'center'}}>
            <div className="land-kicker-gold">Pricing</div>
            <h2 className="land-h2">Simple, transparent pricing</h2>
            <p className="land-sub">Your assessment is free. Unlock your full report when you're ready.</p>
          </div>
          <div className="pricing-grid">
            {/* Free */}
            <div className="price-card">
              <div className="price-plan">Assessment</div>
              <div className="price-amt"><span className="price-curr">$</span>0</div>
              <div className="price-cadence">Always free to complete</div>
              <div className="price-desc">Complete the full assessment and see your tier and overall score.</div>
              <ul className="price-feats">
                <li>Full 25-question assessment</li>
                <li>AI intelligence research</li>
                <li>Validation of 12 data sources</li>
                <li>Overall score + tier</li>
                <li className="price-feat-locked">🔒 Full 11-section report</li>
                <li className="price-feat-locked">🔒 Dimension breakdown</li>
                <li className="price-feat-locked">🔒 Peer benchmarks</li>
              </ul>
              <button className="btn-price btn-price-ghost" onClick={handleBeginClick}>Start Free Assessment</button>
            </div>
            {/* Professional */}
            <div className="price-card price-featured">
              <div className="price-pop">Most Popular</div>
              <div className="price-plan">Professional</div>
              <div className="price-amt"><span className="price-curr">$</span>199</div>
              <div className="price-cadence">One-time · Instant access</div>
              <div className="price-desc">Your complete intelligence report with retake, progress tracking, and PDF download.</div>
              <ul className="price-feats">
                <li>Everything in Assessment</li>
                <li>Full 11-section report</li>
                <li>All 5 dimension analyses</li>
                <li>Peer benchmarking data</li>
                <li>Regulatory scorecard</li>
                <li>90-day action roadmap</li>
                <li>PDF download + shareable link</li>
              </ul>
              <button className="btn-price btn-price-gold" onClick={handleBeginClick}>Begin Assessment →</button>
              <div className="price-note">Unlock report after completing assessment</div>
            </div>
            {/* Team */}
            <div className="price-card">
              <div className="price-plan">Team / Cohort</div>
              <div className="price-amt"><span className="price-curr">$</span>149</div>
              <div className="price-cadence">Per participant · Min 10</div>
              <div className="price-desc">For cohort-based programmes, workshops, or team capability assessments.</div>
              <ul className="price-feats">
                <li>Everything in Professional</li>
                <li>Custom cohort code</li>
                <li>Cohort aggregate report</li>
                <li>Admin dashboard access</li>
                <li>CSV data export</li>
                <li>Priority email support</li>
                <li>Volume discounts available</li>
              </ul>
              <button className="btn-price btn-price-ghost">Contact Us</button>
            </div>
            {/* Enterprise */}
            <div className="price-card">
              <div className="price-plan">Enterprise / Institution</div>
              <div className="price-amt price-custom">Custom</div>
              <div className="price-cadence">Tailored to your needs</div>
              <div className="price-desc">For business schools, consulting firms, government agencies, and global enterprises.</div>
              <ul className="price-feats">
                <li>Unlimited participants</li>
                <li>Custom branding</li>
                <li>White-label option</li>
                <li>API access</li>
                <li>LMS integration</li>
                <li>Dedicated account manager</li>
                <li>SLA guarantee</li>
              </ul>
              <button className="btn-price btn-price-ghost">Request a Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="land-social">
        <div className="land-inner">
          <div className="land-social-lbl">Used by professionals at</div>
          <div className="land-orgs">
            <span>Global Banks</span><span className="sdiv">·</span>
            <span>Consulting Firms</span><span className="sdiv">·</span>
            <span>Technology Companies</span><span className="sdiv">·</span>
            <span>Healthcare Systems</span><span className="sdiv">·</span>
            <span>Government Agencies</span><span className="sdiv">·</span>
            <span>Business Schools</span><span className="sdiv">·</span>
            <span>UN Agencies</span>
          </div>
          <div className="land-sstats">
            <div className="lss"><div className="lss-n">500+</div><div className="lss-l">Assessments completed</div></div>
            <div className="lss-div"></div>
            <div className="lss"><div className="lss-n">28</div><div className="lss-l">Countries</div></div>
            <div className="lss-div"></div>
            <div className="lss"><div className="lss-n">6</div><div className="lss-l">Active cohorts</div></div>
            <div className="lss-div"></div>
            <div className="lss"><div className="lss-n">94%</div><div className="lss-l">Completion rate</div></div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="land-cta">
        <div className="land-cta-inner">
          <div className="cta-kicker">Ready when you are</div>
          <h2 className="cta-h2">Know exactly where you stand.<br/>Know where to lead.</h2>
          <button className="btn-begin-hero" style={{margin:'0 auto'}} onClick={handleBeginClick}>
            <span>Begin Your Assessment</span>
            <span className="bh-arr">→</span>
          </button>
          <div className="cta-sub">Free to complete · Report from $199 · No account required</div>
          <div className="cta-admin-link">
            <button onClick={() => router.push('/admin/login')} className="cta-admin-btn">Admin Portal →</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', padding: '40px 20px', textAlign: 'center', marginTop: 20 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: '#fff', marginBottom: 8 }}>
            AI <span style={{ color: '#f59e0b' }}>Compass</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>
            © 2026 AI Native Foundation (Company No. 15519232). All rights reserved.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            <a href="/privacy" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>Privacy Policy</a>
            <a href="/terms" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>Terms of Service</a>
            <a href="mailto:support@ainativefoundation.org" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>Contact</a>
          </div>
        </div>
      </footer>

      {/* Continue Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Welcome Back</div>
            <div className="modal-desc">
              We found your previous assessment progress. Would you like to continue where you left off or start fresh?
            </div>
            
            <div className="modal-progress">
              {profile.company && (
                <div className="mp-item">
                  <span className="mp-icon">✓</span>
                  <span>Profile: {profile.firstName} {profile.lastName} at {profile.company}</span>
                </div>
              )}
              {responses.some(r => r !== null) && (
                <div className="mp-item">
                  <span className="mp-icon">✓</span>
                  <span>Questions: {responses.filter(r => r !== null).length} of 25 answered</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-primary" onClick={handleContinue}>
                Continue Assessment →
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={handleStartFresh}>
                Start Fresh
              </button>
            </div>
            
            <button className="modal-close" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-card {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-title {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          color: var(--navy);
          margin-bottom: 8px;
          text-align: center;
        }
        .modal-desc {
          font-size: 14px;
          color: var(--text2);
          text-align: center;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .modal-progress {
          background: var(--bg);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .mp-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text);
          margin-bottom: 8px;
        }
        .mp-item:last-child {
          margin-bottom: 0;
        }
        .mp-icon {
          width: 20px;
          height: 20px;
          background: var(--green);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          flex-shrink: 0;
        }
        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
        }
        .modal-btn {
          padding: 14px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .modal-btn-primary {
          background: var(--navy);
          color: #fff;
        }
        .modal-btn-primary:hover {
          background: var(--navy-dark);
        }
        .modal-btn-secondary {
          background: transparent;
          color: var(--text2);
          border: 1px solid var(--border);
        }
        .modal-btn-secondary:hover {
          background: var(--bg);
        }
        .modal-close {
          display: block;
          width: 100%;
          background: none;
          border: none;
          color: var(--text3);
          font-size: 13px;
          cursor: pointer;
          text-align: center;
          padding: 8px;
        }
        .modal-close:hover {
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
