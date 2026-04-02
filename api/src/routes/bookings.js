import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.js'
import { body, query, validationResult } from 'express-validator'
import { createOrder, verifyPayment, getMyBookings, cancelBooking } from '../controllers/bookings.controller.js'

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg })
  }
  next()
}

const router = Router()

// ── Rate limiter for order creation ──
const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many booking requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/create-order — create booking + Razorpay order
// ══════════════════════════════════════════════════════════════
router.post('/create-order', requireAuth, createOrderLimiter, [
  body('vehicleId').notEmpty().withMessage('Missing required booking fields.'),
  body('bookingType').isIn(['car', 'bike']).withMessage('Invalid booking type.'),
  body('totalPrice').isNumeric().custom(v => v > 0).withMessage('Invalid total price.'),
  body('customerInfo').isObject().withMessage('Missing required booking fields.'),
  validateRequest
], createOrder)

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/verify-payment — Razorpay signature verification
// ══════════════════════════════════════════════════════════════
router.post('/verify-payment', requireAuth, [
  body('razorpay_order_id').notEmpty().withMessage('Missing payment verification fields.').escape(),
  body('razorpay_payment_id').notEmpty().withMessage('Missing payment verification fields.').escape(),
  body('razorpay_signature').notEmpty().withMessage('Missing payment verification fields.').escape(),
  validateRequest
], verifyPayment)

// ══════════════════════════════════════════════════════════════
// GET /api/bookings/mine — get authenticated user's bookings
// ══════════════════════════════════════════════════════════════
router.get('/mine', requireAuth, getMyBookings)

// ══════════════════════════════════════════════════════════════
// PATCH /api/bookings/cancel — cancel a booking
// ══════════════════════════════════════════════════════════════
router.patch('/cancel', requireAuth, [
  query('id').notEmpty().withMessage('Booking ID is required.').escape(),
  validateRequest
], cancelBooking)

export default router
