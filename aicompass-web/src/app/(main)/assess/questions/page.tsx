'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/store';
import { QUESTIONS, DIMENSIONS, DIMENSION_ICONS } from '@/data/questions';

export default function QuestionsPage() {
  const router = useRouter();
  const { 
    responses, setResponse, 
    currentQuestion, setCurrentQuestion,
    variants, setVariant,
    profile 
  } = useAssessmentStore();

  // Auto-select variants based on profile on mount
  useEffect(() => {
    // Determine variant based on seniority level
    let selectedVariant = 'standard';
    
    if (profile.seniority === 'C-Suite / VP' || profile.seniority === 'Board') {
      // Senior leadership gets stretch questions
      selectedVariant = 'stretch';
    } else if (profile.industry === 'Financial Services' || profile.industry === 'Healthcare & Life Sciences') {
      // Regulated industries get diagnostic questions
      selectedVariant = 'diagnostic';
    }
    
    // Set all questions to the selected variant
    QUESTIONS.forEach((_, idx) => {
      if (!variants[idx]) {
        setVariant(idx, selectedVariant);
      }
    });
  }, []);

  const question = QUESTIONS[currentQuestion];
  const variant = variants[currentQuestion] || 'standard';
  const questionData = question?.variants?.[variant as keyof typeof question.variants];
  const dimension = DIMENSIONS[question?.dim || 0];
  const dimensionIcon = DIMENSION_ICONS[question?.dim || 0];

  const handleSelect = (optionIndex: number) => {
    setResponse(currentQuestion, optionIndex);
    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        router.push('/assess/paywall');
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    router.push('/assess/paywall');
  };

  const answeredCount = responses.filter(r => r !== null).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);
  const allAnswered = answeredCount === QUESTIONS.length;

  return (
    <div id="s-assess" className="screen active">
      {/* Navigation */}
      <nav id="nav">
        <div className="nav-logo">AI <em>Compass</em></div>
      </nav>

      {/* Progress Bar */}
      <div id="prog-strip">
        <div id="prog-fill" style={{ width: '50%' }} />
      </div>

      {/* Background Orbs */}
      <div className="orb o1" />
      <div className="orb o2" />

      <div className="assess-inner">
        {/* Top */}
        <div className="assess-top">
          <div className="assess-prog-wrap">
            <div className="ap-labels">
              <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="ap-bar">
              <div className="ap-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="dim-badge">
            {dimensionIcon} {dimension} · {question?.dim ? question.dim + 1 : 1} of 5
          </div>
        </div>

        {/* Question Card */}
        {questionData && (
          <div className="q-card">
            <div className="q-text">
              {questionData.q}
            </div>

            <div className="opts">
              {questionData.opts.map((option: string, idx: number) => {
                const isSelected = responses[currentQuestion] === idx;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`opt ${isSelected ? 'sel' : ''}`}
                  >
                    <span className="opt-key">{String.fromCharCode(65 + idx)}</span>
                    <span className="opt-txt">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Dots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '32px' }}>
          {QUESTIONS.map((_, idx) => {
            const isAnswered = responses[idx] !== null;
            const isCurrent = idx === currentQuestion;
            
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                style={{
                  width: isCurrent ? '16px' : '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isCurrent 
                    ? 'var(--gold)' 
                    : isAnswered 
                      ? 'var(--teal)' 
                      : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer'
                }}
              />
            );
          })}
        </div>

        {/* Navigation */}
        <div className="assess-nav">
          <button 
            className="btn-back" 
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            ← Back
          </button>
          <button 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            Submit & Generate Report →
          </button>
        </div>
      </div>
    </div>
  );
}
