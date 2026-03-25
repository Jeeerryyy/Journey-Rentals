import mongoose from 'mongoose'

const fleetVehicleSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  category:     { type: String, default: '' },
  seats:        { type: String, default: '' },
  fuel:         { type: String, default: '' },
  transmission: { type: String, default: '' },
  pricePerDay:  { type: Number, default: 0 },
  image:        { type: String, default: '' },
  isFeatured:   { type: Boolean, default: false },
  isVisible:    { type: Boolean, default: true },
  order:        { type: Number, default: 0 },
}, { _id: true })

const fleetSectionSchema = new mongoose.Schema({
  heading:    { type: String, default: 'Our Fleet' },
  subheading: { type: String, default: 'Best Self-Drive Rentals' },
  vehicles:   [fleetVehicleSchema],
}, { timestamps: true })

export default mongoose.models.FleetSection || mongoose.model('FleetSection', fleetSectionSchema)
