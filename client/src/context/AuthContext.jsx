import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api.js'

/**
 * AuthContext — unified authentication state manager
 * Handles standard customer JWTs and owner JWTs across the application lifecycle.
 * Also handles OAuth redirects via /api/auth/google/callback parsing.
 */
const AuthContext = createContext(null)

// Decode JWT payload without verification (for reading user info client-side)
const decodeJWT = (token) => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

// Check if a JWT is expired
const isTokenExpired = (token) => {
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 > payload.exp
}

export const AuthProvider = ({ children }) => {
  // User state
  const [customer, setCustomer] = useState(() => {
    try {
      const token = localStorage.getItem('jr_token')
      const stored = localStorage.getItem('jr_customer')
      if (token && stored && !isTokenExpired(token)) {
        return JSON.parse(stored)
      }
      // Clean up expired data
      localStorage.removeItem('jr_token')
      localStorage.removeItem('jr_customer')
      return null
    } catch {
      return null
    }
  })

  // Admin state
  const [owner, setOwner] = useState(() => {
    try {
      const token = localStorage.getItem('jr_token_owner')
      const stored = localStorage.getItem('jr_owner')
      if (token && stored && !isTokenExpired(token)) {
        return JSON.parse(stored)
      }
      localStorage.removeItem('jr_token_owner')
      localStorage.removeItem('jr_owner')
      return null
    } catch {
      return null
    }
  })

  // isLoaded is always true since we read from localStorage synchronously
  const isLoaded = true

  // Standard authentication hooks
  const customerLogin = useCallback(async (email, password) => {
    try {
      const data = await api.auth.login({ email, password })
      localStorage.setItem('jr_token', data.token)
      localStorage.setItem('jr_customer', JSON.stringify(data.user))
      setCustomer(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Registration hook
  const customerSignup = useCallback(async (name, email, password, phone) => {
    try {
      const data = await api.auth.signup({ name, email, password, phone })
      localStorage.setItem('jr_token', data.token)
      localStorage.setItem('jr_customer', JSON.stringify(data.user))
      setCustomer(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // ── Customer arbitrary data update ──
  const setCustomerData = useCallback((newData) => {
    setCustomer(newData)
    localStorage.setItem('jr_customer', JSON.stringify(newData))
  }, [])

  // ── Customer logout ──
  const customerLogout = useCallback(() => {
    setCustomer(null)
    localStorage.removeItem('jr_token')
    localStorage.removeItem('jr_customer')
    sessionStorage.clear()
  }, [])

  // ── Owner login ──
  const ownerLogin = useCallback(async (email, password) => {
    try {
      const data = await api.auth.ownerLogin({ email, password })
      localStorage.setItem('jr_token_owner', data.token)
      localStorage.setItem('jr_owner', JSON.stringify(data.owner))
      setOwner(data.owner)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // ── Owner logout ──
  const ownerLogout = useCallback(() => {
    setOwner(null)
    localStorage.removeItem('jr_owner')
    localStorage.removeItem('jr_token_owner')
    sessionStorage.clear()
  }, [])

  // OAuth callback interceptor
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthToken = params.get('token')
    const oauthUser = params.get('user')
    if (oauthToken && oauthUser) {
      try {
        const user = JSON.parse(decodeURIComponent(oauthUser))
        localStorage.setItem('jr_token', oauthToken)
        localStorage.setItem('jr_customer', JSON.stringify(user))
        setCustomer(user)
        // Clean the URL
        window.history.replaceState({}, '', window.location.pathname)
      } catch { /* ignore malformed data */ }
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      customer, owner, isLoaded,
      customerLogin, customerSignup, customerLogout, setCustomerData,
      ownerLogin, ownerLogout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)