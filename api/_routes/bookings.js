import { Router } from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import rateLimit from 'express-rate-limit'
import { connectDB } from '../_lib/mongodb.js'
import { requireAuth } from '../_lib/auth.js'
import Booking from '../_lib/models/Booking.js'
import Vehicle from '../_lib/models/Vehicle.js'
import PushSubscription from '../_lib/models/PushSubscription.js'
import { sendBookingConfirmationEmail, sendOwnerBookingNotificationEmail } from '../_lib/mailer.js'
import { sendOwnerWhatsAppNotification } from '../_lib/whatsapp.js'
import webpush from 'web-push'
import { body, query, validationResult } from 'express-validator'
import { trackEvent, trackError } from '../_lib/errorTracker.js'

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg })
  }
  next()
}

async function triggerBookingConfirmation(booking) {
  try {
    const ownerWhatsapp = process.env.OWNER_WHATSAPP;
    const vehicleName = booking.vehicleSnapshot ? `${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.model}` : 'Vehicle';
    const startDate = booking.bookingType === 'car' ? (booking.pickupDate ? booking.pickupDate.toISOString().split('T')[0] : '') : (booking.bikeDate ? booking.bikeDate.toISOString().split('T')[0] : '');
    const endDate = booking.bookingType === 'car' ? (booking.returnDate ? booking.returnDate.toISOString().split('T')[0] : '') : (booking.bikeDate ? booking.bikeDate.toISOString().split('T')[0] : '');
    
    const waMessage = encodeURIComponent(
      "Hi! My booking is confirmed on Journey Rentals.\nBooking ID: " + booking._id + "\nVehicle: " + vehicleName + "\nFrom: " + startDate + " To: " + endDate + "\nName: " + booking.userSnapshot.name
    );
    const waLink = "https://wa.me/" + ownerWhatsapp + "?text=" + waMessage;

    const ownerEmail = process.env.OWNER_EMAIL || 'admin@journeyrentals.in';

    await Promise.all([
      sendBookingConfirmationEmail(booking.userSnapshot.email, {
        customerName: booking.userSnapshot.name,
        vehicleName,
        startDate,
        endDate,
        totalAmount: booking.totalPrice,
        bookingId: booking._id,
        waLink
      }).catch(err => console.error('Customer Mail Error:', err.message)),
      sendOwnerBookingNotificationEmail(ownerEmail, {
        customerName: booking.userSnapshot.name,
        customerPhone: booking.userSnapshot.phone,
        vehicleName,
        startDate,
        endDate,
        totalAmount: booking.totalPrice,
        bookingId: booking._id,
        pickupLocation: booking.pickupLocation,
      }).catch(err => console.error(`Owner Mail Error to ${ownerEmail}:`, err.message)),
      sendOwnerWhatsAppNotification({
        customerName: booking.userSnapshot.name,
        customerPhone: booking.userSnapshot.phone,
        vehicleName,
        startDate,
        endDate,
        totalAmount: booking.totalPrice,
        bookingId: booking._id,
        pickupLocation: booking.pickupLocation,
      }).catch(err => console.error('Owner WhatsApp Error:', err.message))
    ]);

    try {
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        const subscriptions = await PushSubscription.find({});
        const payload = JSON.stringify({
          title: 'New Booking — Journey Rentals',
          body: 'New booking by ' + booking.userSnapshot.name,
          url: '/owner/bookings'
        });

        await Promise.all(
          subscriptions.map(sub =>
            webpush.sendNotification(sub, payload).catch(async err => {
              if (err.statusCode === 410 || err.statusCode === 404) {
                await PushSubscription.deleteOne({ endpoint: sub.endpoint });
              }
            })
          )
        );
      }
    } catch (pushErr) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send push notification:', pushErr.message);
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to send booking confirmation email:', err.message);
    }
  }
}

const router = Router()

// ── Razorpay SDK instantiation ──
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

let razorpay = null
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id:     RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  })
}

