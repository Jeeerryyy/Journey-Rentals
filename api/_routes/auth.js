import { Router } from 'express'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import rateLimit from 'express-rate-limit'
import { connectDB } from '../_lib/mongodb.js'
import User from '../_lib/models/User.js'
import Booking from '../_lib/models/Booking.js'
import { signToken } from '../_lib/auth.js'
import multer from 'multer'
import { uploadToCloudinary } from '../_lib/cloudinary.js'

const router = Router()
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Invalid file type. Only images are allowed.'))
  }
})

// Strict rate limiter for auth endpoints — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs:    15 * 60 * 1000,
  max:         10,
  message:     { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders:   false,
  skipSuccessfulRequests: true, // Only count failed requests
})

// configure google oauth strategy if credentials exist
const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const FRONTEND_URL         = process.env.FRONTEND_URL || 'http://localhost:5173'
const BACKEND_URL          = process.env.BACKEND_URL || 'http://localhost:5000'

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

        // Find or create user
        let user = await User.findOne({ email })
        if (!user) {
          user = await User.create({
            name:         profile.displayName || profile.name?.givenName || 'Google User',
            email,
            passwordHash: '', // No password for OAuth users
            phone:        '',
            role:         'customer',
            provider:     'google',
            googleId:     profile.id,
          })
        } else if (!user.googleId) {
          // Link Google to existing account
          user.googleId = profile.id
          user.provider = user.provider || 'google'
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

// user registration
router.post('/signup', authLimiter, async (req, res) => {
  try {
    await connectDB()

    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    // Phone is optional — validate format only if provided
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit phone number.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || '',
      role: 'customer',
      provider: 'local',
    })

    const token = signToken({
      userId: user._id,
      email:  user.email,
      role:   'customer',
    })

    return res.status(201).json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
        avatarUrl: user.avatarUrl || '',
      },
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ── POST /api/auth/login ──
router.post('/login', authLimiter, async (req, res) => {
  try {
    await connectDB()

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // OAuth users don't have a password
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'This account uses Google sign-in. Please use "Continue with Google".' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = signToken({
      userId: user._id,
      email:  user.email,
      role:   user.role,
    })

    return res.status(200).json({
      success: true,
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
        avatarUrl: user.avatarUrl || '',
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ── PUT /api/auth/profile/avatar ──
import { requireAuth } from '../_lib/auth.js'
router.put('/profile/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided in the payload.' })

    await connectDB()
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const result = await uploadToCloudinary(req.file.buffer, { folder: 'journey-rentals/profiles' })
    user.avatarUrl = result.secure_url
    await user.save()

    return res.status(200).json({
      success: true,
      avatarUrl: user.avatarUrl,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
        avatarUrl: user.avatarUrl,
      }
    })
  } catch (err) {
    console.error('Avatar upload error:', err)
    return res.status(500).json({ error: 'Failed to upload profile picture.' })
  }
})

// ── PUT /api/auth/profile ──
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body
    await connectDB()
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    if (name) user.name = name.trim()

    if (email) {
      const newEmail = email.toLowerCase().trim()
      // Check no other account already uses this email
      if (newEmail !== user.email) {
        const conflict = await User.findOne({ email: newEmail })
        if (conflict) {
          return res.status(409).json({ error: 'An account with this email already exists.' })
        }
        user.email = newEmail
      }
    }

    await user.save()

    return res.status(200).json({
      success: true,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
        avatarUrl: user.avatarUrl,
      }
    })
  } catch (err) {
    console.error('Profile update error:', err)
    return res.status(500).json({ error: 'Failed to update profile.' })
  }
})

// ── DELETE /api/auth/profile ──
router.delete('/profile', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const userId = req.user.userId
    
    // Delete the user record
    const user = await User.findByIdAndDelete(userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })
      
    // Cascade deletion: wipe all bookings associated with this user
    await Booking.deleteMany({ userId: userId })
    
    return res.status(200).json({ success: true, message: 'Account permanently deleted.' })
  } catch (err) {
    console.error('Account deletion error:', err)
    return res.status(500).json({ error: 'Failed to delete account. Please try again.' })
  }
})

// ── POST /api/auth/owner-login ──
router.post('/owner-login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    if (email !== process.env.OWNER_EMAIL || password !== process.env.OWNER_PASSWORD) {
      return res.status(401).json({ error: 'Invalid owner credentials.' })
    }

    const token = signToken({ email, role: 'owner', name: 'Owner' })

    return res.status(200).json({
      success: true,
      token,
      owner: { name: 'Owner', email, role: 'owner' },
    })
  } catch (err) {
    console.error('Owner login error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ── GET /api/auth/google ── Initiate Google OAuth
// SECURITY FIX: Bypass Passport.authenticate for the redirect step because
// Express 5 breaks Passport's middleware chaining, dropping the scope parameter.
// We construct the Google OAuth URL manually instead.
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

// ── GET /api/auth/google/callback ── Handle Google OAuth callback
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
        const userPayload = encodeURIComponent(JSON.stringify({
          id:    user._id,
          name:  user.name,
          email: user.email,
          phone: user.phone,
          role:  user.role,
          avatarUrl: user.avatarUrl || '',
        }))
        // Redirect to frontend with token and user info as URL params
        res.redirect(`${FRONTEND_URL}/login?token=${token}&user=${userPayload}`)
      } catch (tokenErr) {
        res.redirect(`${FRONTEND_URL}/login?error=token_failed`)
      }
    })(req, res, next)
  }
)

export default router
