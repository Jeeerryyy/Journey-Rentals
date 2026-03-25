import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EyeIcon = ({ open }) => open
  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const Login = () => {
  const [tab, setTab]           = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { customerLogin, customerSignup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  // Map URL errors to friendly messages
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errObj = params.get('error')
    if (errObj === 'google_failed') setError('Google login failed. Please ensure your backend server is restarted and Google Console configuration is correct.')
    else if (errObj === 'google_not_configured') setError('Google login is not configured correctly on the server.')
    else if (errObj === 'token_failed') setError('Failed to generate user token.')
  }, [location.search])

  const reset = () => { setError(''); setEmail(''); setPassword(''); setName(''); setPhone('') }

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = async () => {
    setError('')

    if (tab === 'login') {
      if (!email || !password) { setError('Please enter your email and password.'); return }
      if (!validateEmail(email)) { setError('Please enter a valid email address.'); return }
      setLoading(true)
      const result = await customerLogin(email, password)
      setLoading(false)
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.error || 'Invalid email or password.')
      }
      return
    }

    if (tab === 'signup') {
      if (!name.trim() || !email || !password) { setError('Please fill in all required fields.'); return }
      if (!validateEmail(email)) { setError('Please enter a valid email address.'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
      setLoading(true)
      const result = await customerSignup(name.trim(), email, password, phone)
      setLoading(false)
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.error || 'Failed to create account. Please try again.')
      }
      return
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh; background: var(--bg);
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px; padding-top: 88px;
        }
        .login-wrap { width: 100%; max-width: 420px; }

        .login-brand { text-align: center; margin-bottom: 32px; }
        .login-brand__logo { font-family: var(--font-display); font-size: 32px; letter-spacing: 0.04em; color: var(--text); }
        .login-brand__logo span { color: var(--accent); }
        .login-brand__sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; }

        .login-tabs { display: flex; border: 1px solid var(--border); margin-bottom: 0; }
        .login-tab { flex: 1; padding: 13px; text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); cursor: pointer; background: var(--bg-soft); transition: all 0.15s; border: none; }
        .login-tab.active { background: var(--accent); color: #0c0c0c; }
        .login-tab:hover:not(.active) { color: var(--text); }

        .login-card { background: var(--bg-card); border: 1px solid var(--border); border-top: none; padding: 28px; }

        .login-field { margin-bottom: 16px; }
        .login-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 7px; }
        .login-input-wrap { position: relative; }
        .login-input { width: 100%; padding: 12px 14px; background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .login-input:focus { border-color: rgba(255,210,0,0.5); }
        .login-input.error { border-color: rgba(239,68,68,0.5); }
        .login-input-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; }

        .login-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; font-size: 13px; padding: 10px 14px; margin-bottom: 16px; }

        .login-btn { width: 100%; padding: 15px; background: var(--accent); color: #0c0c0c; font-family: var(--font-body); font-weight: 800; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; border: none; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: background 0.2s; margin-top: 4px; }
        .login-btn:hover:not(:disabled) { background: #ffe44d; }
        .login-btn:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; clip-path: none; }

        .login-google-btn { width: 100%; padding: 13px; background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); font-family: var(--font-body); font-weight: 700; font-size: 13px; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .login-google-btn:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }

        .login-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #0c0c0c; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-divider { position: relative; height: 1px; background: var(--border); margin: 20px 0; }
        .login-divider span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-card); padding: 0 12px; font-size: 11px; color: var(--text-muted); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; }
        .login-footer { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 16px; }
        .login-footer a { color: var(--accent); font-weight: 700; text-decoration: none; }
      `}</style>

      <div className="login-page">
        <div className="login-wrap">

          <div className="login-brand">
            <div className="login-brand__logo">JOURNEY<span>RENTALS</span></div>
            <div className="login-brand__sub">Customer Portal · Solapur</div>
          </div>

          <div className="login-tabs">
            <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); reset() }}>Login</button>
            <button className={`login-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); reset() }}>Sign Up</button>
          </div>

          <div className="login-card">
            {error && <div className="login-error">⚠ {error}</div>}

            {tab === 'signup' && (
              <>
                <div className="login-field">
                  <label className="login-label">Full Name *</label>
                  <input id="signup-name" className="login-input" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="login-field">
                  <label className="login-label">Phone Number</label>
                  <input id="signup-phone" className="login-input" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </>
            )}

            <div className="login-field">
              <label className="login-label">Email Address *</label>
              <input
                id="login-email"
                className={`login-input ${error && !email ? 'error' : ''}`}
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="login-field">
              <label className="login-label">Password *</label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  className={`login-input ${error && !password ? 'error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder={tab === 'signup' ? 'Min 6 characters' : 'Enter password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ paddingRight: '40px' }}
                />
                <button className="login-input-eye" onClick={() => setShowPass(v => !v)} type="button">
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            <button id="login-submit-btn" className="login-btn" disabled={loading} onClick={handleSubmit}>
              {loading
                ? <><span className="login-spinner" />{tab === 'login' ? 'Signing in...' : 'Creating account...'}</>
                : tab === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>

            <div className="login-divider"><span>or continue with</span></div>

            <button id="google-login-btn" className="login-google-btn" onClick={handleGoogleLogin} type="button">
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="login-footer">
              {tab === 'login'
                ? <>New here? <a href="#" onClick={e => { e.preventDefault(); setTab('signup'); reset() }}>Create an account</a></>
                : <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setTab('login'); reset() }}>Sign in</a></>
              }
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/" id="back-home-link" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}

export default Login