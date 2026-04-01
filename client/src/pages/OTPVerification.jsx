import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const OTPVerification = () => {
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(600) // 10 minutes

  const inputRefs = useRef([])
  const { verifyOtp, resendOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  // If no email, redirect to login
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
    }
  }, [email, navigate])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // digits only

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // only last digit
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Backspace: clear current and move to previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || ''
      }
      setOtp(newOtp)
      const focusIdx = Math.min(pasted.length, 5)
      inputRefs.current[focusIdx]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter all 6 digits.')
      return
    }

    setLoading(true)
    setError('')
    const result = await verifyOtp(email, code)
    setLoading(false)

    if (result.success) {
      setSuccess('Email verified successfully! Redirecting...')
      setTimeout(() => navigate('/', { replace: true }), 1500)
    } else {
      setError(result.error || 'Verification failed. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setSuccess('')
    const result = await resendOtp(email)
    setResendLoading(false)

    if (result.success) {
      setSuccess('A new OTP has been sent to your email.')
      setCountdown(600)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      setError(result.error || 'Failed to resend OTP.')
    }
  }

  if (!email) return null

  return (
    <>
      <style>{`
        .otp-page {
          min-height: 100vh; background: var(--bg);
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
        }
        .otp-wrap { width: 100%; max-width: 440px; }
        .otp-card { background: var(--bg-card); border: 1px solid var(--border); padding: 40px 32px; text-align: center; }
        .otp-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,210,0,0.1); border: 1.5px solid rgba(255,210,0,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 28px; }
        .otp-title { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 8px; letter-spacing: 0.02em; }
        .otp-subtitle { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 32px; }
        .otp-email { color: var(--accent); font-weight: 700; }
        .otp-inputs { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
        .otp-input {
          width: 48px; height: 56px; text-align: center;
          font-family: var(--font-display); font-size: 26px;
          background: var(--bg-soft); border: 1.5px solid var(--border);
          color: var(--text); outline: none; transition: border-color 0.2s;
        }
        .otp-input:focus { border-color: var(--accent); }
        .otp-input.filled { border-color: rgba(255,210,0,0.4); }
        .otp-timer { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
        .otp-timer strong { color: var(--accent); font-family: var(--font-display); font-size: 16px; letter-spacing: 0.05em; }
        .otp-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; font-size: 13px; padding: 10px 14px; margin-bottom: 16px; }
        .otp-success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #22c55e; font-size: 13px; padding: 10px 14px; margin-bottom: 16px; }
        .otp-btn { width: 100%; padding: 15px; background: var(--accent); color: #0c0c0c; font-family: var(--font-body); font-weight: 800; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; border: none; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: background 0.2s; }
        .otp-btn:hover:not(:disabled) { background: #ffe44d; }
        .otp-btn:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; clip-path: none; }
        .otp-resend { font-size: 13px; color: var(--text-muted); margin-top: 20px; }
        .otp-resend button { background: none; border: none; color: var(--accent); font-weight: 700; cursor: pointer; font-size: 13px; padding: 0; text-decoration: underline; }
        .otp-resend button:disabled { color: var(--text-muted); cursor: not-allowed; text-decoration: none; }
        .otp-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #0c0c0c; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="otp-page">
        <div className="otp-wrap">
          <div className="otp-card">
            <div className="otp-icon">📧</div>
            <div className="otp-title">Verify Email</div>
            <p className="otp-subtitle">
              A 6-digit code was sent to <span className="otp-email">{email}</span>. Enter it below to activate your account.
            </p>

            {error && <div className="otp-error">⚠ {error}</div>}
            {success && <div className="otp-success">✓ {success}</div>}

            <div className="otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  className={`otp-input ${digit ? 'filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {countdown > 0 && (
              <div className="otp-timer">
                Code expires in <strong>{formatTime(countdown)}</strong>
              </div>
            )}

            <button
              className="otp-btn"
              onClick={handleVerify}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? <><span className="otp-spinner" />Verifying...</> : 'Verify & Continue'}
            </button>

            <div className="otp-resend">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
              >
                {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              <Link to="/login" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OTPVerification
