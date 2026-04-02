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
import { trackError, trackSecurityEvent, requestLogger } from './middleware/errorTracker.js'

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

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@journeyrentals.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

import authRoutes    from './routes/auth.js'
import vehicleRoutes from './routes/vehicles.js'
import bookingRoutes from './routes/bookings.js'
import uploadRoutes  from './routes/upload.js'
import ownerRoutes   from './routes/owner.js'
import notificationsRoutes from './routes/notifications.js'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)

app.use((req, res, next) => {
  req.id = crypto.randomUUID()
  res.setHeader('X-Request-ID', req.id)
  next()
})

app.use(requestLogger)

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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)')
  next()
})

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please slow down.' },
  skip: (req) => req.path === '/healthz' || req.path === '/health',
})
app.use(globalLimiter)

const blockedIPs = new Map()
const ipRequestCounts = new Map()

app.use((req, res, next) => {
  const ip = req.ip
  const blockExpiry = blockedIPs.get(ip)
  if (blockExpiry && blockExpiry > Date.now()) {
    return res.status(429).json({ success: false, error: 'Your IP has been temporarily blocked due to excessive requests.' })
  } else if (blockExpiry) {
    blockedIPs.delete(ip)
  }

  const now = Date.now()
  const windowMs = 5 * 60 * 1000
  let record = ipRequestCounts.get(ip)
  if (!record || (now - record.start) > windowMs) {
    record = { start: now, count: 0 }
  }
  record.count++
  ipRequestCounts.set(ip, record)

  if (record.count > 1000) {
    blockedIPs.set(ip, now + 60 * 60 * 1000)
    console.error(`🚫 IP blocked for excessive requests: ${ip} (${record.count} in 5min)`)
    return res.status(429).json({ success: false, error: 'Your IP has been temporarily blocked due to excessive requests.' })
  }
  next()
})

setInterval(() => {
  const now = Date.now()
  for (const [ip, expiry] of blockedIPs) {
    if (expiry <= now) blockedIPs.delete(ip)
  }
  for (const [ip, record] of ipRequestCounts) {
    if ((now - record.start) > 5 * 60 * 1000) ipRequestCounts.delete(ip)
  }
}, 60 * 1000)

app.use(compression())

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
app.use(cors({
  origin: isProduction ? FRONTEND_URL : [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(cookieParser())

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(504).json({ success: false, error: 'Request took too long — please try again.' })
    }
  })
  next()
})

app.use((req, res, next) => {
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0];
    }
  }
  next();
});

app.use((req, res, next) => {
  if (req.body) {
    const sanitize = mongoSanitize.sanitize
    req.body = sanitize(req.body)
  }
  next()
})

import hpp from 'hpp'
app.use(hpp())

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
// Health Check
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

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /owner\nDisallow: /owner-login\nDisallow: /admin\nDisallow: /healthz\nDisallow: /health\n`)
})

app.use((err, req, res, _next) => {
  const status = err.status || 500
  const requestId = req.id || 'unknown'
  
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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'That endpoint doesn\'t exist. Check the URL and try again.',
    requestId: req.id,
  })
})

export default app