// ── Rate limiter for order creation ──
const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many booking requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const ADVANCE = 500

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/create-order — create booking + Razorpay order
// ══════════════════════════════════════════════════════════════
router.post('/create-order', requireAuth, createOrderLimiter, [
  body('vehicleId').notEmpty().withMessage('Missing required booking fields.'),
  body('bookingType').isIn(['car', 'bike']).withMessage('Invalid booking type.'),
  body('totalPrice').isNumeric().custom(v => v > 0).withMessage('Invalid total price.'),
  body('customerInfo').isObject().withMessage('Missing required booking fields.'),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const {
      customerInfo, vehicleId, bookingType, pickupLocation,
      pickupDate, pickupTime, returnDate, returnTime, totalDays,
      bikeDate, bikeSlot, totalPrice, documents,
    } = req.body

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId).lean()
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' })
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ success: false, error: 'This vehicle is currently unavailable.' })
    }

    const advanceAmount = Math.min(ADVANCE, totalPrice)
    const referenceId = `JR${Date.now().toString().slice(-8)}`

    // ── Build booking document ──
    const bookingData = {
      referenceId,
      userId: req.user.userId,
      userSnapshot: {
        name:  String(customerInfo.name || '').trim().slice(0, 100),
        email: String(customerInfo.email || '').trim().slice(0, 100),
        phone: String(customerInfo.phone || '').trim().slice(0, 15),
      },
      vehicleId:      vehicle._id,
      vehicleSnapshot: {
        brand:    vehicle.brand,
        model:    vehicle.model,
        category: vehicle.category,
        image:    vehicle.image,
        type:     vehicle.type,
      },
      bookingType,
      pickupLocation: String(pickupLocation || '').trim().slice(0, 200),
      pickupDate: bookingType === 'car' ? new Date(pickupDate) : null,
      pickupTime: bookingType === 'car' ? String(pickupTime || '').trim() : null,
      returnDate: bookingType === 'car' ? new Date(returnDate) : null,
      returnTime: bookingType === 'car' ? String(returnTime || '').trim() : null,
      totalDays:  bookingType === 'car' ? Number(totalDays) || 0 : null,
      bikeDate:   bookingType === 'bike' ? new Date(bikeDate) : null,
      bikeSlot:   bookingType === 'bike' ? bikeSlot : null,
      totalPrice:  Number(totalPrice),
      advancePaid: advanceAmount,
      balanceDue:  Number(totalPrice) - advanceAmount,
      documents: {
        aadharUrl:  String(documents?.aadharUrl || ''),
        licenseUrl: String(documents?.licenseUrl || ''),
      },
      status: 'pending',
    }

    // ── Razorpay order creation ──
    if (razorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount:   advanceAmount * 100, // Razorpay uses paise
        currency: 'INR',
        receipt:  referenceId,
        notes:    { vehicleId: vehicle._id.toString(), bookingType },
      })

      bookingData.payment = {
        razorpayOrderId: rzpOrder.id,
        status: 'pending',
      }

      const booking = await Booking.create(bookingData)

      return res.status(201).json({
        success: true,
        bookingDetails: {
          bookingId:   booking._id,
          referenceId: booking.referenceId,
          totalPrice:  booking.totalPrice,
          advancePaid: booking.advancePaid,
        },
        razorpay: {
          orderId:  rzpOrder.id,
          amount:   rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId:    RAZORPAY_KEY_ID, // Public key — safe to send
        },
      })
    }

    // ── Fallback: no Razorpay configured — direct booking ──
    bookingData.status = 'confirmed'
    bookingData.payment = { status: 'paid' }
    const booking = await Booking.create(bookingData)

    trackEvent('booking_created', { bookingId: booking._id, userId: req.user.userId, type: bookingType, amount: totalPrice })
    await triggerBookingConfirmation(booking)

    return res.status(201).json({
      success: true,
      bookingDetails: {
        bookingId:   booking._id,
        referenceId: booking.referenceId,
        totalPrice:  booking.totalPrice,
        advancePaid: booking.advancePaid,
      },
    })
  } catch (err) {
    trackError(err, { action: 'create_order', userId: req.user?.userId })
    return res.status(500).json({ success: false, error: 'We couldn\'t create your booking right now. Please try again.' })
  }
})

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/verify-payment — Razorpay signature verification
// ══════════════════════════════════════════════════════════════
router.post('/verify-payment', requireAuth, [
  body('razorpay_order_id').notEmpty().withMessage('Missing payment verification fields.').escape(),
  body('razorpay_payment_id').notEmpty().withMessage('Missing payment verification fields.').escape(),
  body('razorpay_signature').notEmpty().withMessage('Missing payment verification fields.').escape(),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Payment gateway not configured.' })
    }

    // ── Signature verification using HMAC SHA256 ──
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed. Invalid signature.' })
    }

    // ── Update booking status ──
    const booking = await Booking.findOneAndUpdate(
      { 'payment.razorpayOrderId': razorpay_order_id },
      {
        status: 'confirmed',
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.razorpaySignature': razorpay_signature,
        'payment.status': 'paid',
      },
      { new: true }
    )

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found for this payment.' })
    }

    await triggerBookingConfirmation(booking)

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed.',
      bookingDetails: {
        bookingId:   booking._id,
        referenceId: booking.referenceId,
        status:      booking.status,
      },
    })
  } catch (err) {
    console.error('Verify payment error:', err.message)
    return res.status(500).json({ success: false, error: 'Payment verification failed. Please contact support.' })
  }
})

// ══════════════════════════════════════════════════════════════
// GET /api/bookings/mine — get authenticated user's bookings
// ══════════════════════════════════════════════════════════════
router.get('/mine', requireAuth, async (req, res) => {
  try {
    await connectDB()
    const bookings = await Booking.find({ userId: req.user.userId, status: { $ne: 'pending' } })
      .sort({ createdAt: -1 })
      .select('-__v -adminPhotoWithVehicleUrl')
      .lean()

    return res.status(200).json({ success: true, bookings })
  } catch (err) {
    console.error('My bookings error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch bookings.' })
  }
})

// ══════════════════════════════════════════════════════════════
// PATCH /api/bookings/cancel — cancel a booking
// ══════════════════════════════════════════════════════════════
router.patch('/cancel', requireAuth, [
  query('id').notEmpty().withMessage('Booking ID is required.').escape(),
  validateRequest
], async (req, res) => {
  try {
    await connectDB()

    const { id } = req.query

    const booking = await Booking.findOne({ _id: id, userId: req.user.userId })

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: 'This booking cannot be cancelled.' })
    }

    booking.status = 'cancelled'
    await booking.save()

    return res.status(200).json({ success: true, message: 'Booking cancelled successfully.' })
  } catch (err) {
    console.error('Cancel booking error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to cancel booking.' })
  }
})

export default router
