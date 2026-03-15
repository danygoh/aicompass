'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyMagicLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [user, setUser] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No token provided');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/magic/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setError(data.error || 'Invalid link');
        } else {
          setStatus('success');
          setUser(data.user);
          setAssessment(data.assessment);
        }
      } catch (err) {
        setStatus('error');
        setError('Failed to verify link');
      }
    };

    verifyToken();
  }, [token]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
      }}>
        <div style={{
          color: '#fff',
          fontSize: '18px',
        }}>
          Verifying your link...
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        padding: '20px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            ❌
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#000',
          }}>
            Link Invalid or Expired
          </h1>
          <p style={{
            color: '#666',
            marginBottom: '32px',
          }}>
            {error || 'This magic link may have expired or already been used.'}
          </p>
          <a
            href="/auth/magic"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            Request New Link
          </a>
        </div>
      </div>
    );
  }

  // Success - redirect to report or show assessment
  if (status === 'success' && assessment) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        padding: '20px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            ✅
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#000',
          }}>
            Welcome back!
          </h1>
          <p style={{
            color: '#666',
            marginBottom: '24px',
          }}>
            Signed in as {user.email}
          </p>
          
          <div style={{
            background: '#f5f5f5',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '4px',
            }}>
              Your Latest Assessment
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#000',
            }}>
              {assessment.totalScore || '--'}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#666',
            }}>
              {assessment.tier || 'Free'} Plan
            </div>
          </div>

          <a
            href={`/assess/report?id=${assessment.id}`}
            style={{
              display: 'block',
              padding: '16px',
              background: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            View Full Report
          </a>
          
          <a
            href="/"
            style={{
              color: '#666',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Success but no assessment
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#000',
        }}>
          No Assessment Found
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '32px',
        }}>
          We couldn&apos;t find an assessment for {user.email}. Complete an assessment first to see your report.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
          }}
        >
          Start Assessment
        </a>
      </div>
    </div>
  );
}
