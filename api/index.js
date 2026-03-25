import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import passport from 'passport'
import { connectDB } from './_lib/mongodb.js'

import authRoutes    from './_routes/auth.js'
import vehicleRoutes from './_routes/vehicles.js'
import bookingRoutes from './_routes/bookings.js'
import uploadRoutes  from './_routes/upload.js'
import ownerRoutes   from './_routes/owner.js'

const app  = express()

// trust proxy is needed for vite and prod load balancers
app.set('trust proxy', 1)

// Security headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc:     ["'self'", "data:", "res.cloudinary.com", "images.unsplash.com", "*.placehold.co", "lh3.googleusercontent.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com"],
      connectSrc: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
}))

// Global rate limiting — 300 requests per 15 mins per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

app.use(globalLimiter)
app.use(compression()) // Gzip all responses
// SECURITY FIX: Allow both the production Vercel URL and local dev origin
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://journeyrentals.vercel.app'
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsing — 10MB limit for base64 image/document uploads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(passport.initialize())

// setup routes
app.use('/api/auth',     authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/upload',   uploadRoutes)
app.use('/api/owner',    ownerRoutes)

// health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Fallback error handler — never leak stack traces or internal errors in production
app.use((err, req, res, next) => {
  const isDev    = process.env.NODE_ENV !== 'production'
  const clientMsg = isDev ? (err.message || 'Internal server error.') : 'An unexpected error occurred.'
  console.error('[server error]', err.message)
  res.status(err.status || 500).json({ error: clientMsg })
})

// Unmatched route handler
app.use((req, res) => {
  res.status(404).json({ error: 'The requested resource was not found.' })
})

// Local development — start the server with app.listen()
// On Vercel, the exported app is handled as a serverless function automatically
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000
  async function start() {
    try {
      await connectDB()
      console.log('✅ Connected to MongoDB')
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
      })
    } catch (err) {
      console.error('❌ Failed to start server:', err.message)
      process.exit(1)
    }
  }
  start()
}

// Export the Express app for Vercel serverless functions
export default app
