import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { body, query, validationResult } from 'express-validator'
import { createOrder, verifyPayment, getMyBookings, cancelBooking, requestExtension, getBookingInvoice, getBookingById, validateCoupon } from '../controllers/bookings.controller.js'

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
  max: 30,
  message: { success: false, error: 'Too many booking requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/validate-coupon — Check promo discount code
// ══════════════════════════════════════════════════════════════
router.post('/validate-coupon', validateCoupon)

// ══════════════════════════════════════════════════════════════
// GET /api/bookings/:id/invoice — Tax Invoice HTML / PDF print
// ══════════════════════════════════════════════════════════════
router.get('/:id/invoice', getBookingInvoice)
router.get('/ref/:refId/invoice', getBookingInvoice)

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/create-order — create booking + Razorpay order
// ══════════════════════════════════════════════════════════════
router.post('/create-order', optionalAuth, createOrderLimiter, [
  body('vehicleId').notEmpty().withMessage('Missing required booking fields.'),
  body('bookingType').isIn(['car', 'bike']).withMessage('Invalid booking type.'),
  body('totalPrice').isNumeric().custom(v => v > 0).withMessage('Invalid total price.'),
  body('customerInfo').isObject().withMessage('Missing required booking fields.'),
  validateRequest
], createOrder)

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/verify-payment — Razorpay signature verification
// ══════════════════════════════════════════════════════════════
router.post('/verify-payment', optionalAuth, [
  body('razorpay_order_id').notEmpty().withMessage('Missing payment verification order ID.').trim(),
  body('razorpay_payment_id').notEmpty().withMessage('Missing payment verification payment ID.').trim(),
  body('razorpay_signature').notEmpty().withMessage('Missing payment verification signature.').trim(),
  validateRequest
], verifyPayment)

// ══════════════════════════════════════════════════════════════
// GET /api/bookings/mine — get authenticated user's bookings
// ══════════════════════════════════════════════════════════════
router.get('/mine', requireAuth, getMyBookings)

// ══════════════════════════════════════════════════════════════
// GET /api/bookings/:id — get booking details by ID or Ref ID
// ══════════════════════════════════════════════════════════════
router.get('/:id', optionalAuth, getBookingById)

// ══════════════════════════════════════════════════════════════
// PATCH /api/bookings/cancel — cancel a booking
// ══════════════════════════════════════════════════════════════
router.patch('/cancel', requireAuth, [
  query('id').notEmpty().withMessage('Booking ID is required.').escape(),
  validateRequest
], cancelBooking)

// ══════════════════════════════════════════════════════════════
// PATCH /api/bookings/:id/request-extension — Request rental extension
// ══════════════════════════════════════════════════════════════
router.patch('/:id/request-extension', requireAuth, requestExtension)

export default router
