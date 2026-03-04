'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuestions, saveAnswer, submitAssessment, getAssessment, getIntelligenceStatus } from '@/lib/api';

interface Question {
  id: number;
  dimension: string;
  dimension_label: string;
  text: string;
  options: { A: string; B: string; C: string; D: string };
}

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') || '';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push('/');
      return;
    }
    checkValidationAndLoad();
  }, [id, router]);

  // Skip validation check - user came from validation page
  const checkValidationAndLoad = async () => {
    loadQuestions();
  };

  const loadQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
      loadExistingAnswers();
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAnswers = async () => {
    try {
      const assessment = await getAssessment(id);
      if (assessment.answers) {
        setAnswers(assessment.answers);
        const answered = Object.keys(assessment.answers).map(k => parseInt(k));
        const nextQ = questions.find(q => !answered.includes(q.id));
        if (nextQ) setCurrentQ(nextQ.id);
      }
    } catch (err) {
      console.error('Error loading answers:', err);
    }
  };

  const handleAnswer = async (answer: number) => {
    if (!id || saving) return;
    setSaving(true);
    try {
      await saveAnswer(id, currentQ, answer);
      setAnswers(prev => ({ ...prev, [currentQ]: answer }));
      if (currentQ < 25) {
        setCurrentQ(currentQ + 1);
      }
    } catch (err) {
      console.error('Error saving answer:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!id || submitting) return;
    setSubmitting(true);
    router.push(`/assess/generating?id=${id}`);
    try {
      await submitAssessment(id);
      router.push(`/report/${id}`);
    } catch (err) {
      console.error('Error submitting:', err);
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= 25;
  const currentQuestion = questions.find(q => q.id === currentQ);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/')} className="text-purple-300 hover:text-white">
            ← Exit
          </button>
          <div className="text-purple-200">
            Question {currentQ} of 25
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / 25) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-purple-300">
            <span>{answeredCount} answered</span>
            <span>{25 - answeredCount} remaining</span>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {currentQuestion.dimension_label}
              </span>
            </div>

            <h2 className="text-xl text-white font-medium mb-8">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map((option, idx) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(idx + 1)}
                  disabled={saving || !id}
                  className={`w-full p-4 text-left rounded-xl border transition-all ${
                    answers[currentQ] === idx + 1
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-purple-100 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="inline-block w-8 h-8 rounded-full bg-white/10 text-center leading-8 mr-3 font-medium">
                    {option}
                  </span>
                  {currentQuestion.options[option]}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentQ(Math.max(1, currentQ - 1))}
                disabled={currentQ === 1}
                className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {currentQ < 25 && (
                <button
                  onClick={() => setCurrentQ(Math.min(25, currentQ + 1))}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                  Skip →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit Section - Always render but hidden until all answered */}
        <div className="mt-8">
          <div className={`text-center ${allAnswered ? 'block' : 'hidden'}`}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
            >
              {submitting ? 'Calculating Results...' : 'Submit Assessment →'}
            </button>
          </div>
          {!allAnswered && (
            <p className="text-center text-purple-400 text-sm">
              Answer all 25 questions to submit
            </p>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8">
          <h3 className="text-purple-200 text-sm mb-3">Jump to question:</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map(q => (
              <button
                key={q.id}
                onClick={() => setCurrentQ(q.id)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  answers[q.id]
                    ? 'bg-green-500/30 text-green-200 border border-green-500/30'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                } ${currentQ === q.id ? 'ring-2 ring-purple-500' : ''}`}
              >
                {q.id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
