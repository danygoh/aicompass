'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div id="s-admin-login" className="screen active">
      <div className="al-outer">
        <div className="al-wrap">
          <div className="al-brand">AI <em>Compass</em> 🧭</div>
          <div className="al-sub">Admin Portal · AI Native Foundation</div>
          
          <div className="al-card">
            <div className="al-title">Sign in</div>
            <div className="al-hint">Access your organisation's dashboard</div>
            
            {error && (
              <div className="al-err">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="fg" style={{ marginTop: 0 }}>
                <div className="fg">
                  <label className="fl">Email</label>
                  <input 
                    className="fi" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@compass.ai"
                  />
                </div>
                <div className="fg">
                  <label className="fl">Password</label>
                  <input 
                    className="fi" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-begin-hero" 
                  style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </div>
            </form>
          </div>
          
          <button className="al-back" onClick={() => router.push('/')}>← Back to platform</button>
        </div>
      </div>

      <style jsx>{`
        .al-outer {
          min-height: 100vh;
          background: var(--navy);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .al-wrap {
          width: 100%;
          max-width: 380px;
          text-align: center;
        }
        .al-brand {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          color: #fff;
          margin-bottom: 8px;
        }
        .al-brand em {
          font-style: normal;
          color: var(--gold);
        }
        .al-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 32px;
        }
        .al-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 28px;
          text-align: left;
        }
        .al-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          color: #fff;
          margin-bottom: 4px;
        }
        .al-hint {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
        }
        .al-err {
          background: rgba(255,100,100,0.15);
          color: #ff6b6b;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 16px;
          text-align: center;
        }
        .fg {
          margin-bottom: 14px;
        }
        .fl {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .fi {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
        }
        .fi:focus {
          outline: none;
          border-color: var(--teal);
          background: rgba(255,255,255,0.08);
        }
        .al-demo-creds {
          margin-top: 16px;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
        }
        .al-back {
          margin-top: 20px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .al-back:hover {
          color: #fff;
        }
      `}</style>
    </div>
  );
}
