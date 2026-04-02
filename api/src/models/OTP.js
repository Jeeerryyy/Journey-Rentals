import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true, trim: true },
  otp:       { type: String, required: true }, // bcrypt-hashed
  createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL: auto-delete after 10 minutes
})

// Index for fast lookup by email
otpSchema.index({ email: 1 })

export default mongoose.models.OTP || mongoose.model('OTP', otpSchema)
