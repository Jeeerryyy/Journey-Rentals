import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:       { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
  value:      { type: Number, required: true },
  min_amount: { type: Number, default: 0 },
  expiry:     { type: Date, required: true },
  active:     { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now },
}, {
  timestamps: true,
})

couponSchema.index({ active: 1, expiry: 1 })

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema)
