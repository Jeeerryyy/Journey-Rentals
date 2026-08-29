import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, formatApiError } from '../lib/api.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [owner, setOwner]       = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading]   = useState(true)

  // ── On mount: Restore sessions from httpOnly cookies ──
  const fetchCurrentUser = useCallback(async () => {
    // 1. Check for OAuth callback params in URL (?oauth=success&user=...)
    const params = new URLSearchParams(window.location.search)
    if (params.get('oauth') === 'success') {
      try {
        const user = JSON.parse(decodeURIComponent(params.get('user')))
        setCustomer(user)
        window.history.replaceState({}, '', window.location.pathname)
        setIsLoaded(true)
        setLoading(false)
        return
      } catch { /* fall through */ }
    }

    // 2. Fetch customer from cookie via /api/auth/me
    try {
      const res = await api.auth.me()
      if (res.success && res.user) {
        setCustomer(res.user)
      } else {
        setCustomer(null)
      }
    } catch {
      setCustomer(null)
    }

    // 3. Restore owner session
    try {
      const storedOwner = localStorage.getItem('jr_owner')
      if (storedOwner) {
        setOwner(JSON.parse(storedOwner))
      }
    } catch {
      setOwner(null)
    }

    setIsLoaded(true)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  // ── Customer Login ──
  const customerLogin = useCallback(async (email, password) => {
    try {
      const data = await api.auth.login({ email, password })
      if (data.needsVerification) {
        return { success: false, needsVerification: true, email: data.email, error: data.error }
      }
      if (data.success && data.user) {
        setCustomer(data.user)
        if (data.token) localStorage.setItem('jr_token', data.token)
      }
      return { success: data.success, user: data.user, ok: true }
    } catch (err) {
      if (err.data?.needsVerification) {
        return { success: false, needsVerification: true, email: err.data.email, error: err.data.error, ok: false }
      }
      return { success: false, error: formatApiError(err), ok: false }
    }
  }, [])

  // ── Customer Signup ──
  const customerSignup = useCallback(async (name, email, password, phone) => {
    try {
      const data = await api.auth.signup({ name, email, password, phone })
      return {
        success: true,
        needsVerification: true,
        email: data.email,
        message: data.message,
        ok: true,
      }
    } catch (err) {
      return {
        success: false,
        error: formatApiError(err),
        passwordErrors: err.data?.passwordErrors,
        ok: false,
      }
    }
  }, [])

  // ── Verify OTP ──
  const verifyOtp = useCallback(async (email, otp) => {
    try {
      const data = await api.auth.verifyOtp({ email, otp })
      if (data.success && data.user) {
        setCustomer(data.user)
        if (data.token) localStorage.setItem('jr_token', data.token)
      }
      return { success: true, user: data.user, ok: true }
    } catch (err) {
      return { success: false, error: formatApiError(err), ok: false }
    }
  }, [])

  // ── Resend OTP ──
  const resendOtp = useCallback(async (email) => {
    try {
      const data = await api.auth.resendOtp({ email })
      return { success: true, message: data.message, ok: true }
    } catch (err) {
      return { success: false, error: formatApiError(err), ok: false }
    }
  }, [])

  // ── Customer Logout ──
  const customerLogout = useCallback(async () => {
    try { await api.auth.logout() } catch { /* ignore */ }
    setCustomer(null)
    localStorage.removeItem('jr_token')
  }, [])

  // ── Update Customer Data in state ──
  const updateUser = useCallback((updatedData) => {
    setCustomer(prev => (prev ? { ...prev, ...updatedData } : prev))
  }, [])

  // ── Owner Login ──
  const ownerLogin = useCallback(async (email, password) => {
    try {
      const data = await api.auth.ownerLogin({ email, password })
      if (data.success) {
        const ownerData = data.owner || { email, role: 'admin', name: 'Owner' }
        setOwner(ownerData)
        localStorage.setItem('jr_owner', JSON.stringify(ownerData))
        if (data.token) localStorage.setItem('jr_token_owner', data.token)
      }
      return { success: data.success, ok: true }
    } catch (err) {
      return { success: false, error: formatApiError(err), ok: false }
    }
  }, [])

  // ── Owner Logout ──
  const ownerLogout = useCallback(async () => {
    try { await api.auth.ownerLogout() } catch { /* ignore */ }
    setOwner(null)
    localStorage.removeItem('jr_owner')
    localStorage.removeItem('jr_token_owner')
  }, [])

  const contextValue = {
    // Website Customer Session (completely independent from CRM owner)
    user: customer,
    customer,
    // CRM Owner Session
    owner,
    isLoaded,
    loading,
    login: customerLogin,
    customerLogin,
    signup: customerSignup,
    customerSignup,
    verifyOtp,
    resendOtp,
    logout: customerLogout,
    customerLogout,
    ownerLogin,
    ownerLogout,
    updateUser,
    setCustomerData: updateUser,
    refreshUser: fetchCurrentUser,
    refreshCustomer: fetchCurrentUser,
  }

  return (
    <AuthCtx.Provider value={contextValue}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthCtx)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
