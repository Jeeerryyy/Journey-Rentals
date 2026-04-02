import bcrypt from 'bcryptjs'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import {
  signToken, signRefreshToken, setTokenCookie, clearTokenCookie,
  timingSafeCompare, verifyToken,
  checkAccountLockout, recordFailedLogin, clearLoginAttempts,
  invalidateRefreshToken, isRefreshTokenInvalidated,
} from '../middleware/auth.js'
import { uploadToCloudinary } from '../config/cloudinary.js'
import { validateEmail, validatePassword } from '../middleware/validators.js'
import { generateOTP, storeOTP, verifyOTP } from '../services/otp.js'
import { sendOTPEmail } from '../services/mailer.js'
import { fileTypeFromBuffer } from 'file-type'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:5000'

export const signup = async (req, res) => {
  try {
    await connectDB()

    const { name, email, password, phone } = req.body

    const emailCheck = await validateEmail(email)
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, error: emailCheck.reason })
    }

    const passwordErrors = validatePassword(password, name, email)
    if (passwordErrors.length > 0) {
      return res.status(400).json({ success: false, error: passwordErrors[0], passwordErrors })
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Enter a valid 10-digit phone number.' })
    }

    let user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      if (user.isVerified) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists.' })
      }
      
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
}

export const verifyOtp = async (req, res) => {
  try {
    await connectDB()

    const { email, otp } = req.body

    const result = await verifyOTP(email, otp.toString())
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.reason })
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found.' })
    }

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
}

export const resendOtp = async (req, res) => {
  try {
    await connectDB()

    const { email } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || user.isVerified) {
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
}

export const login = async (req, res) => {
  try {
    await connectDB()

    const { email, password } = req.body

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

    if (!user.passwordHash) {
      return res.status(400).json({ success: false, error: 'This account uses Google sign-in — tap "Continue with Google" instead.' })
    }

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
}

export const refreshToken = async (req, res) => {
  try {
    const rfToken = req.cookies?.['jr_refresh']
    if (!rfToken) {
      return res.status(401).json({ success: false, error: 'No refresh token.' })
    }

    let payload
    try {
      payload = verifyToken(rfToken)
    } catch {
      clearTokenCookie(res, 'jr_refresh')
      clearTokenCookie(res, 'jr_token')
      return res.status(401).json({ success: false, error: 'Session expired. Please login again.' })
    }

    if (payload.type !== 'refresh') {
      return res.status(401).json({ success: false, error: 'Invalid token type.' })
    }

    if (payload.jti && isRefreshTokenInvalidated(payload.jti)) {
      clearTokenCookie(res, 'jr_refresh')
      clearTokenCookie(res, 'jr_token')
      return res.status(401).json({ success: false, error: 'Session invalidated. Please login again.' })
    }

    if (payload.jti) {
      invalidateRefreshToken(payload.jti)
    }

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
}

export const logout = (req, res) => {
  try {
    const rfToken = req.cookies?.['jr_refresh']
    if (rfToken) {
      const payload = verifyToken(rfToken)
      if (payload.jti) invalidateRefreshToken(payload.jti)
    }
  } catch { /* token might be expired — that's fine */ }

  clearTokenCookie(res, 'jr_token')
  clearTokenCookie(res, 'jr_refresh')
  return res.status(200).json({ success: true, message: 'You\'ve been logged out.' })
}

export const getMe = async (req, res) => {
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
}

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided.' })

    const type = await fileTypeFromBuffer(req.file.buffer)
    if (!type || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type.mime)) {
      return res.status(400).json({ success: false, error: 'Corrupt or invalid image content.' })
    }

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
}

export const updateProfile = async (req, res) => {
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
}

export const deleteProfile = async (req, res) => {
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
}

export const ownerLogin = async (req, res) => {
  try {
    const { email, password } = req.body

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
}

export const ownerLogout = (req, res) => {
  clearTokenCookie(res, 'jr_token_owner')
  return res.status(200).json({ success: true, message: 'Owner logged out.' })
}

export const initiateGoogleAuth = (req, res) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  if (!GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
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
}
