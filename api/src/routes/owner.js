import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireOwner } from '../middleware/auth.js'
import {
  uploadVehicleImages,
  getDashboardStats,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  toggleVehicleVisibility,
  getBookings,
  searchBooking,
  getBookingById,
  updateBookingStatus,
  uploadBookingPhoto,
  deleteBookingPhoto,
  getFleetSection,
  updateFleetSection
} from '../controllers/owner.controller.js'

const router = Router()

// All owner routes require owner authentication
router.use(requireOwner)

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many upload requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/upload/images', uploadLimiter, uploadVehicleImages)
router.get('/dashboard', getDashboardStats)
router.get('/vehicles', getVehicles)
router.post('/vehicles', createVehicle)
router.patch('/vehicles-item/:id', updateVehicle)
router.delete('/vehicles-item/:id', deleteVehicle)
router.patch('/vehicles-visibility/:id', toggleVehicleVisibility)
router.get('/bookings', getBookings)
router.get('/bookings/search/:refId', searchBooking)
router.get('/bookings/:id', getBookingById)
router.patch('/bookings/:id', updateBookingStatus)
router.post('/bookings/:id/photo', uploadLimiter, uploadBookingPhoto)
router.delete('/bookings/:id/photo', deleteBookingPhoto)
router.get('/fleet-section', getFleetSection)
router.put('/fleet-section', updateFleetSection)

export default router
