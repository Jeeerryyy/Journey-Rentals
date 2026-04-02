import cloudinary from '../config/cloudinary.js'
import { fileTypeFromBuffer } from 'file-type'
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

    if (!aadhar || !license) {
      return res.status(400).json({ success: false, error: 'Both aadhar and license are required.' })
    }

    // Validate size and typing strictly via magic numbers
    for (const [name, doc] of [['Aadhar', aadhar], ['License', license]]) {
      if (typeof doc !== 'string' || !ALLOWED_DOC_MIME.test(doc)) {
        return res.status(400).json({ success: false, error: `${name}: Invalid format. Accepted: JPEG, PNG, WebP, PDF.` })
      }
      if (doc.length > MAX_DOC_SIZE) {
        return res.status(400).json({ success: false, error: `${name}: File must be under 5MB.` })
      }
      const base64Data = doc.split(',')[1]
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64')
        const type = await fileTypeFromBuffer(buffer)
        if (!type || !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(type.mime)) {
          return res.status(400).json({ success: false, error: `${name}: Corrupted or invalid file content. Accepted: JPEG, PNG, WebP, PDF.` })
        }
      }
    }

    const [aadharResult, licenseResult] = await Promise.all([
      uploadBase64(aadhar,  'aadhar'),
      uploadBase64(license, 'license')
    ])

    return res.status(200).json({
      success: true,
      files: {
        aadhar: {
          url:      aadharResult.secure_url,
          publicId: aadharResult.public_id
        },
        license: {
          url:      licenseResult.secure_url,
          publicId: licenseResult.public_id
        }
      }
    })
  } catch (err) {
    console.error('Upload error:', err.message)
    return res.status(500).json({ success: false, error: 'Document upload failed. Please try again.' })
  }
}
