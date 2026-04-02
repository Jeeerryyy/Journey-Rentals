/**
 * otp.js — Cryptographically secure OTP generation + hashed storage
 */
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import OTP from './models/OTP.js'

/**
 * Generate a 6-digit cryptographically secure OTP
 */
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Hash and store OTP in MongoDB (auto-expires via TTL index after 10 minutes)
 * Deletes any existing OTP for this email first.
 */
export async function storeOTP(email, rawOTP) {
  // Remove any existing OTP for this email
  await OTP.deleteMany({ email: email.toLowerCase() })

  const hashedOTP = await bcrypt.hash(rawOTP, 10)

  await OTP.create({
    email: email.toLowerCase(),
    otp: hashedOTP,
    createdAt: new Date(),
  })
}

/**
 * Verify an OTP submission against the stored hash.
 * Returns { valid: true } or { valid: false, reason: string }
 */
export async function verifyOTP(email, rawOTP) {
  const record = await OTP.findOne({ email: email.toLowerCase() })

  if (!record) {
    return { valid: false, reason: 'OTP has expired. Please request a new one.' }
  }

  const isMatch = await bcrypt.compare(rawOTP, record.otp)
  if (!isMatch) {
    return { valid: false, reason: 'Incorrect OTP. Please try again.' }
  }

  // Valid — delete the OTP record
  await OTP.deleteOne({ _id: record._id })
  return { valid: true }
}
