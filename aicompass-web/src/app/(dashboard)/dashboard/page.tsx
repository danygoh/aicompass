'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Assessment {
  id: string;
  reportId: string;
  totalScore: number;
  tier: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAssessments();
    }
  }, [session]);

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/user/assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Advanced': return 'var(--green)';
      case 'Progressive': return 'var(--teal)';
      case 'Developing': return 'var(--gold)';
      default: return 'var(--text2)';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text2)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div id="s-dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-nav">
          <div className="dash-logo">AI <em>Compass</em></div>
          <div className="dash-user">
            <span>{session?.user?.email}</span>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="dash-signout">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="dash-container">
        {/* Welcome */}
        <div className="dash-welcome">
          <h1>Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}</h1>
          <p>Manage your AI readiness assessments</p>
        </div>

        {/* Actions */}
        <div className="dash-actions">
          <button onClick={() => router.push('/assess/profile')} className="dash-btn-primary">
            <span className="dash-btn-icon">+</span>
            Start New Assessment
          </button>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-value">{assessments.length}</div>
            <div className="dash-stat-label">Total Assessments</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">
              {assessments.filter(a => a.status === 'COMPLETED').length}
            </div>
            <div className="dash-stat-label">Completed</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">
              {assessments.length > 0 
                ? Math.round(assessments.reduce((sum, a) => sum + (a.totalScore || 0), 0) / assessments.length)
                : 0}
            </div>
            <div className="dash-stat-label">Average Score</div>
          </div>
        </div>

        {/* Assessments List */}
        <div className="dash-section">
          <h2>Your Assessments</h2>
          
          {assessments.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">📊</div>
              <h3>No assessments yet</h3>
              <p>Start your first AI readiness assessment to see your results here.</p>
              <button onClick={() => router.push('/assess/profile')} className="dash-btn-outline">
                Begin Assessment
              </button>
            </div>
          ) : (
            <div className="dash-list">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="dash-item">
                  <div className="dash-item-left">
                    <div className="dash-item-score" style={{ background: getTierColor(assessment.tier) }}>
                      {assessment.totalScore}
                    </div>
                    <div className="dash-item-info">
                      <div className="dash-item-id">{assessment.reportId}</div>
                      <div className="dash-item-date">
                        {assessment.completedAt 
                          ? new Date(assessment.completedAt).toLocaleDateString()
                          : new Date(assessment.createdAt).toLocaleDateString()
                        }
                      </div>
                    </div>
                  </div>
                  <div className="dash-item-right">
                    <span className={`dash-item-tier ${assessment.tier?.toLowerCase()}`}>
                      {assessment.tier}
                    </span>
                    <button 
                      onClick={() => router.push(`/assess/report/${assessment.reportId}`)}
                      className="dash-item-view"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dash-header {
          background: var(--navy);
          padding: 0 24px;
        }
        .dash-nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 56px;
        }
        .dash-logo {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          color: #fff;
        }
        .dash-logo em {
          font-style: normal;
          color: var(--gold);
        }
        .dash-user {
          display: flex;
          align-items: center;
          gap: 16px;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
        }
        .dash-signout {
          background: none;
          border: 1px solid rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.7);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }
        .dash-signout:hover {
          background: rgba(255,255,255,0.1);
        }
        .dash-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .dash-welcome {
          margin-bottom: 32px;
        }
        .dash-welcome h1 {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          color: var(--navy);
          margin: 0 0 8px;
        }
        .dash-welcome p {
          color: var(--text2);
          margin: 0;
        }
        .dash-actions {
          margin-bottom: 32px;
        }
        .dash-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .dash-btn-primary:hover {
          background: var(--navy-dark);
        }
        .dash-btn-icon {
          font-size: 18px;
        }
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .dash-stat {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .dash-stat-value {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 600;
          color: var(--navy);
        }
        .dash-stat-label {
          font-size: 12px;
          color: var(--text2);
          margin-top: 4px;
        }
        .dash-section h2 {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          color: var(--navy);
          margin: 0 0 16px;
        }
        .dash-empty {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 48px;
          text-align: center;
        }
        .dash-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .dash-empty h3 {
          font-size: 16px;
          color: var(--navy);
          margin: 0 0 8px;
        }
        .dash-empty p {
          color: var(--text2);
          margin: 0 0 24px;
        }
        .dash-btn-outline {
          padding: 12px 24px;
          background: transparent;
          color: var(--navy);
          border: 1px solid var(--navy);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .dash-btn-outline:hover {
          background: var(--navy);
          color: #fff;
        }
        .dash-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dash-item {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dash-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .dash-item-score {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }
        .dash-item-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--navy);
        }
        .dash-item-date {
          font-size: 12px;
          color: var(--text3);
          margin-top: 2px;
        }
        .dash-item-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dash-item-tier {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          background: var(--bg2);
          color: var(--text2);
        }
        .dash-item-tier.advanced {
          background: var(--green-light);
          color: var(--green);
        }
        .dash-item-tier.progressive {
          background: var(--teal-light);
          color: var(--teal);
        }
        .dash-item-tier.developing {
          background: var(--gold-light);
          color: var(--gold);
        }
        .dash-item-view {
          padding: 8px 16px;
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }
        .dash-item-view:hover {
          background: var(--navy-dark);
        }
      `}</style>
    </div>
  );
}
