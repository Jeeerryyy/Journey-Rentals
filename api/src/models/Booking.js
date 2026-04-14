import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  referenceId: { type: String, required: true, unique: true },

  userId:       { type: String },
  userSnapshot: {
    name:  String,
    email: String,
    phone: String,
  },

  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleSnapshot: {
    brand:    String,
    model:    String,
    category: String,
    image:    String,
    type:     { type: String },
  },

  bookingType:    { type: String, enum: ['car', 'bike'], required: true },
  pickupLocation: { type: String, default: '' },

  // Car fields
  pickupDate: Date,
  pickupTime: String,
  returnDate: Date,
  returnTime: String,
  totalDays:  Number,

  // Bike fields
  bikeDate: Date,
  bikeSlot: { type: String, enum: ['3hr', '6hr', '12hr'] },

  // Financials
  totalPrice:  { type: Number, required: true },
  advancePaid: { type: Number, required: true },
  balanceDue:  { type: Number, required: true },

  // Documents
  documents: {
    aadharUrl:  String,
    licenseUrl: String,
  },

  // Admin only
  adminPhotoWithVehicleUrl: String,

  // Razorpay (used later)
  payment: {
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  },

  status:    { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  
  // Extension tracking
  extensionRequested: { type: Boolean, default: false },
  extensionStatus:    { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },

  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
})

bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
bookingSchema.index({ userId: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ createdAt: -1 })
bookingSchema.index({ vehicleId: 1 })
bookingSchema.index({ status: 1, createdAt: -1 }) // compound for dashboard queries

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema)
