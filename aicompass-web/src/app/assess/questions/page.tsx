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
  const id = searchParams.get('id');

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

  const checkValidationAndLoad = async () => {
    try {
      // Check if there's intelligence to validate
      const intelStatus = await getIntelligenceStatus(id!);
      if (intelStatus.status === 'completed' && !intelStatus.validated) {
        // Redirect to validation
        router.push(`/assess/validation?id=${id}`);
        return;
      }
      // Otherwise load questions
      loadQuestions();
    } catch {
      loadQuestions();
    }
  };

  const loadQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
      
      // Load existing answers
      const assessment = await getAssessment(id!);
      if (assessment.answers) {
        const ans: Record<number, number> = {};
        Object.entries(assessment.answers).forEach(([k, v]) => {
          ans[parseInt(k)] = v as number;
        });
        setAnswers(ans);
        
        // Find first unanswered question
        const answered = Object.keys(ans).map(k => parseInt(k));
        const nextQ = questions.find(q => !answered.includes(q.id));
        if (nextQ) setCurrentQ(nextQ.id);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: number) => {
    setSaving(true);
    try {
      await saveAnswer(id!, currentQ, answer);
      setAnswers({currentQ]: answer ...answers, [ });
      
      // Go to next question
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
    setSubmitting(true);
    try {
      const result = await submitAssessment(id!);
      router.push(`/report/${id}`);
    } catch (err) {
      console.error('Error submitting:', err);
      setSubmitting(false);
    }
  };

  const currentQuestion = questions.find(q => q.id === currentQ);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === 25;

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
            {/* Dimension Tag */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {currentQuestion.dimension_label}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl text-white font-medium mb-8">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map((option, idx) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(idx + 1)}
                  disabled={saving}
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

            {/* Navigation */}
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

        {/* Submit Section */}
        {allAnswered && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
            >
              {submitting ? 'Calculating Results...' : 'Submit Assessment →'}
            </button>
          </div>
        )}

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
