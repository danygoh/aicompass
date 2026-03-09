'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAssessmentStore } from '@/lib/store';

const INDUSTRIES = [
  'Financial Services',
  'Technology',
  'Healthcare & Life Sciences',
  'Professional Services',
  'Energy & Resources',
  'Retail & Consumer',
  'Manufacturing',
  'Government & Public Sector',
  'Education',
  'Media & Telecommunications',
];

const COUNTRIES = [
  'Singapore',
  'United Kingdom',
  'United States',
  'Australia',
  'Hong Kong',
  'UAE',
  'Canada',
  'Germany',
  'India',
  'Japan',
  'Other',
];

const SENIORITY_LEVELS = [
  'Individual Contributor',
  'Manager',
  'Director',
  'C-Suite / VP',
  'Board',
];

const DEPARTMENTS = [
  'Technology / Engineering',
  'Risk & Compliance',
  'Finance',
  'Operations',
  'Strategy',
  'Marketing',
  'HR / People',
  'Legal',
  'General Management',
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { profile, setProfile, reset } = useAssessmentStore();
  const [loading, setLoading] = useState(false);

  // Reset profile on mount to ensure clean state
  useEffect(() => {
    // Only reset if no session (fresh user)
    if (!session) {
      reset();
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfile({ [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save profile to store
      router.push('/assess/collect');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = profile.firstName && profile.lastName && profile.email && 
    profile.jobTitle && profile.company && profile.industry && 
    profile.country && profile.seniority && profile.department;

  return (
    <div id="s-profile">
      {/* Navigation */}
      <nav id="nav">
        <div className="nav-logo">
          AI <em>Compass</em>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{session?.user?.email}</span>
        </div>
      </nav>

      {/* Progress Bar */}
      <div id="prog-strip">
        <div id="prog-fill" style={{ width: '12.5%' }} />
      </div>

      {/* Background Orbs */}
      <div className="orb o1" />
      <div className="orb o2" />

      {/* Main Content */}
      <div className="page">
        <div className="step-tag">Step 1 of 5</div>
        
        <h2 className="page-h2">Tell us about yourself</h2>
        <p className="page-sub">
          This helps us personalise your assessment and research your context.
        </p>

        <form onSubmit={handleSubmit} className="glass">
          <div className="form-sec-lbl">Personal Details</div>
          
          <div className="form-row">
            <div className="fg">
              <label className="fl">First Name <span>*</span></label>
              <input
                type="text"
                className="fi"
                placeholder="John"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="fg">
              <label className="fl">Last Name <span>*</span></label>
              <input
                type="text"
                className="fi"
                placeholder="Doe"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="fg">
            <label className="fl">Work Email <span>*</span></label>
            <input
              type="email"
              className="fi"
              placeholder="john@company.com"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="fg">
            <label className="fl">Job Title <span>*</span></label>
            <input
              type="text"
              className="fi"
              placeholder="e.g. Senior Product Manager"
              value={profile.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              required
            />
          </div>

          <div className="form-div" />

          <div className="form-sec-lbl">Organisation</div>

          <div className="form-row">
            <div className="fg">
              <label className="fl">Company <span>*</span></label>
              <input
                type="text"
                className="fi"
                placeholder="Company name"
                value={profile.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
              />
            </div>
            <div className="fg">
              <label className="fl">Industry <span>*</span></label>
              <select
                className="fi"
                value={profile.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                required
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="fg">
              <label className="fl">Country <span>*</span></label>
              <select
                className="fi"
                value={profile.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Seniority <span>*</span></label>
              <select
                className="fi"
                value={profile.seniority}
                onChange={(e) => handleChange('seniority', e.target.value)}
                required
              >
                <option value="">Select level</option>
                {SENIORITY_LEVELS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Department <span>*</span></label>
            <select
              className="fi"
              value={profile.department}
              onChange={(e) => handleChange('department', e.target.value)}
              required
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="fg">
            <label className="fl">Cohort Code <span style={{color:'rgba(255,255,255,0.3)'}}>(Optional)</span></label>
            <input
              type="text"
              className="fi"
              placeholder="e.g. OXSAID-2026"
              value={profile.cohortCode}
              onChange={(e) => handleChange('cohortCode', e.target.value)}
            />
          </div>

          <div className="form-submit">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="btn-cta"
              style={{ opacity: (!isFormValid || loading) ? 0.5 : 1, cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
          
          <p className="form-note">
            By continuing, you agree to our assessment terms.
          </p>
        </form>
      </div>
    </div>
  );
}
