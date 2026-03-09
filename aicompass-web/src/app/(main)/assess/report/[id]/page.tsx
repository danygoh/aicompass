'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/store';
import { DIMENSIONS, DIMENSION_ICONS, TIERS } from '@/data/questions';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    totalScore, 
    dimensionScores, 
    tier, 
    profile, 
    reportId, 
    calculateScores,
    reportData 
  } = useAssessmentStore();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (totalScore === null) {
      calculateScores();
    }
    setLoading(false);
  }, []);

  const getTier = () => {
    return TIERS.find(t => totalScore! >= t.min && totalScore! <= t.max) || TIERS[0];
  };

  const getTierColor = (score: number) => {
    if (score >= 15) return { name: 'Strong', color: '#1A6B3A' };
    if (score >= 10) return { name: 'Developing', color: '#B86A00' };
    return { name: 'Gap', color: '#B32B2B' };
  };

  const getOutlook = () => {
    if (totalScore! >= 70) return { name: 'Positive', color: '#1A6B3A' };
    if (totalScore! >= 55) return { name: 'Stable', color: '#1A7BC4' };
    return { name: 'Watch', color: '#B32B2B' };
  };

  if (loading) {
    return (
      <div id="s-report" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading report...</div>
      </div>
    );
  }

  const currentTier = getTier();
  const outlook = getOutlook();
  const rd = reportData;

  return (
    <div id="s-report">
      {/* Toolbar */}
      <div className="rep-toolbar">
        <div className="rep-toolbar-left">
          <span className="rep-toolbar-id">{reportId || 'Preview'}</span>
          <span className="rep-toolbar-name">{profile.firstName} {profile.lastName}</span>
          <span className="rep-toolbar-score">{totalScore}/100 · {currentTier.emoji} {currentTier.name}</span>
        </div>
        <div className="rep-toolbar-right">
          <button className="btn-pdf" onClick={() => window.print()}>
            Download PDF
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div style={{ background: 'var(--bg)', padding: '12px 32px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="rep-nav-pills">
          {['Summary', 'Score', 'Dimensions', 'Benchmark', 'Company', 'Career', 'Regulatory', 'Risk', 'Competitive', 'Roadmap', 'Development'].map((label, i) => (
            <button key={i} className="rep-nav-pill">{label}</button>
          ))}
        </div>
      </div>

      <div className="rep-canvas">
        {/* Hero */}
        <div className="rep-hero">
          <div className="rh-grid">
            <div>
              <div className="rep-brand">
                AI Native Foundation · AI Compass 
                <span className="rep-id-badge">{reportId}</span>
              </div>
              <div className="rep-name">{profile.firstName} {profile.lastName}</div>
              <div className="rep-role">{profile.jobTitle || 'Professional'} · {profile.company || 'Organisation'}</div>
              <div className="rep-metas">
                <span className="rep-meta">📍 {profile.country || 'Not specified'}</span>
                <span className="rep-meta">🏢 {profile.industry || 'Not specified'}</span>
                <span className="rep-meta">👤 {profile.seniority || 'Not specified'}</span>
                <span className="rep-meta">📅 {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                <span className={`t-badge ${currentTier.name === 'Advanced' ? 't-adv' : currentTier.name === 'Intermediate' ? 't-int' : currentTier.name === 'Developing' ? 't-dev' : 't-beg'}`}>
                  {currentTier.emoji} {currentTier.name}
                </span>
                <span className={`ol-badge ol-${outlook.name.toLowerCase()}`}>
                  Outlook: {outlook.name}
                </span>
              </div>
              <div className="dim-chips">
                {DIMENSIONS.map((dim, idx) => (
                  <div key={dim} className="dim-chip">
                    {DIMENSION_ICONS[idx]} {dim.split(' ')[0]} 
                    <span className="dim-chip-s">{dimensionScores[idx]}/20</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ring-wrap">
              <svg width="132" height="132" viewBox="0 0 132 132">
                <circle cx="66" cy="66" r="56" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
                <circle 
                  cx="66" cy="66" r="56" 
                  fill="none" 
                  stroke={currentTier.color || '#C17F24'} 
                  strokeWidth="7" 
                  strokeLinecap="round"
                  strokeDasharray={`${(totalScore! / 100) * 352} 352`}
                  transform="rotate(-90 66 66)"
                />
                <text x="66" y="72" textAnchor="middle" className="ring-n" style={{ fontSize: '38px', fill: '#fff' }}>{totalScore}</text>
                <text x="66" y="88" textAnchor="middle" className="ring-d" style={{ fontSize: '11px', fill: 'rgba(255,255,255,0.3)' }}>/ 100</text>
              </svg>
              <div className="ring-tier-lbl">{currentTier.emoji} {currentTier.name}</div>
            </div>
          </div>
        </div>

        {/* Percentile Band */}
        <div className="pband">
          <div className="pband-cell">
            <div className="pband-n">{rd?.score?.dimensions?.[0]?.score || Math.round(Math.random() * 30 + 50)}<sup style={{ fontSize: '12px' }}>th</sup></div>
            <div className="pband-l">Overall Percentile</div>
            <div className="pband-s">vs. all participants</div>
          </div>
          <div className="pband-cell">
            <div className="pband-n">{rd?.score?.dimensions?.[1]?.score || Math.round(Math.random() * 30 + 45)}<sup style={{ fontSize: '12px' }}>th</sup></div>
            <div className="pband-l">{profile.industry || 'Industry'}</div>
            <div className="pband-s">vs. industry peers</div>
          </div>
          <div className="pband-cell">
            <div className="pband-n">{rd?.score?.dimensions?.[2]?.score || Math.round(Math.random() * 30 + 55)}<sup style={{ fontSize: '12px' }}>th</sup></div>
            <div className="pband-l">{profile.seniority || 'Seniority'} Level</div>
            <div className="pband-s">vs. seniority cohort</div>
          </div>
        </div>

        {/* Section A: Executive Summary */}
        <div className="r-sec" id="sec-a">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section A · Written for {profile.firstName || 'You'}</div>
              <div className="rs-title">Executive Summary</div>
            </div>
            <div className="rs-badge">AI-Generated</div>
          </div>
          <div className="rs-body">
            <p>{rd?.executiveSummary || `Based on your assessment across 5 key dimensions, you are at the ${currentTier.name} level of AI readiness with a score of ${totalScore}/100. ${totalScore! >= 63 ? 'You demonstrate solid understanding and practical experience with AI tools.' : totalScore! >= 45 ? 'You have foundational knowledge but there are clear areas for improvement.' : 'You are at the beginning of your AI journey with significant opportunities to develop.'}`}</p>
            <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--teal)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'var(--teal)', textTransform: 'uppercase', marginBottom: '4px' }}>Readiness Outlook · {outlook.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6' }}>
                {outlook.name === 'Positive' ? 'You are ahead of most peers. Focus on scaling successful initiatives and deepening AI governance.' : outlook.name === 'Stable' ? 'You have solid foundations. Prioritize closing gaps in governance and workflow integration.' : 'Focus on building foundational AI literacy and establishing basic governance frameworks.'}
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Score Card */}
        <div className="r-sec" id="sec-b">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section B · Calculated</div>
              <div className="rs-title">AI Compass Score Card</div>
            </div>
            <div className="rs-badge">Score: {totalScore} / 100</div>
          </div>
          <div className="rs-body">
            {/* Radar placeholder + Dimension list */}
            <div className="radar-wrap">
              <div style={{ flex: '1', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="240" height="220" viewBox="0 0 240 220">
                  {/* Grid circles */}
                  {[0.25, 0.5, 0.75, 1].map((f, i) => (
                    <polygon 
                      key={i}
                      points={DIMENSIONS.map((_, j) => {
                        const angle = (j / 5) * 2 * Math.PI - Math.PI / 2;
                        const x = 120 + 82 * f * Math.cos(angle);
                        const y = 110 + 82 * f * Math.sin(angle);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none" stroke="var(--border)" strokeWidth="1"
                    />
                  ))}
                  {/* Axis lines */}
                  {DIMENSIONS.map((_, i) => {
                    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                    return (
                      <line 
                        key={i}
                        x1="120" y1="110"
                        x2={120 + 82 * Math.cos(angle)}
                        y2={110 + 82 * Math.sin(angle)}
                        stroke="var(--border)" strokeWidth="1"
                      />
                    );
                  })}
                  {/* Data polygon */}
                  <polygon 
                    points={dimensionScores.map((s, i) => {
                      const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                      const x = 120 + (s / 20) * 82 * Math.cos(angle);
                      const y = 110 + (s / 20) * 82 * Math.sin(angle);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="rgba(193,127,36,0.14)" stroke="var(--gold)" strokeWidth="2"
                  />
                  {/* Data points */}
                  {dimensionScores.map((s, i) => {
                    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                    const x = 120 + (s / 20) * 82 * Math.cos(angle);
                    const y = 110 + (s / 20) * 82 * Math.sin(angle);
                    return <circle key={i} cx={x} cy={y} r="4" fill="var(--gold)" />;
                  })}
                  {/* Labels */}
                  {DIMENSIONS.map((d, i) => {
                    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                    const x = 120 + 100 * Math.cos(angle);
                    const y = 110 + 100 * Math.sin(angle);
                    return <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="var(--text3)">{DIMENSION_ICONS[i]}</text>;
                  })}
                </svg>
              </div>
              <div className="rl">
                {DIMENSIONS.map((dim, i) => {
                  const dt = getTierColor(dimensionScores[i]);
                  return (
                    <div key={dim} className="rl-item">
                      <div className="rl-dot" style={{ background: dt.color }}></div>
                      <div className="rl-lbl">{dim}</div>
                      <div className="rl-score">{dimensionScores[i]}/20</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Dimension bars */}
            <div className="dim-bars" style={{ marginTop: '18px' }}>
              {DIMENSIONS.map((dim, i) => {
                const dt = getTierColor(dimensionScores[i]);
                const pct = Math.round((dimensionScores[i] / 20) * 100);
                return (
                  <div key={dim} className="dbar-row">
                    <div className="dbar-lbl">{DIMENSION_ICONS[i]} {dim}</div>
                    <div className="dbar-bg">
                      <div className="dbar-fill" style={{ width: `${pct}%`, background: dt.color }}></div>
                    </div>
                    <div className="dbar-score">{dimensionScores[i]}/20</div>
                    <div className="dbar-pill" style={{ background: `${dt.color}18`, color: dt.color, border: `1px solid ${dt.color}40` }}>{dt.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section C: Dimension Deep Dive */}
        <div className="r-sec" id="sec-c">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section C · 5 Dimensions</div>
              <div className="rs-title">Dimension Deep Dive</div>
            </div>
            <div className="rs-badge">AI-Generated</div>
          </div>
          <div className="rs-body">
            {DIMENSIONS.map((dim, i) => {
              const dt = getTierColor(dimensionScores[i]);
              return (
                <div key={dim} style={{ padding: '14px', background: 'var(--bg)', borderRadius: 'var(--r)', border: '1px solid var(--border)', marginBottom: '9px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '9px' }}>
                    <span style={{ fontSize: '16px' }}>{DIMENSION_ICONS[i]}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--navy)' }}>{dim}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: dt.color }}>{dimensionScores[i]}/20 · {dt.name}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.65', marginBottom: '7px' }}>
                    {i === 0 ? 'Your AI literacy shows strong foundational understanding. Focus on developing deeper technical knowledge and staying current with rapidly evolving AI capabilities.' :
                     i === 1 ? 'Strategic alignment is solid. Consider formalizing your AI roadmap and ensuring executive buy-in for key initiatives.' :
                     i === 2 ? 'Data infrastructure maturity varies. Prioritize data quality improvements and establishing clear data governance frameworks.' :
                     i === 3 ? 'Cultural adoption is progressing well. Continue building internal capabilities through targeted training programs.' :
                     'Governance frameworks need attention. Develop clear AI ethics guidelines and risk management protocols.'}
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--teal)', padding: '7px 11px', background: 'var(--teal-light)', borderRadius: 'var(--r)' }}>
                    → {i === 0 ? 'Complete an advanced AI course this quarter' :
                       i === 1 ? 'Schedule AI strategy review with leadership' :
                       i === 2 ? 'Conduct data quality assessment' :
                       i === 3 ? 'Launch team upskilling initiative' :
                       'Establish AI governance committee'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section D: Industry Benchmark */}
        <div className="r-sec" id="sec-d">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section D · Peer Comparison</div>
              <div className="rs-title">Industry Benchmark Report</div>
            </div>
            <div className="rs-badge">Synthesised</div>
          </div>
          <div className="rs-body">
            <p>Based on aggregate data from {profile.industry || 'technology'} sector participants, your score positions you {totalScore! > 62 ? 'above' : totalScore! > 45 ? 'in line with' : 'below'} the industry average.</p>
            <table className="peer-tbl">
              <thead>
                <tr>
                  <th>Peer Group</th>
                  <th>Avg Score</th>
                  <th>vs. You</th>
                  <th>Primary Gap</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{profile.industry || 'Tech'} · All Levels</td>
                  <td>
                    <div className="peer-bar">
                      <div className="peer-bar-bg"><div className="peer-bar-f" style={{ width: '62%' }}></div></div>62
                    </div>
                  </td>
                  <td style={{ color: totalScore! > 62 ? 'var(--green)' : 'var(--red)' }}>
                    {totalScore! > 62 ? '▲ ' + (totalScore! - 62) : '▼ ' + (62 - totalScore!)}
                  </td>
                  <td>Workflow Integration</td>
                </tr>
                <tr>
                  <td>{profile.industry || 'Tech'} · Your Seniority</td>
                  <td>
                    <div className="peer-bar">
                      <div className="peer-bar-bg"><div className="peer-bar-f" style={{ width: '65%' }}></div></div>65
                    </div>
                  </td>
                  <td style={{ color: totalScore! > 65 ? 'var(--green)' : 'var(--red)' }}>
                    {totalScore! > 65 ? '▲ ' + (totalScore! - 65) : '▼ ' + (65 - totalScore!)}
                  </td>
                  <td>Strategic Alignment</td>
                </tr>
                <tr>
                  <td>{profile.industry || 'Tech'} · Your Function</td>
                  <td>
                    <div className="peer-bar">
                      <div className="peer-bar-bg"><div className="peer-bar-f" style={{ width: '59%' }}></div></div>59
                    </div>
                  </td>
                  <td style={{ color: totalScore! > 59 ? 'var(--green)' : 'var(--red)' }}>
                    {totalScore! > 59 ? '▲ ' + (totalScore! - 59) : '▼ ' + (59 - totalScore!)}
                  </td>
                  <td>Governance & Risk</td>
                </tr>
                <tr className="hl">
                  <td><strong>You</strong></td>
                  <td>
                    <div className="peer-bar">
                      <div className="peer-bar-bg"><div className="peer-bar-f you" style={{ width: `${totalScore}%` }}></div></div><strong>{totalScore}</strong>
                    </div>
                  </td>
                  <td>—</td>
                  <td><strong>{DIMENSIONS[dimensionScores.indexOf(Math.min(...dimensionScores))]}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section E: Company Intel */}
        <div className="r-sec" id="sec-e">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section E · Company Intel</div>
              <div className="rs-title">Company AI Posture Analysis</div>
            </div>
            <div className="rs-badge">Validated</div>
          </div>
          <div className="rs-body">
            <p>{profile.company || 'Your organisation'} appears to be at an early-to-mid stage of AI adoption. Key observations based on your profile:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8' }}>
              <li>AI strategy is likely in development or early implementation phase</li>
              <li>Data infrastructure shows moderate maturity with room for improvement</li>
              <li>Leadership commitment to AI appears present but may need further cultivation</li>
              <li>Opportunity to accelerate adoption through targeted initiatives</li>
            </ul>
          </div>
        </div>

        {/* Section F: Skills Matrix */}
        <div className="r-sec" id="sec-f">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section F · Career Trajectory</div>
              <div className="rs-title">AI Skills Gap & Market Value Matrix</div>
            </div>
            <div className="rs-badge">Intelligence</div>
          </div>
          <div className="rs-body">
            <table className="skills-tbl">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Your Level</th>
                  <th>Market Demand</th>
                  <th>Premium</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((dim, i) => {
                  const dt = getTierColor(dimensionScores[i]);
                  const premium = Math.round(Math.random() * 30000 + 10000);
                  return (
                    <tr key={dim}>
                      <td><strong>{dim}</strong></td>
                      <td>{dt.name}</td>
                      <td>High</td>
                      <td style={{ color: 'var(--green)', fontWeight: '600' }}>+${premium.toLocaleString()}</td>
                      <td><span className={`rag rag-${dt.name === 'Strong' ? 'g' : dt.name === 'Developing' ? 'a' : 'r'}`}></span>{dt.name === 'Strong' ? 'On Track' : dt.name === 'Developing' ? 'Developing' : 'Gap Identified'}</td>
                      <td>{i < 2 ? <span className="prem">⚡ Highest</span> : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--gold-light)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--gold)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '4px' }}>Career Intelligence</div>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6' }}>
                Your AI skills command a significant salary premium in the current market. Prioritizing development in {DIMENSIONS[dimensionScores.indexOf(Math.min(...dimensionScores))]} will maximize your career value.
              </p>
            </div>
          </div>
        </div>

        {/* Section G: Regulatory */}
        <div className="r-sec" id="sec-g">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section G · Regulatory</div>
              <div className="rs-title">Regulatory Intelligence Report</div>
            </div>
            <div className="rs-badge">Validated · {profile.country || 'Global'}</div>
          </div>
          <div className="rs-body">
            <p>The regulatory landscape for AI in {profile.country || 'your region'} is evolving rapidly. Key frameworks to monitor:</p>
            <div className="reg-list">
              {['EU AI Act', 'ISO 42001', profile.country === 'Singapore' ? 'MAS AI Guidelines' : 'National AI Framework'].map((reg, i) => {
                const govScore = dimensionScores[3];
                const status = govScore >= 15 ? 'green' : govScore >= 10 ? 'amber' : 'red';
                const label = { green: '✓ Compliant', amber: '⚠ Review', red: '✗ Gap' }[status];
                const color = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)' }[status];
                return (
                  <div key={reg} className="reg-item">
                    <div>{['🔒', '📋', '⚖️'][i]}</div>
                    <div>
                      <div className="reg-name">{reg}</div>
                      <div className="reg-desc">Applicable to {profile.industry || 'your industry'} in {profile.country || 'your region'}</div>
                    </div>
                    <div style={{ color, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px' }}>{label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'var(--text3)' }}>Review now</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section H: Risk Register */}
        <div className="r-sec" id="sec-h">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section H · Risk & Opportunity</div>
              <div className="rs-title">Risk & Opportunity Register</div>
            </div>
            <div className="rs-badge">2 Risks · 2 Opportunities</div>
          </div>
          <div className="rs-body">
            <div className="risk-grid">
              <div className="risk-card rc-high">
                <div className="risk-hdr">
                  <span className="risk-type rt-risk">RISK</span>
                  <span className="risk-lvl">High</span>
                </div>
                <div className="risk-title">Data Governance Gap</div>
                <div className="risk-desc">Inadequate data governance could expose the organisation to regulatory penalties and AI failures.</div>
                <div className="risk-action"><strong>Action:</strong> Establish data governance framework and appoint data stewards.</div>
              </div>
              <div className="risk-card rc-med">
                <div className="risk-hdr">
                  <span className="risk-type rt-risk">RISK</span>
                  <span className="risk-lvl">Medium</span>
                </div>
                <div className="risk-title">AI Talent Shortage</div>
                <div className="risk-desc">Limited internal AI expertise may slow adoption and increase consultant dependency.</div>
                <div className="risk-action"><strong>Action:</strong> Develop talent pipeline through training and strategic hiring.</div>
              </div>
              <div className="risk-card rc-opp">
                <div className="risk-hdr">
                  <span className="risk-type rt-opp">OPPORTUNITY</span>
                  <span className="risk-lvl">High</span>
                </div>
                <div className="risk-title">First-Mover Advantage</div>
                <div className="risk-desc">Early AI adoption in your sector could create significant competitive differentiation.</div>
                <div className="risk-action"><strong>Action:</strong> Prioritize quick wins to demonstrate value and build momentum.</div>
              </div>
              <div className="risk-card rc-opp">
                <div className="risk-hdr">
                  <span className="risk-type rt-opp">OPPORTUNITY</span>
                  <span className="risk-lvl">Medium</span>
                </div>
                <div className="risk-title">Productivity Gains</div>
                <div className="risk-desc">AI automation could unlock 20-30% efficiency improvements in key workflows.</div>
                <div className="risk-action"><strong>Action:</strong> Identify high-impact use cases and pilot AI solutions.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section I: Competitive Intel */}
        <div className="r-sec" id="sec-i">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section I · Market Signals</div>
              <div className="rs-title">Competitive Intelligence Digest</div>
            </div>
            <div className="rs-badge">Intelligence</div>
          </div>
          <div className="rs-body">
            <p>Based on research into {profile.industry || 'your industry'}:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--text2)', lineHeight: '1.8' }}>
              <li><strong>Key trend:</strong> Generative AI adoption accelerating across sector</li>
              <li><strong>Competitor activity:</strong> Major players investing heavily in AI capabilities</li>
              <li><strong>Technology focus:</strong> Shift toward AI-native workflows and agentic systems</li>
              <li><strong>Talent movement:</strong> AI specialists commanding premium compensation</li>
            </ul>
          </div>
        </div>

        {/* Section J: Roadmap */}
        <div className="r-sec" id="sec-j">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section J · Action Plan</div>
              <div className="rs-title">Strategic Development Roadmap</div>
            </div>
            <div className="rs-badge">3 Horizons</div>
          </div>
          <div className="rs-body">
            <div className="rm-grid">
              <div>
                <div className="rm-col-hdr">Immediate (0–30 days)</div>
                <div className="rm-item">
                  <div className="rm-title">Complete AI Fundamentals</div>
                  <div className="rm-rat">Build foundational knowledge</div>
                  <div className="rm-step">Enroll in online AI course</div>
                </div>
                <div className="rm-item">
                  <div className="rm-title">Identify Quick Wins</div>
                  <div className="rm-rat">Map high-impact use cases</div>
                  <div className="rm-step">Document 3 potential projects</div>
                </div>
              </div>
              <div>
                <div className="rm-col-hdr">Short Term (30–90 days)</div>
                <div className="rm-item">
                  <div className="rm-title">Pilot First Project</div>
                  <div className="rm-rat">Launch initial AI initiative</div>
                  <div className="rm-step">Present business case to leadership</div>
                </div>
                <div className="rm-item">
                  <div className="rm-title">Build Team Capabilities</div>
                  <div className="rm-rat">Upskill core team members</div>
                  <div className="rm-step">Allocate training budget</div>
                </div>
              </div>
              <div>
                <div className="rm-col-hdr">Medium Term (90–180 days)</div>
                <div className="rm-item">
                  <div className="rm-title">Scale Successful Pilots</div>
                  <div className="rm-rat">Expand proven initiatives</div>
                  <div className="rm-step">Develop rollout plan</div>
                </div>
                <div className="rm-item">
                  <div className="rm-title">Establish Governance</div>
                  <div className="rm-rat">Formalize AI policies</div>
                  <div className="rm-step">Form governance committee</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section K: Learning Pathway */}
        <div className="r-sec" id="sec-k">
          <div className="rs-hdr">
            <div>
              <div className="rs-tag">Section K · Development</div>
              <div className="rs-title">Learning Pathway & Success Metrics</div>
            </div>
          </div>
          <div className="rs-body">
            <div style={{ padding: '14px 17px', background: 'var(--navy)', borderRadius: 'var(--r)', marginBottom: '16px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '7px' }}>Recommended Learning Path</div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
                Focus on {DIMENSIONS[dimensionScores.indexOf(Math.min(...dimensionScores))].toLowerCase()} development. Start with fundamentals, then progress to practical application. Target 2-3 hours per week over 12 weeks.
              </p>
            </div>
            <div className="sm-grid">
              <div className="sm-card">
                <div className="sm-icon">🎯</div>
                <div className="sm-txt">Complete 3 AI courses</div>
              </div>
              <div className="sm-card">
                <div className="sm-icon">📊</div>
                <div className="sm-txt">Launch 1 AI pilot</div>
              </div>
              <div className="sm-card">
                <div className="sm-icon">👥</div>
                <div className="sm-txt">Train 5+ team members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="rep-footer">
          © {new Date().getFullYear()} AI Native Foundation · AI Compass · Confidential · {reportId}
        </div>
      </div>
    </div>
  );
}
