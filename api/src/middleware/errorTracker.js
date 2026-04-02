/**
 * errorTracker.js — Centralized error tracking and structured logging.
 * 
 * In production, replace console-based tracking with Sentry:
 *   npm install @sentry/node
 *   import * as Sentry from '@sentry/node'
 *   Sentry.init({ dsn: process.env.SENTRY_DSN })
 * 
 * For now, all errors are logged in structured JSON format
 * ready for ingestion by any log aggregation service
 * (Datadog, Loki, CloudWatch, Better Stack).
 */

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Track an error with structured context.
 * @param {Error} error - The error object
 * @param {Object} context - Additional context (userId, endpoint, action, etc.)
 */
export function trackError(error, context = {}) {
  const entry = {
    level: 'error',
    message: error.message || 'Unknown error',
    stack: isProduction ? undefined : error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  }

  console.error(JSON.stringify(entry))

  // Future: Sentry.captureException(error, { extra: context })
}

/**
 * Track a business event (user signup, booking created, payment completed, etc.)
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function trackEvent(event, data = {}) {
  const entry = {
    level: 'info',
    event,
    ...data,
    timestamp: new Date().toISOString(),
  }

  console.log(JSON.stringify(entry))

  // Future: PostHog/Mixpanel tracking
  // posthog.capture({ distinctId: data.userId, event, properties: data })
}

/**
 * Track a security event (auth failure, rate limit hit, suspicious activity).
 * @param {string} event - Security event type
 * @param {Object} data - Event details
 */
export function trackSecurityEvent(event, data = {}) {
  const entry = {
    level: 'warn',
    category: 'security',
    event,
    ...data,
    timestamp: new Date().toISOString(),
  }

  console.warn(JSON.stringify(entry))
}

/**
 * Express middleware for request logging.
 * Logs method, path, status, duration, and user context.
 */
export function requestLogger(req, res, next) {
  const start = Date.now()

  // Hook into response finish event
  res.on('finish', () => {
    const duration = Date.now() - start
    const entry = {
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      type: 'request',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      requestId: req.id,
      userId: req.user?.userId || null,
      userAgent: req.get('user-agent')?.slice(0, 100),
      timestamp: new Date().toISOString(),
    }

    // Skip logging health checks in production to reduce noise
    if (isProduction && (req.path === '/healthz' || req.path === '/health')) return

    if (res.statusCode >= 400) {
      console.warn(JSON.stringify(entry))
    }
  })

  next()
}
