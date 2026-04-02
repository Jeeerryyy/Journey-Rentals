import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// ── Secrets audit ──
// JWT_SECRET: Used for signing access + refresh tokens. Must be 256-bit minimum.
// Source: Environment variable (required at startup)
const SECRET = process.env.JWT_SECRET

if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is not set!')
}

if (SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters (256-bit) for production security.')
}

// ── Cookie config ──
const isProduction = process.env.NODE_ENV === 'production'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isProduction,
  sameSite: isProduction ? 'None' : 'Lax',
  path:     '/',
}

// ── Token durations ──
const ACCESS_TOKEN_EXPIRY  = '15m'   // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'    // 7 days
const ACCESS_COOKIE_MAX_AGE  = 15 * 60 * 1000          // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

// ── In-memory store for invalidated refresh tokens ──
// In production, use Redis for multi-instance deployment
const invalidatedRefreshTokens = new Set()

// Cleanup old entries periodically (prevent memory leak)
setInterval(() => {
  invalidatedRefreshTokens.clear()
}, 24 * 60 * 60 * 1000) // Clear every 24 hours

// ── Account lockout tracking ──
// Key: email, Value: { attempts: number, lockedUntil: Date | null }
const loginAttempts = new Map()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Check if an account is locked out. Returns { locked, remainingMs } 
 */
export function checkAccountLockout(email) {
  const key = email.toLowerCase()
  const record = loginAttempts.get(key)
  if (!record) return { locked: false }

  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    const remainingMs = record.lockedUntil - Date.now()
    return { locked: true, remainingMs }
  }

  // Lockout expired — reset
  if (record.lockedUntil && record.lockedUntil <= Date.now()) {
    loginAttempts.delete(key)
  }

  return { locked: false }
}

/**
 * Record a failed login attempt. Returns true if account is now locked.
 */
export function recordFailedLogin(email) {
  const key = email.toLowerCase()
  const record = loginAttempts.get(key) || { attempts: 0, lockedUntil: null }
  record.attempts += 1

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS
    loginAttempts.set(key, record)
    return true
  }

  loginAttempts.set(key, record)
  return false
}

/**
 * Clear login attempts on successful login.
 */
export function clearLoginAttempts(email) {
  loginAttempts.delete(email.toLowerCase())
}

/** Sign an access token (short-lived, 15 minutes). */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

/** Sign a refresh token (long-lived, 7 days). Includes a unique jti for rotation. */
export function signRefreshToken(payload) {
  const jti = crypto.randomUUID()
  return {
    token: jwt.sign({ ...payload, jti, type: 'refresh' }, SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY }),
    jti,
  }
}

/** Verify a JWT — returns payload or throws. */
export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

/** Check if a refresh token has been invalidated (used for rotation). */
export function isRefreshTokenInvalidated(jti) {
  return invalidatedRefreshTokens.has(jti)
}

/** Invalidate a refresh token (after rotation). */
export function invalidateRefreshToken(jti) {
  invalidatedRefreshTokens.add(jti)
}

/** Set JWT as an httpOnly cookie on the response. */
export function setTokenCookie(res, cookieName, token) {
  const maxAge = cookieName.includes('refresh') ? REFRESH_COOKIE_MAX_AGE : ACCESS_COOKIE_MAX_AGE
  res.cookie(cookieName, token, { ...COOKIE_OPTIONS, maxAge })
}

/** Clear a token cookie. */
export function clearTokenCookie(res, cookieName) {
  res.clearCookie(cookieName, { ...COOKIE_OPTIONS, maxAge: 0 })
}

/** Extract token from cookie or Authorization header (fallback). */
function getToken(req, cookieName) {
  if (req.cookies?.[cookieName]) {
    return req.cookies[cookieName]
  }
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}

/**
 * requireAuth — protect any route that needs customer login.
 * Reads JWT from httpOnly cookie 'jr_token', falls back to Authorization header.
 */
export function requireAuth(req, res, next) {
  const token = getToken(req, 'jr_token')
  if (!token) {
    return res.status(401).json({ success: false, error: 'Login required.' })
  }
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired. Please login again.' })
  }
}

/**
 * requireOwner — protect owner-only routes.
 * Reads JWT from httpOnly cookie 'jr_token_owner', falls back to Authorization header.
 */
export function requireOwner(req, res, next) {
  const token = getToken(req, 'jr_token_owner')
  if (!token) {
    return res.status(401).json({ success: false, error: 'Login required.' })
  }
  try {
    req.user = verifyToken(token)
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Owner access only.' })
    }
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired. Please login again.' })
  }
}

/**
 * requireAdmin — protect admin-only routes.
 * Checks for role 'admin' or 'owner' in the JWT payload.
 */
export function requireAdmin(req, res, next) {
  const token = getToken(req, 'jr_token_owner') || getToken(req, 'jr_token')
  if (!token) {
    return res.status(401).json({ success: false, error: 'Login required.' })
  }
  try {
    req.user = verifyToken(token)
    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Admin access only.' })
    }
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired. Please login again.' })
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks on credentials.
 */
export function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) {
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a))
    return false
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
