'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/store';
import { INTELLIGENCE_CATEGORIES, INTELLIGENCE_KEYS } from '@/data/questions';

export default function ValidatePage() {
  const router = useRouter();
  const { intelligence, fieldStates, fieldValues, setFieldState, setFieldValue } = useAssessmentStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate totals
  const totalFields = INTELLIGENCE_KEYS.reduce((acc, key) => {
    return acc + (intelligence[key]?.fields?.length || 0);
  }, 0);

  const reviewedFields = Object.keys(fieldStates).filter(k => fieldStates[k] !== 'pending').length;
  const confidence = totalFields > 0 ? Math.round((reviewedFields / totalFields) * 100) : 0;

  const getFieldState = (categoryIdx: number, fieldIdx: number) => {
    return fieldStates[`${categoryIdx}_${fieldIdx}`] || 'pending';
  };

  const getFieldValue = (categoryIdx: number, fieldIdx: number, defaultValue: string) => {
    return fieldValues[`${categoryIdx}_${fieldIdx}`] || defaultValue;
  };

  const toggleConfirm = (categoryIdx: number, fieldIdx: number) => {
    const key = `${categoryIdx}_${fieldIdx}`;
    const currentState = fieldStates[key] || 'pending';
    setFieldState(key, currentState === 'confirmed' ? 'pending' : 'confirmed');
  };

  const toggleFlag = (categoryIdx: number, fieldIdx: number) => {
    const key = `${categoryIdx}_${fieldIdx}`;
    const currentState = fieldStates[key] || 'pending';
    setFieldState(key, currentState === 'flagged' ? 'pending' : 'flagged');
  };

  const confirmSection = (categoryIdx: number) => {
    const key = INTELLIGENCE_KEYS[categoryIdx];
    const fields = intelligence[key]?.fields || [];
    fields.forEach((_, idx) => {
      setFieldState(`${categoryIdx}_${idx}`, 'confirmed');
    });
  };

  const flagSection = (categoryIdx: number) => {
    const key = INTELLIGENCE_KEYS[categoryIdx];
    const fields = intelligence[key]?.fields || [];
    fields.forEach((_, idx) => {
      setFieldState(`${categoryIdx}_${idx}`, 'flagged');
    });
  };

  const handleFieldChange = (categoryIdx: number, fieldIdx: number, value: string, originalValue: string) => {
    const key = `${categoryIdx}_${fieldIdx}`;
    setFieldValue(key, value);
    if (value !== originalValue) {
      setFieldState(key, 'edited');
    }
  };

  const confirmAllRemaining = () => {
    // Confirm all fields
    INTELLIGENCE_KEYS.forEach((key, categoryIdx) => {
      const fields = intelligence[key]?.fields || [];
      fields.forEach((_, idx) => {
        setFieldState(`${categoryIdx}_${idx}`, 'confirmed');
      });
    });
  };

  const handleContinue = () => {
    // Only proceed if all fields are reviewed
    if (reviewedFields < totalFields) {
      confirmAllRemaining();
    }
    router.push('/assess/questions');
  };

  if (!isHydrated) {
    return (
      <div id="s-validate">
        <nav id="nav">
          <div className="nav-logo">AI <em>Compass</em></div>
        </nav>
        <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>
          Loading intelligence data...
        </div>
      </div>
    );
  }

  return (
    <div id="s-validate">
      {/* Navigation */}
      <nav id="nav">
        <div className="nav-logo">AI <em>Compass</em></div>
      </nav>

      {/* Progress Bar */}
      <div id="prog-strip">
        <div id="prog-fill" style={{ width: '37.5%' }} />
      </div>

      <div className="val-wrap">
        <div className="val-step">Step 3 of 5 · Intelligence Validation</div>
        <h2 className="val-h2">Review Your Intelligence</h2>
        <p className="val-sub">Confirm or correct what the AI found about you. Every field shapes your questions and report.</p>

        {/* Confidence Strip */}
        <div className="conf-strip">
          <span className="conf-lbl">Confidence</span>
          <div className="conf-bar-wrap">
            <div 
              className="conf-bar" 
              id="conf-bar" 
              style={{ 
                width: `${confidence}%`, 
                background: confidence > 70 ? 'var(--green)' : confidence > 40 ? 'var(--gold)' : 'var(--red)' 
              }} 
            />
          </div>
          <span 
            className="conf-pct" 
            id="conf-pct"
            style={{ color: confidence > 70 ? 'var(--green)' : confidence > 40 ? 'var(--gold)' : 'var(--red)' }}
          >
            {confidence}%
          </span>
          <span className="conf-info" id="conf-info">{reviewedFields} / {totalFields} reviewed</span>
        </div>

        {/* Bulk Actions */}
        <div className="bulk-bar">
          <div className="bulk-lbl">Quick review</div>
          <button className="bulk-btn bb-c" id="bb-c" onClick={handleContinue}>✓ Confirm All Remaining</button>
        </div>

        {/* All Category Sections */}
        <div id="v-sections">
          {INTELLIGENCE_CATEGORIES.map((categoryName, categoryIdx) => {
            const key = INTELLIGENCE_KEYS[categoryIdx];
            const categoryData = intelligence[key];
            const fields = categoryData?.fields || [];
            
            // Calculate reviewed count for this section
            const sectionReviewed = fields.filter((_, idx) => {
              const state = fieldStates[`${categoryIdx}_${idx}`] || 'pending';
              return state !== 'pending';
            }).length;

            return (
              <div key={key} className="v-sec">
                <div className="v-sec-hdr">
                  <div className="v-sec-left">
                    <span className="v-sec-num">{(categoryIdx + 1).toString().padStart(2, '0')}</span>
                    <span className="v-sec-name">{categoryName}</span>
                  </div>
                  <div className="v-sec-right">
                    <span className="v-sec-prog" id={`vsp-${categoryIdx}`}>
                      {sectionReviewed} / {fields.length}
                    </span>
                    <button className="sbb sbb-c" onClick={() => confirmSection(categoryIdx)}>✓ All</button>
                    <button className="sbb sbb-f" onClick={() => flagSection(categoryIdx)}>⚑ All</button>
                  </div>
                </div>
                <div className="v-sec-body">
                  {fields.length === 0 ? (
                    <div className="f-row">
                      <span className="f-lbl">No data</span>
                      <div className="f-val-wrap">
                        <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>No data available</span>
                      </div>
                      <div className="f-acts" />
                    </div>
                  ) : (
                    fields.map((field: any, idx: number) => {
                      const fieldState = getFieldState(categoryIdx, idx);
                      const fieldValue = getFieldValue(categoryIdx, idx, field.fieldValue);
                      const isNull = !field.fieldValue;

                      return (
                        <div 
                          key={idx} 
                          className={`f-row st-${fieldState}`}
                          id={`fr-${categoryIdx}_${idx}`}
                        >
                          <span className="f-lbl">{field.fieldName}</span>
                          <div className="f-val-wrap">
                            <textarea
                              className={`f-ta ${isNull ? 'nv' : ''}`}
                              id={`fi-${categoryIdx}_${idx}`}
                              rows={2}
                              defaultValue={fieldValue}
                              onChange={(e) => handleFieldChange(categoryIdx, idx, e.target.value, field.fieldValue)}
                            />
                            {field.source && !isNull && (
                              <div className="f-src">↗ {field.source}</div>
                            )}
                          </div>
                          <div className="f-acts">
                            <button
                              className={`fa ${fieldState === 'confirmed' ? 'fa-con' : fieldState === 'edited' ? 'fa-edi' : 'fa-c'}`}
                              id={`fcb-${categoryIdx}_${idx}`}
                              onClick={() => toggleConfirm(categoryIdx, idx)}
                            >
                              {fieldState === 'confirmed' ? '✓ Confirmed' : fieldState === 'edited' ? '✎ Edited' : 'Confirm'}
                            </button>
                            <button
                              className={`fa ${fieldState === 'flagged' ? 'fa-fla' : 'fa-f'}`}
                              id={`ffb-${categoryIdx}_${idx}`}
                              onClick={() => toggleFlag(categoryIdx, idx)}
                            >
                              {fieldState === 'flagged' ? '⚑ Flagged' : 'Flag'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="v-footer">
        <div className="vf-left" id="vf-left">
          <strong>{reviewedFields}</strong> of <strong>{totalFields}</strong> reviewed · <strong>{totalFields - reviewedFields}</strong> pending
        </div>
        <button 
          className={`btn-begin ${reviewedFields === totalFields ? 'on' : ''}`} 
          id="btn-begin" 
          onClick={handleContinue}
        >
          {reviewedFields === totalFields ? '✓ ' : ''}Begin Assessment →
        </button>
      </div>

      <style jsx>{`
        .v-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(14px);
          border-top: 1px solid var(--border);
          padding: 12px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 400;
        }
        .vf-left {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text3);
        }
        .btn-begin {
          padding: 12px 24px;
          background: var(--bg2);
          color: var(--text3);
          border: 2px solid var(--border);
          border-radius: var(--r);
          font-size: 14px;
          font-weight: 600;
          cursor: not-allowed;
          transition: all 0.3s;
        }
        .btn-begin.on {
          background: linear-gradient(135deg, var(--teal), var(--teal2));
          color: white;
          border-color: transparent;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 109, 107, 0.3);
        }
        .btn-begin.on:hover {
          transform: translateY(-1px);
        }
        .btn-begin.on {
          background: linear-gradient(135deg, var(--teal), var(--teal2));
          box-shadow: 0 4px 18px rgba(0,109,107,0.38);
        }
      `}</style>
    </div>
  );
}
