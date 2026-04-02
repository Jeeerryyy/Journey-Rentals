import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.js'
import { uploadDocument } from '../controllers/upload.controller.js'

const router = Router()

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, error: 'Too many upload requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// handle document upload
router.post('/document', requireAuth, uploadLimiter, uploadDocument)

export default router
