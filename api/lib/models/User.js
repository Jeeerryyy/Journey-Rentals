import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: '' }, // Empty for OAuth users
  phone:        { type: String, default: '' },
  role:         { type: String, enum: ['customer', 'owner'], default: 'customer' },
  provider:     { type: String, enum: ['local', 'google'], default: 'local' },
  googleId:     { type: String, default: '' },
  avatarUrl:    { type: String, default: '' },
  isVerified:   { type: Boolean, default: false },
  createdAt:    { type: Date, default: Date.now },
}, {
  timestamps: true,
})

userSchema.index({ email: 1 })
userSchema.index({ googleId: 1 }, { sparse: true })

export default mongoose.models.User || mongoose.model('User', userSchema)
