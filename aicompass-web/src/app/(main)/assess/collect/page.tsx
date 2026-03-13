'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/lib/store';
import { INTELLIGENCE_CATEGORIES } from '@/data/questions';

export default function CollectPage() {
  const router = useRouter();
  const { profile, intelligence, setIntelligence } = useAssessmentStore();
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!profile.company || !profile.industry) {
      router.push('/assess/profile');
      return;
    }

    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      // API returns { intelligence, dataSource, timestamp }
      setIntelligence(data.intelligence || data);
      
      // Animate through categories
      for (let i = 0; i <= INTELLIGENCE_CATEGORIES.length; i++) {
        setCurrentIndex(i);
        setProgress(Math.round((i / INTELLIGENCE_CATEGORIES.length) * 100));
        await new Promise(r => setTimeout(r, 400));
      }
      
      // Small delay to ensure data is stored
      await new Promise(r => setTimeout(r, 500));
      
      router.push('/assess/validate');
    } catch (error) {
      console.error('Error fetching intelligence:', error);
      router.push('/assess/validate');
    }
  };

  return (
    <div id="s-collect">
      {/* Navigation */}
      <nav id="nav">
        <div className="nav-logo">
          AI <em>Compass</em>
        </div>
      </nav>

      {/* Progress Bar */}
      <div id="prog-strip">
        <div id="prog-fill" style={{ width: '25%' }} />
      </div>

      {/* Background Orbs */}
      <div className="orb o1" />
      <div className="orb o2" />

      <div className="collect-wrap">
        {/* Left Column */}
        <div>
          <div className="coll-live">
            <div className="live-pip" />
            <span className="live-lbl">Researching your context</span>
          </div>

          <div className="coll-bignum">{currentIndex}</div>
          <div className="coll-sub">of {INTELLIGENCE_CATEGORIES.length} categories</div>

          {/* Stream Card */}
          <div className="stream-card">
            <div className="stream-cat">{INTELLIGENCE_CATEGORIES[currentIndex] || 'Complete'}</div>
            <div className="stream-body">
              {currentIndex < INTELLIGENCE_CATEGORIES.length ? (
                <>
                  Researching {profile.company}...<span className="stream-cur" />
                </>
              ) : (
                'Research complete!'
              )}
            </div>
          </div>

          <div className="coll-prog-lbl">
            <span>Analysing {profile.company}...</span>
            <span>{progress}%</span>
          </div>
          <div className="coll-prog-bg">
            <div className="coll-prog-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Right Column - Category List */}
        <div className="cl-list">
          <div className="cl-title">Intelligence Categories</div>
          {INTELLIGENCE_CATEGORIES.map((category, index) => (
            <div 
              key={category}
              className={`cl-item ${index < currentIndex ? 'done' : ''} ${index === currentIndex ? 'live' : ''}`}
            >
              <div className="cl-dot" />
              <span className="cl-name">{category}</span>
              <span className="cl-st">
                {index < currentIndex ? 'Done' : index === currentIndex ? 'Live' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
