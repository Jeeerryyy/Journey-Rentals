import cloudinary from '../config/cloudinary.js'
import { fileTypeFromBuffer } from 'file-type'
import { createNotification } from '../services/notificationService.js'

const uploadBase64 = (base64String, fieldname) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64String,
      {
        folder:        `journey-rentals/bookings/${new Date().toISOString().split('T')[0]}`,
        public_id:     `${fieldname}_${Date.now()}`,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
  })
}

// Validation constants
const MAX_DOC_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_DOC_MIME = /^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,/

export const uploadDocument = async (req, res) => {
  try {
    const { aadhar, license } = req.body

    if (!aadhar && !license) {
      return res.status(200).json({ success: true, files: {} })
    }

    const files = {}

    if (aadhar && typeof aadhar === 'string' && ALLOWED_DOC_MIME.test(aadhar)) {
      if (aadhar.length <= MAX_DOC_SIZE) {
        const aadharResult = await uploadBase64(aadhar, 'aadhar')
        files.aadhar = {
          url: aadharResult.secure_url,
          publicId: aadharResult.public_id,
        }
      }
    }

    if (license && typeof license === 'string' && ALLOWED_DOC_MIME.test(license)) {
      if (license.length <= MAX_DOC_SIZE) {
        const licenseResult = await uploadBase64(license, 'license')
        files.license = {
          url: licenseResult.secure_url,
          publicId: licenseResult.public_id,
        }
      }
    }

    // Trigger notification
    if (files.aadhar || files.license) {
      createNotification({
        type: 'kyc',
        title: 'Customer KYC Uploaded',
        message: `Customer ${req.user?.email || ''} uploaded ${files.aadhar && files.license ? 'Aadhaar & Driving License' : files.aadhar ? 'Aadhaar Card' : 'Driving License'}.`,
        link: '/admin/bookings',
        data: { userId: req.user?.userId, files }
      }).catch(() => {})
    }

    return res.status(200).json({
      success: true,
      files,
    })
  } catch (err) {
    console.error('Upload error:', err.message)
    return res.status(500).json({ success: false, error: 'Document upload failed. Please try again.' })
  }
}

