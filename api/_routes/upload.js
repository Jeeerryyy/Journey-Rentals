import { Router } from 'express'
import cloudinary from '../_lib/cloudinary.js'
import { requireAuth } from '../_lib/auth.js'

const router = Router()



const uploadBase64 = (base64String, fieldname) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64String,
      {
        folder:        'journey-rentals/documents',
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

// handle document upload
router.post('/document', requireAuth, async (req, res) => {
  try {
    const { aadhar, license } = req.body

    if (!aadhar || !license) {
      return res.status(400).json({ error: 'Both aadhar and license are required.' })
    }

    // Validate size and type
    for (const [name, doc] of [['Aadhar', aadhar], ['License', license]]) {
      if (typeof doc !== 'string' || !ALLOWED_DOC_MIME.test(doc)) {
        return res.status(400).json({ error: `${name}: Invalid format. Accepted: JPEG, PNG, WebP, PDF.` })
      }
      if (doc.length > MAX_DOC_SIZE) {
        return res.status(400).json({ error: `${name}: File must be under 5MB.` })
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
  } catch (error) {
    console.error('Upload error:', error.message)
    return res.status(500).json({ error: 'Document upload failed. Please try again.' })
  }
})

export default router
