import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const OwnerLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { ownerLogin } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true)
    try {
      const result = await ownerLogin(email, password)
      if (result.success) {
        navigate('/owner', { replace: true })
      } else {
        setError(result.error || 'Login failed.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .owner-login-page {
          min-height: 100vh; background: #0c0c0c;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          position: relative; overflow: hidden;
        }
        .owner-login-page::before {
          content: 'OWNER';
          position: absolute; bottom: -20px; right: -10px;
          font-family: var(--font-display); font-size: 180px;
          color: rgba(255,255,255,0.02); letter-spacing: 0.04em;
          pointer-events: none; line-height: 1; user-select: none;
        }
        .owner-login-wrap { width: 100%; max-width: 400px; position: relative; z-index: 1; }

        .owner-login-brand { margin-bottom: 32px; }
        .owner-login-brand__eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .owner-login-brand__eyebrow::before { content: ''; width: 24px; height: 1px; background: var(--accent); }
        .owner-login-brand__logo { font-family: var(--font-display); font-size: 36px; letter-spacing: 0.04em; color: #fff; line-height: 1; }
        .owner-login-brand__logo span { color: var(--accent); }
        .owner-login-brand__sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 6px; }

        .owner-login-card { background: #141414; border: 1px solid rgba(255,255,255,0.08); padding: 32px; }
        .owner-login-card__title { font-family: var(--font-display); font-size: 28px; color: #fff; margin-bottom: 24px; letter-spacing: 0.02em; }

        .ol-field { margin-bottom: 18px; }
        .ol-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.4); display: block; margin-bottom: 7px; }
        .ol-input-wrap { position: relative; }
        .ol-input { width: 100%; padding: 13px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #fff; font-family: var(--font-body); font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .ol-input:focus { border-color: rgba(255,210,0,0.5); }
        .ol-input.error { border-color: rgba(239,68,68,0.5); }
        .ol-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.3); padding: 4px; }

        .ol-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; font-size: 13px; padding: 10px 14px; margin-bottom: 18px; }

        .ol-btn { width: 100%; padding: 16px; background: #FFD200; color: #0c0c0c; font-family: var(--font-body); font-weight: 800; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; border: none; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: background 0.2s; margin-top: 8px; }
        .ol-btn:hover:not(:disabled) { background: #ffe44d; }
        .ol-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); cursor: not-allowed; clip-path: none; }

        .ol-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #0c0c0c; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ol-back { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.3); text-decoration: none; margin-top: 20px; transition: color 0.2s; }
        .ol-back:hover { color: rgba(255,255,255,0.6); }

        .ol-security { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 11px; color: rgba(255,255,255,0.25); }
        .ol-security svg { color: rgba(255,210,0,0.4); flex-shrink: 0; }
      `}</style>

      <div className="owner-login-page">
        <div className="owner-login-wrap">

          <div className="owner-login-brand">
            <div className="owner-login-brand__eyebrow">Owner Access</div>
            <div className="owner-login-brand__logo">JOURNEY<span>RENTALS</span></div>
            <div className="owner-login-brand__sub">Restricted area — authorized personnel only</div>
          </div>

          <div className="owner-login-card">
            <div className="owner-login-card__title">Owner Sign In</div>

            {error && <div className="ol-error">{error}</div>}

            <div className="ol-field">
              <label className="ol-label">Owner Email</label>
              <input className={`ol-input ${error && !email ? 'error' : ''}`} type="email" placeholder="owner@journeyrentals.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>

            <div className="ol-field">
              <label className="ol-label">Password</label>
              <div className="ol-input-wrap">
                <input className={`ol-input ${error && !password ? 'error' : ''}`} type={showPass ? 'text' : 'password'}
                  placeholder="Enter owner password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ paddingRight: '40px' }} />
                <button className="ol-eye" onClick={() => setShowPass(v => !v)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPass
                      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button className="ol-btn" disabled={loading} onClick={handleLogin}>
              {loading ? <><span className="ol-spinner" />Verifying...</> : 'Access Dashboard'}
            </button>

            <div className="ol-security">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              This page is protected. Unauthorized access is prohibited.
            </div>
          </div>

          <Link to="/" className="ol-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
            Back to Site
          </Link>

        </div>
      </div>
    </>
  )
}

export default OwnerLogin