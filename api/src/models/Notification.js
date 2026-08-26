import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['auth', 'user', 'booking', 'kyc', 'fleet', 'lead', 'coupon', 'payment', 'system'],
    default: 'system',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    default: '/admin',
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true })

notificationSchema.index({ createdAt: -1 })

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
