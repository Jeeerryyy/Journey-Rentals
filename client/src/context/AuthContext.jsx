import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api.js'

/**
 * AuthContext — cookie-based authentication state manager.
 * JWT is stored in httpOnly cookies — frontend never sees or stores the token.
 * We call GET /api/auth/me on mount to check if the user is authenticated.
 */
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null)
  const [owner, setOwner]       = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // ── On mount, check if we have an active session via httpOnly cookie ──
  useEffect(() => {
    const checkSession = async () => {
      // Handle OAuth redirect: if URL has ?oauth=success&user=... extract display data
      const params = new URLSearchParams(window.location.search)
      if (params.get('oauth') === 'success') {
        try {
          const user = JSON.parse(decodeURIComponent(params.get('user')))
          setCustomer(user)
          // Clean the URL
          window.history.replaceState({}, '', window.location.pathname)
          setIsLoaded(true)
          return
        } catch { /* fall through to /me check */ }
      }

      // Try to restore customer session from cookie
      try {
        const data = await api.auth.me()
        if (data.success && data.user) {
          setCustomer(data.user)
        }
      } catch {
        // No active session (401) — that's fine
      }

      // Try to restore owner session from cookie
      // The owner cookie is separate (jr_token_owner)
      // We don't have a /me endpoint for owner — use localStorage for owner display data only
      try {
        const storedOwner = localStorage.getItem('jr_owner')
        if (storedOwner) {
          setOwner(JSON.parse(storedOwner))
        }
      } catch { /* ignore */ }

      setIsLoaded(true)
    }

    checkSession()
  }, [])

  // ── Customer login ──
  const customerLogin = useCallback(async (email, password) => {
    try {
      const data = await api.auth.login({ email, password })
      if (data.needsVerification) {
        return { success: false, needsVerification: true, email: data.email, error: data.error }
      }
      if (data.success && data.user) {
        setCustomer(data.user)
      }
      return { success: data.success, user: data.user }
    } catch (err) {
      // Check if the error response has needsVerification flag
      if (err.data?.needsVerification) {
        return { success: false, needsVerification: true, email: err.data.email, error: err.data.error }
      }
      return { success: false, error: err.message }
    }
  }, [])

  // ── Customer signup — returns email for OTP flow ──
  const customerSignup = useCallback(async (name, email, password, phone) => {
    try {
      const data = await api.auth.signup({ name, email, password, phone })
      // Signup no longer returns a token — returns email for OTP verification
      return {
        success: true,
        needsVerification: true,
        email: data.email,
        message: data.message,
      }
    } catch (err) {
      return { success: false, error: err.message, passwordErrors: err.data?.passwordErrors }
    }
  }, [])

  // ── Verify OTP — completes registration, sets cookie, returns user ──
  const verifyOtp = useCallback(async (email, otp) => {
    try {
      const data = await api.auth.verifyOtp({ email, otp })
      if (data.success && data.user) {
        setCustomer(data.user)
      }
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // ── Resend OTP ──
  const resendOtp = useCallback(async (email) => {
    try {
      const data = await api.auth.resendOtp({ email })
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // ── Customer data update (display only — e.g. after profile edit) ──
  const setCustomerData = useCallback((newData) => {
    setCustomer(newData)
  }, [])

  // ── Customer logout ──
  const customerLogout = useCallback(async () => {
    try { await api.auth.logout() } catch { /* ignore */ }
    setCustomer(null)
  }, [])

  // ── Owner login ──
  const ownerLogin = useCallback(async (email, password) => {
    try {
      const data = await api.auth.ownerLogin({ email, password })
      if (data.success) {
        setOwner(data.owner)
        // Store owner display data in localStorage (not the token — that's in httpOnly cookie)
        localStorage.setItem('jr_owner', JSON.stringify(data.owner))
      }
      return { success: data.success }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // ── Owner logout ──
  const ownerLogout = useCallback(async () => {
    try { await api.auth.ownerLogout() } catch { /* ignore */ }
    setOwner(null)
    localStorage.removeItem('jr_owner')
  }, [])

  return (
    <AuthContext.Provider value={{
      customer, owner, isLoaded,
      customerLogin, customerSignup, customerLogout, setCustomerData,
      ownerLogin, ownerLogout,
      verifyOtp, resendOtp,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)