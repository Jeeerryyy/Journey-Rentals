import { Router } from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { body, validationResult } from 'express-validator'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import { requireAuth, signToken, signRefreshToken, setTokenCookie } from '../middleware/auth.js'
import {
  signup, verifyOtp, resendOtp, login, refreshToken, logout, getMe,
  updateAvatar, updateProfile, deleteProfile, ownerLogin, ownerLogout,
  initiateGoogleAuth
} from '../controllers/auth.controller.js'

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg })
  }
  next()
}

const router = Router()

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'))
  }
})

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, skipSuccessfulRequests: true })
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 })
const resendOtpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3 })

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const FRONTEND_URL         = process.env.FRONTEND_URL || 'http://localhost:5173'
const BACKEND_URL          = process.env.BACKEND_URL  || 'http://localhost:5000'

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL:  `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshTkn, profile, done) => {
      try {
        await connectDB()
        const email = profile.emails?.[0]?.value?.toLowerCase()
        if (!email) return done(new Error('No email from Google'), null)
        let user = await User.findOne({ email })
        if (!user) {
          user = await User.create({
            name:         profile.displayName || profile.name?.givenName || 'Google User',
            email,
            passwordHash: '',
            phone:        '',
            role:         'customer',
            provider:     'google',
            googleId:     profile.id,
            isVerified:   true,
          })
        } else if (!user.googleId) {
          user.googleId = profile.id
          user.provider = user.provider || 'google'
          user.isVerified = true
          await user.save()
        }
        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  ))
  passport.serializeUser((user, done) => done(null, user._id))
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (err) { done(err) }
  })
}

router.post('/signup', authLimiter, [
  body('name').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('email').trim().notEmpty().isLength({ max: 254 }),
  body('password').notEmpty().isLength({ max: 128 }),
  body('phone').optional().trim().escape(),
  validateRequest
], signup)

router.post('/verify-otp', otpLimiter, [
  body('email').trim().notEmpty(),
  body('otp').trim().notEmpty().isLength({ min: 6, max: 6 }).escape(),
  validateRequest
], verifyOtp)

router.post('/resend-otp', resendOtpLimiter, [
  body('email').trim().notEmpty(),
  validateRequest
], resendOtp)

router.post('/login', authLimiter, [
  body('email').trim().notEmpty(),
  body('password').notEmpty(),
  validateRequest
], login)

router.post('/refresh', refreshToken)
router.post('/logout', logout)

router.post('/owner-login', authLimiter, [
  body('email').trim().notEmpty(),
  body('password').notEmpty(),
  validateRequest
], ownerLogin)

router.post('/owner-logout', ownerLogout)

router.get('/me', requireAuth, getMe)
router.put('/profile/avatar', requireAuth, upload.single('avatar'), updateAvatar)

router.put('/profile', requireAuth, [
  body('name').optional().trim().isLength({ max: 100 }),
  body('email').optional().trim().isLength({ max: 254 }),
  validateRequest
], updateProfile)

router.delete('/profile', requireAuth, deleteProfile)

router.get('/google', initiateGoogleAuth)

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }, async (err, user) => {
    if (err || !user) return res.redirect(`${FRONTEND_URL}/login?error=google_failed`)
    try {
      const token = signToken({ userId: user._id, email: user.email, role: user.role })
      setTokenCookie(res, 'jr_token', token)
      const { token: rfToken } = signRefreshToken({ userId: user._id, email: user.email, role: user.role })
      setTokenCookie(res, 'jr_refresh', rfToken)

      const userPayload = encodeURIComponent(JSON.stringify({
        id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatarUrl: user.avatarUrl || '',
      }))
      res.redirect(`${FRONTEND_URL}/login?oauth=success&user=${userPayload}`)
    } catch {
      res.redirect(`${FRONTEND_URL}/login?error=token_failed`)
    }
  })(req, res, next)
})

export default router
