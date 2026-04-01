import { Router } from 'express'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { connectDB } from '../_lib/mongodb.js'
import User from '../_lib/models/User.js'
import Booking from '../_lib/models/Booking.js'
import {
  signToken, signRefreshToken, setTokenCookie, clearTokenCookie,
  requireAuth, timingSafeCompare, verifyToken,
  checkAccountLockout, recordFailedLogin, clearLoginAttempts,
  invalidateRefreshToken, isRefreshTokenInvalidated,
} from '../_lib/auth.js'
import { uploadToCloudinary } from '../_lib/cloudinary.js'
import { validateEmail, validatePassword } from '../_lib/validators.js'
import { generateOTP, storeOTP, verifyOTP } from '../_lib/otp.js'
import { sendOTPEmail } from '../_lib/mailer.js'
import { body, validationResult } from 'express-validator'

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg })
  }
  next()
}

const router = Router()

// ── Multer config — strict image-only whitelist ──
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'))
  }
})

// ── Rate limiters ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts — please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
})

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many OTP attempts. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const resendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, error: 'Too many resend requests. Please wait before requesting another OTP.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Google OAuth strategy ──
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
    async (accessToken, refreshToken, profile, done) => {
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

// ══════════════════════════════════════════════════════════════
// POST /api/auth/signup
// ══════════════════════════════════════════════════════════════
router.post('/signup', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }).withMessage('Name is too long.').escape(),
  body('email').trim().notEmpty().withMessage('Email is required.').isLength({ max: 254 }).withMessage('Email is too long.'),
  body('password').notEmpty().withMessage('Password is required.').isLength({ max: 128 }).withMessage('Password is too long.'),
  body('phone').optional().trim().escape(),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const { name, email, password, phone } = req.body

    // ── Email validation (format + disposable) ──
    const emailCheck = await validateEmail(email)
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, error: emailCheck.reason })
    }

    // ── Password strength validation ──
    const passwordErrors = validatePassword(password, name, email)
    if (passwordErrors.length > 0) {
      return res.status(400).json({ success: false, error: passwordErrors[0], passwordErrors })
    }

    // Phone is optional — validate format only if provided
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Enter a valid 10-digit phone number.' })
    }

    let user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      if (user.isVerified) {
        // Anti-enumeration: return same message structure as success
        return res.status(409).json({ success: false, error: 'An account with this email already exists.' })
      }
      
      // Update unverified user's credentials and resend OTP
      const passwordHash = await bcrypt.hash(password, 12)
      user.name = name.trim()
      user.passwordHash = passwordHash
      user.phone = phone || ''
      await user.save()
      
      const otp = generateOTP()
      await storeOTP(user.email, otp)
      await sendOTPEmail(user.email, otp)

      return res.status(201).json({
        success: true,
        message: 'We sent a verification code to your email.',
        email: user.email,
      })
    }

    // New user
    const passwordHash = await bcrypt.hash(password, 12)
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || '',
      role: 'customer',
      provider: 'local',
      isVerified: false, 
    })

    // Generate and send OTP
    const otp = generateOTP()
    await storeOTP(user.email, otp)
    await sendOTPEmail(user.email, otp)

    return res.status(201).json({
      success: true,
      message: 'We sent a verification code to your email.',
      email: user.email,
    })
  } catch (err) {
    console.error('Signup error:', err.message)
    return res.status(500).json({ success: false, error: 'Something went wrong on our end. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/auth/verify-otp
// ══════════════════════════════════════════════════════════════
router.post('/verify-otp', otpLimiter, [
  body('email').trim().notEmpty().withMessage('Email is required.'),
  body('otp').trim().notEmpty().withMessage('OTP is required.').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.').escape(),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const { email, otp } = req.body

    const result = await verifyOTP(email, otp.toString())
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.reason })
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found.' })
    }

    // Issue access token via httpOnly cookie
    const token = signToken({
      userId: user._id,
      email:  user.email,
      role:   user.role,
    })
    setTokenCookie(res, 'jr_token', token)

    // Issue refresh token
    const { token: refreshToken } = signRefreshToken({
      userId: user._id,
      email:  user.email,
      role:   user.role,
    })
    setTokenCookie(res, 'jr_refresh', refreshToken)

    return res.status(200).json({
      success: true,
      message: 'Email verified — welcome aboard!',
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        avatarUrl: user.avatarUrl || '',
      },
    })
  } catch (err) {
    console.error('Verify OTP error:', err.message)
    return res.status(500).json({ success: false, error: 'Verification failed. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/auth/resend-otp
// ══════════════════════════════════════════════════════════════
router.post('/resend-otp', resendOtpLimiter, [
  body('email').trim().notEmpty().withMessage('Email is required.'),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const { email } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Anti-enumeration: same response structure as success
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a new code has been sent.' })
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a new code has been sent.' })
    }

    const otp = generateOTP()
    await storeOTP(user.email, otp)
    await sendOTPEmail(user.email, otp)

    return res.status(200).json({
      success: true,
      message: 'A fresh code is on its way to your inbox.',
    })
  } catch (err) {
    console.error('Resend OTP error:', err.message)
    return res.status(500).json({ success: false, error: 'Couldn\'t resend the code. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════════════
router.post('/login', authLimiter, [
  body('email').trim().notEmpty().withMessage('Email and password are required.'),
  body('password').notEmpty().withMessage('Email and password are required.'),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const { email, password } = req.body

    // ── Account lockout check ──
    const lockout = checkAccountLockout(email)
    if (lockout.locked) {
      const minutesLeft = Math.ceil(lockout.remainingMs / 60000)
      return res.status(429).json({
        success: false,
        error: `Account temporarily locked after too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      recordFailedLogin(email)
      return res.status(401).json({ success: false, error: 'Invalid email or password.' })
    }

    // OAuth users don't have a password
    if (!user.passwordHash) {
      return res.status(400).json({ success: false, error: 'This account uses Google sign-in — tap "Continue with Google" instead.' })
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Verify your email first — check your inbox for the OTP.',
        needsVerification: true,
        email: user.email,
      })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      const isNowLocked = recordFailedLogin(email)
      if (isNowLocked) {
        return res.status(429).json({
          success: false,
          error: 'Too many failed attempts — your account is locked for 15 minutes.',
        })
      }
      return res.status(401).json({ success: false, error: 'Invalid email or password.' })
    }

    // ── Success — clear lockout and issue tokens ──
    clearLoginAttempts(email)

    const tokenPayload = { userId: user._id, email: user.email, role: user.role }

    const token = signToken(tokenPayload)
    setTokenCookie(res, 'jr_token', token)

    const { token: refreshToken } = signRefreshToken(tokenPayload)
    setTokenCookie(res, 'jr_refresh', refreshToken)

    return res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        avatarUrl: user.avatarUrl || '',
      },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    return res.status(500).json({ success: false, error: 'Something went wrong on our end. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/auth/refresh — rotate refresh token
// ══════════════════════════════════════════════════════════════
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.['jr_refresh']
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'No refresh token.' })
    }

    let payload
    try {
      payload = verifyToken(refreshToken)
    } catch {
      clearTokenCookie(res, 'jr_refresh')
      clearTokenCookie(res, 'jr_token')
      return res.status(401).json({ success: false, error: 'Session expired. Please login again.' })
    }

    if (payload.type !== 'refresh') {
      return res.status(401).json({ success: false, error: 'Invalid token type.' })
    }

    // Check if this refresh token was already used (rotation detection)
    if (payload.jti && isRefreshTokenInvalidated(payload.jti)) {
      // Possible token theft — clear everything
      clearTokenCookie(res, 'jr_refresh')
      clearTokenCookie(res, 'jr_token')
      return res.status(401).json({ success: false, error: 'Session invalidated. Please login again.' })
    }

    // Invalidate the old refresh token
    if (payload.jti) {
      invalidateRefreshToken(payload.jti)
    }

    // Issue new tokens
    const tokenPayload = { userId: payload.userId, email: payload.email, role: payload.role }

    const newAccessToken = signToken(tokenPayload)
    setTokenCookie(res, 'jr_token', newAccessToken)

    const { token: newRefreshToken } = signRefreshToken(tokenPayload)
    setTokenCookie(res, 'jr_refresh', newRefreshToken)

    return res.status(200).json({ success: true, message: 'Tokens refreshed.' })
  } catch (err) {
    console.error('Token refresh error:', err.message)
    return res.status(500).json({ success: false, error: 'Token refresh failed.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/auth/logout
// ══════════════════════════════════════════════════════════════
router.post('/logout', (req, res) => {
  // Invalidate current refresh token if present
  try {
    const refreshToken = req.cookies?.['jr_refresh']
    if (refreshToken) {
      const payload = verifyToken(refreshToken)
      if (payload.jti) invalidateRefreshToken(payload.jti)
    }
  } catch { /* token might be expired — that's fine */ }

  clearTokenCookie(res, 'jr_token')
  clearTokenCookie(res, 'jr_refresh')
  return res.status(200).json({ success: true, message: 'You\'ve been logged out.' })
})

// ══════════════════════════════════════════════════════════════
// GET /api/auth/me — returns current user from cookie token
// ══════════════════════════════════════════════════════════════
router.get('/me', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const user = await User.findById(req.user.userId).select('-passwordHash -__v').lean()
    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found.' })
    }
    return res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        avatarUrl: user.avatarUrl || '',
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Couldn\'t load your profile.' })
  }
})

// ══════════════════════════════════════════════════════════════
// PUT /api/auth/profile/avatar
// ══════════════════════════════════════════════════════════════
router.put('/profile/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided.' })

    await connectDB()
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ success: false, error: 'Account not found.' })

    const result = await uploadToCloudinary(req.file.buffer, { folder: 'journey-rentals/profiles' })
    user.avatarUrl = result.secure_url
    await user.save()

    return res.status(200).json({
      success: true,
      avatarUrl: user.avatarUrl,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        avatarUrl: user.avatarUrl,
      }
    })
  } catch (err) {
    console.error('Avatar upload error:', err.message)
    return res.status(500).json({ success: false, error: 'Couldn\'t upload your profile picture. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// PUT /api/auth/profile
// ══════════════════════════════════════════════════════════════
router.put('/profile', requireAuth, [
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name is too long.'),
  body('email').optional().trim().isLength({ max: 254 }).withMessage('Email is too long.'),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const { name, email } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ success: false, error: 'Account not found.' })

    if (name) user.name = name

    if (email) {
      const newEmail = email.toLowerCase().trim()
      if (newEmail !== user.email) {
        const emailCheck = await validateEmail(newEmail)
        if (!emailCheck.valid) {
          return res.status(400).json({ success: false, error: emailCheck.reason })
        }
        const conflict = await User.findOne({ email: newEmail })
        if (conflict) {
          return res.status(409).json({ success: false, error: 'That email is already taken.' })
        }
        user.email = newEmail
      }
    }

    await user.save()

    return res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        role:      user.role,
        avatarUrl: user.avatarUrl,
      }
    })
  } catch (err) {
    console.error('Profile update error:', err.message)
    return res.status(500).json({ success: false, error: 'Couldn\'t update your profile. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// DELETE /api/auth/profile
// ══════════════════════════════════════════════════════════════
router.delete('/profile', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const userId = req.user.userId

    const user = await User.findByIdAndDelete(userId)
    if (!user) return res.status(404).json({ success: false, error: 'Account not found.' })

    await Booking.deleteMany({ userId })
    clearTokenCookie(res, 'jr_token')
    clearTokenCookie(res, 'jr_refresh')

    return res.status(200).json({ success: true, message: 'Your account has been permanently deleted.' })
  } catch (err) {
    console.error('Account deletion error:', err.message)
    return res.status(500).json({ success: false, error: 'Couldn\'t delete your account. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/auth/owner-login — timing-safe credential check
// ══════════════════════════════════════════════════════════════
router.post('/owner-login', authLimiter, [
  body('email').trim().notEmpty().withMessage('Email and password are required.'),
  body('password').notEmpty().withMessage('Email and password are required.'),
  validateRequest
], async (req, res) => {
  try {
    const { email, password } = req.body

    // Account lockout check for owner too
    const lockout = checkAccountLockout('owner_' + email)
    if (lockout.locked) {
      const minutesLeft = Math.ceil(lockout.remainingMs / 60000)
      return res.status(429).json({
        success: false,
        error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      })
    }

    const emailMatch = timingSafeCompare(email, process.env.OWNER_EMAIL || '')
    const passMatch  = timingSafeCompare(password, process.env.OWNER_PASSWORD || '')

    if (!emailMatch || !passMatch) {
      recordFailedLogin('owner_' + email)
      return res.status(401).json({ success: false, error: 'Invalid owner credentials.' })
    }

    clearLoginAttempts('owner_' + email)

    const token = signToken({ email, role: 'owner', name: 'Owner' })
    setTokenCookie(res, 'jr_token_owner', token)

    return res.status(200).json({
      success: true,
      owner: { name: 'Owner', email, role: 'owner' },
    })
  } catch (err) {
    console.error('Owner login error:', err.message)
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/auth/owner-logout
// ══════════════════════════════════════════════════════════════
router.post('/owner-logout', (req, res) => {
  clearTokenCookie(res, 'jr_token_owner')
  return res.status(200).json({ success: true, message: 'Owner logged out.' })
})

// ══════════════════════════════════════════════════════════════
// GET /api/auth/google — Initiate Google OAuth
// ══════════════════════════════════════════════════════════════
router.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`)
  }
  const callbackURL = `${BACKEND_URL}/api/auth/google/callback`
  const googleAuthURL = 'https://accounts.google.com/o/oauth2/v2/auth' +
    `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(callbackURL)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('profile email')}` +
    `&access_type=offline` +
    `&prompt=consent`
  res.redirect(googleAuthURL)
})

// ══════════════════════════════════════════════════════════════
// GET /api/auth/google/callback
// ══════════════════════════════════════════════════════════════
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }, async (err, user) => {
      if (err || !user) {
        return res.redirect(`${FRONTEND_URL}/login?error=google_failed`)
      }
      try {
        const token = signToken({
          userId: user._id,
          email:  user.email,
          role:   user.role,
        })
        setTokenCookie(res, 'jr_token', token)

        const { token: refreshToken } = signRefreshToken({
          userId: user._id,
          email:  user.email,
          role:   user.role,
        })
        setTokenCookie(res, 'jr_refresh', refreshToken)

        // Pass user data as URL param (non-sensitive display data only)
        const userPayload = encodeURIComponent(JSON.stringify({
          id:        user._id,
          name:      user.name,
          email:     user.email,
          phone:     user.phone,
          role:      user.role,
          avatarUrl: user.avatarUrl || '',
        }))
        res.redirect(`${FRONTEND_URL}/login?oauth=success&user=${userPayload}`)
      } catch {
        res.redirect(`${FRONTEND_URL}/login?error=token_failed`)
      }
    })(req, res, next)
  }
)

export default router
