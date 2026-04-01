/**
 * ── Journey Rentals API Server ──
 * 
 * Secrets Audit:
 * ┌────────────────────┬───────────────────────────────────────┐
 * │ Category           │ Source                                │
 * ├────────────────────┼───────────────────────────────────────┤
 * │ Database           │ MONGODB_URI (env)                     │
 * │ Auth signing       │ JWT_SECRET (env, min 256-bit)         │
 * │ Cloud storage      │ CLOUDINARY_* (env)                    │
 * │ Payments           │ RAZORPAY_KEY_ID/SECRET (env)          │
 * │ Google OAuth       │ GOOGLE_CLIENT_ID/SECRET (env)         │
 * │ Email (SMTP)       │ GMAIL_USER/APP_PASSWORD (env)         │
 * │ Owner dashboard    │ OWNER_EMAIL/PASSWORD (env)            │
 * │ Push notifications │ VAPID_PUBLIC/PRIVATE_KEY (env)        │
 * │ WhatsApp API       │ WHATSAPP_TOKEN/PHONE_NUMBER_ID (env)  │
 * └────────────────────┴───────────────────────────────────────┘
 * All secrets are loaded from environment variables only.
 * Never commit .env files. Use .env.example as reference.
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import passport from 'passport'
import mongoSanitize from 'express-mongo-sanitize'
import cookieParser from 'cookie-parser'
import crypto from 'crypto'
import webpush from 'web-push'
import { connectDB } from './_lib/mongodb.js'
import { trackError, trackSecurityEvent, requestLogger } from './_lib/errorTracker.js'

// ══════════════════════════════════════════════════════════════
// Required Environment Validation — crash early with clear errors
// ══════════════════════════════════════════════════════════════
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET']
const missing = REQUIRED_ENV.filter(key => !process.env[key])
if (missing.length > 0) {
  console.error(`\n🔴 Missing required environment variables:\n   ${missing.join('\n   ')}\n\n   Copy api/.env.example to api/.env and fill in the values.\n`)
  process.exit(1)
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('🔴 JWT_SECRET must be at least 32 characters for production security.')
  process.exit(1)
}

// ── Web Push setup ──
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@journeyrentals.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

import authRoutes    from './_routes/auth.js'
import vehicleRoutes from './_routes/vehicles.js'
import bookingRoutes from './_routes/bookings.js'
import uploadRoutes  from './_routes/upload.js'
import ownerRoutes   from './_routes/owner.js'
import notificationsRoutes from './_routes/notifications.js'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

// ── Trust proxy (Render / Vercel load balancers) ──
app.set('trust proxy', 1)

// ══════════════════════════════════════════════════════════════
// Request ID Middleware — unique ID per request for tracing
// ══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  req.id = crypto.randomUUID()
  res.setHeader('X-Request-ID', req.id)
  next()
})

// ── Request logging ──
app.use(requestLogger)

// ══════════════════════════════════════════════════════════════
// Security Headers via Helmet
// ══════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc:     ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com", "https://*.placehold.co", "https://lh3.googleusercontent.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
      frameSrc:   ["'self'", "https://api.razorpay.com"],
      objectSrc:  ["'none'"],
      baseUri:    ["'self'"],
      formAction: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  // HSTS — force HTTPS for 1 year including subdomains
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Disable X-Powered-By
  hidePoweredBy: true,
  // Prevent MIME sniffing
  noSniff: true,
  // Strict referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))

// Add Permissions-Policy header (not built into Helmet)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)')
  next()
})

// ══════════════════════════════════════════════════════════════
// Global Rate Limiting — 100 requests per IP per minute
// ══════════════════════════════════════════════════════════════
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 100,                   // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please slow down.' },
  skip: (req) => req.path === '/healthz' || req.path === '/health',
})
app.use(globalLimiter)

// ── IP-based auto-block: 1000 requests in 5 minutes → blocked for 1 hour ──
const blockedIPs = new Map()
const ipRequestCounts = new Map()

app.use((req, res, next) => {
  const ip = req.ip

  // Check if IP is currently blocked
  const blockExpiry = blockedIPs.get(ip)
  if (blockExpiry && blockExpiry > Date.now()) {
    return res.status(429).json({
      success: false,
      error: 'Your IP has been temporarily blocked due to excessive requests.',
    })
  } else if (blockExpiry) {
    blockedIPs.delete(ip)
  }

  // Track requests
  const now = Date.now()
  const windowMs = 5 * 60 * 1000 // 5 minutes
  let record = ipRequestCounts.get(ip)
  if (!record || (now - record.start) > windowMs) {
    record = { start: now, count: 0 }
  }
  record.count++
  ipRequestCounts.set(ip, record)

  if (record.count > 1000) {
    blockedIPs.set(ip, now + 60 * 60 * 1000) // Block for 1 hour
    console.error(`🚫 IP blocked for excessive requests: ${ip} (${record.count} in 5min)`)
    return res.status(429).json({
      success: false,
      error: 'Your IP has been temporarily blocked due to excessive requests.',
    })
  }

  next()
})

// Cleanup blocked IPs periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, expiry] of blockedIPs) {
    if (expiry <= now) blockedIPs.delete(ip)
  }
  for (const [ip, record] of ipRequestCounts) {
    if ((now - record.start) > 5 * 60 * 1000) ipRequestCounts.delete(ip)
  }
}, 60 * 1000)

// ── Compression ──
app.use(compression())

// ── CORS — strict origin ──
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(cors({
  origin: isProduction ? FRONTEND_URL : [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Cookie parser (for httpOnly JWT cookies) ──
app.use(cookieParser())

// ── Body parsing — 10MB limit (reduced from 50MB) ──
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Request timeout — 30 second max ──
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(504).json({ success: false, error: 'Request took too long — please try again.' })
    }
  })
  next()
})

// ── Query parameter normalization ──
app.use((req, res, next) => {
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0];
    }
  }
  next();
});

// ── NoSQL injection protection ──
app.use((req, res, next) => {
  if (req.body) {
    const sanitize = mongoSanitize.sanitize
    req.body = sanitize(req.body)
  }
  next()
})

// ── Passport ──
app.use(passport.initialize())

// ══════════════════════════════════════════════════════════════
// Routes
// ══════════════════════════════════════════════════════════════
app.use('/api/auth',          authRoutes)
app.use('/api/vehicles',      vehicleRoutes)
app.use('/api/bookings',      bookingRoutes)
app.use('/api/upload',        uploadRoutes)
app.use('/api/owner',         ownerRoutes)
app.use('/api/notifications', notificationsRoutes)

// ══════════════════════════════════════════════════════════════
// Health Check — unauthenticated, excluded from rate limiting
// ══════════════════════════════════════════════════════════════
app.get('/healthz', async (req, res) => {
  const { default: mongoose } = await import('mongoose')
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  
  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ══════════════════════════════════════════════════════════════
// robots.txt — block crawlers from sensitive routes
// ══════════════════════════════════════════════════════════════
app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /owner
Disallow: /owner-login
Disallow: /admin
Disallow: /healthz
Disallow: /health
`)
})

// ══════════════════════════════════════════════════════════════
// Centralized Error Handler — never leak internals
// ══════════════════════════════════════════════════════════════
app.use((err, req, res, _next) => {
  const status = err.status || 500
  const requestId = req.id || 'unknown'
  
  // Structured error logging
  const logEntry = {
    level: status >= 500 ? 'error' : 'warn',
    message: err.message,
    status,
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.userId || null,
    timestamp: new Date().toISOString(),
  }
  
  if (status >= 500) {
    console.error(JSON.stringify(logEntry))
  }

  const clientMessage = isProduction
    ? 'Something went wrong on our end. Please try again.'
    : err.message || 'Internal server error.'
  
  res.status(status).json({
    success: false,
    error: clientMessage,
    requestId,
  })
})

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'That endpoint doesn\'t exist. Check the URL and try again.',
    requestId: req.id,
  })
})

// ══════════════════════════════════════════════════════════════
// Process handlers & Graceful Shutdown
// ══════════════════════════════════════════════════════════════
process.on('unhandledRejection', (reason) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Unhandled Promise Rejection',
    reason: reason?.message || String(reason),
    timestamp: new Date().toISOString(),
  }))
})

process.on('uncaughtException', (err) => {
  console.error(JSON.stringify({
    level: 'fatal',
    message: 'Uncaught Exception',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  }))
  setTimeout(() => process.exit(1), 1000)
})

// ── Start server ──
const PORT = process.env.PORT || 5000
let server

async function start() {
  try {
    await connectDB()
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(JSON.stringify({
        level: 'info',
        message: `Server running on port ${PORT}`,
        env: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      }))
    })

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(JSON.stringify({
        level: 'info',
        message: `${signal} received — shutting down gracefully`,
        timestamp: new Date().toISOString(),
      }))
      
      server.close(async () => {
        try {
          const { default: mongoose } = await import('mongoose')
          await mongoose.connection.close()
        } catch { /* ignore */ }
        process.exit(0)
      })

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (err) {
    console.error(JSON.stringify({
      level: 'fatal',
      message: 'Failed to start server',
      error: err.message,
      timestamp: new Date().toISOString(),
    }))
    process.exit(1)
  }
}

start()

export default app
