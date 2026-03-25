import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema({
  type:             { type: String, enum: ['car', 'bike'], required: true },
  brand:            { type: String, required: true },
  model:            { type: String, required: true },
  year:             { type: Number, required: true },
  category:         { type: String, required: true },
  transmission:     { type: String, enum: ['Manual', 'Automatic'], required: true },
  fuelType:         { type: String, required: true },
  sittingCapacity:  { type: Number, required: true },
  isAvailable:      { type: Boolean, default: true },
  image:            { type: String, required: true },
  images:           [{ type: String }],
  description:      { type: String },
  features:         [{ type: String }],
  locations:        [{ type: String }],
  pricePerDay:      { type: Number },
  bikeSlots: {
    price3hr:  { type: Number },
    price6hr:  { type: Number },
    price12hr: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
})

vehicleSchema.index({ type: 1, isAvailable: 1 })

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema)
