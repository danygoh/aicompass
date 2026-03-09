'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="s-auth-login" className="screen active">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* Navigation */}
      <nav id="nav">
        <div className="nav-logo">AI <em>Compass</em></div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px' }}>Home</a>
        </div>
      </nav>

      {/* Form */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-kicker">Welcome back</div>
            <h1 className="auth-title">Sign in to your account</h1>
            <p className="auth-subtitle">Access your AI readiness reports</p>
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-bg {
          position: fixed;
          inset: 0;
          background: var(--navy);
          overflow: hidden;
        }
        .auth-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .auth-orb-1 {
          width: 400px;
          height: 400px;
          background: var(--teal);
          opacity: 0.15;
          top: -100px;
          right: -100px;
        }
        .auth-orb-2 {
          width: 300px;
          height: 300px;
          background: var(--gold);
          opacity: 0.1;
          bottom: -50px;
          left: -50px;
        }
        .auth-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 40px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-kicker {
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--teal);
          margin-bottom: 8px;
        }
        .auth-title {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          color: var(--navy);
          margin: 0 0 8px;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--text2);
          margin: 0;
        }
        .auth-error {
          background: var(--red-light);
          color: var(--red);
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .auth-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text2);
          margin-bottom: 6px;
        }
        .auth-field input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .auth-field input:focus {
          outline: none;
          border-color: var(--teal);
        }
        .auth-submit {
          width: 100%;
          padding: 14px;
          background: var(--navy);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .auth-submit:hover:not(:disabled) {
          background: var(--navy-dark);
        }
        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--text2);
        }
        .auth-footer a {
          color: var(--teal);
          text-decoration: none;
          font-weight: 600;
          margin-left: 4px;
        }
        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
