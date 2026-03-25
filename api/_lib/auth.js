import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is not set!')
}

/** Sign a JWT with the given payload. Expires in 7 days. */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

/** Verify a JWT — returns payload or throws. */
export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

/** Extract Bearer token from Authorization header. */
export function getTokenFromHeader(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  return header.slice(7)
}

/**
 * requireAuth — protect any route that needs customer or owner login.
 * Reads the JWT from the Authorization header and attaches payload to req.user.
 */
export function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req)
  if (!token) {
    return res.status(401).json({ error: 'Login required.' })
  }
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired. Please login again.' })
  }
}

/**
 * requireOwner — protect owner-only routes.
 * Verifies JWT and checks role === 'owner'.
 */
export function requireOwner(req, res, next) {
  const token = getTokenFromHeader(req)
  if (!token) {
    return res.status(401).json({ error: 'Login required.' })
  }
  try {
    req.user = verifyToken(token)
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Owner access only.' })
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired. Please login again.' })
  }
}
