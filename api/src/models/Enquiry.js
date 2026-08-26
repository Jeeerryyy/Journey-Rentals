import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema({
  customer_name:        { type: String, required: true, trim: true },
  phone:                { type: String, required: true, trim: true },
  email:                { type: String, trim: true, default: '' },
  city:                 { type: String, required: true, trim: true, default: 'Solapur' },
  car_model_interested: { type: String, default: 'Mahindra Thar 4x4' },
  source:               { type: String, default: 'Phone Call' },
  status:               { type: String, enum: ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'], default: 'New' },
  notes:                { type: String, default: '' },
  createdAt:            { type: Date, default: Date.now },
}, {
  timestamps: true,
})

enquirySchema.index({ phone: 1 })
enquirySchema.index({ status: 1, createdAt: -1 })

export default mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema)
