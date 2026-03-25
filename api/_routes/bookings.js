import { Router } from 'express'
import { connectDB } from '../_lib/mongodb.js'
import Booking from '../_lib/models/Booking.js'
import Vehicle from '../_lib/models/Vehicle.js'
import User from '../_lib/models/User.js'
import { requireAuth } from '../_lib/auth.js'

const router = Router()

// ── POST /api/bookings/create-order ──
// Creates a booking and returns the booking details
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    await connectDB()

    const {
      customerInfo,
      vehicleId, bookingType, pickupLocation,
      pickupDate, returnDate, totalDays,
      bikeDate, bikeSlot,
      totalPrice, documents,
    } = req.body

    // Basic required fields
    if (!vehicleId || !bookingType || !totalPrice) {
      return res.status(400).json({ error: 'vehicleId, bookingType and totalPrice are required.' })
    }

    // Phone is mandatory — collected so the owner can contact the customer
    const phone = customerInfo?.phone?.toString().trim() || ''
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'A valid 10-digit contact phone number is required.' })
    }

    let vehicle = await Vehicle.findById(vehicleId)

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' })
    if (!vehicle.isAvailable) return res.status(400).json({ error: 'Vehicle is not available.' })

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const advancePaid = Math.min(500, totalPrice)
    const balanceDue  = totalPrice - advancePaid

    const referenceId = `JR${Math.floor(100000 + Math.random() * 900000)}`

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 45)

    const booking = await Booking.create({
      referenceId,
      userId:         req.user.userId,
      vehicleId,
      bookingType,
      status:         'pending',
      pickupLocation: pickupLocation || '',

      pickupDate: bookingType === 'car' && pickupDate ? new Date(pickupDate) : undefined,
      returnDate: bookingType === 'car' && returnDate ? new Date(returnDate) : undefined,
      totalDays:  bookingType === 'car' ? totalDays   : undefined,

      bikeDate: bookingType === 'bike' && bikeDate ? new Date(bikeDate) : undefined,
      bikeSlot: bookingType === 'bike' ? bikeSlot   : undefined,

      totalPrice,
      advancePaid,
      balanceDue,

      documents: documents || {},

      userSnapshot: {
        name:  customerInfo?.name  || 'Customer',
        email: customerInfo?.email || req.user.email || 'No email provided',
        phone: phone,
      },
      vehicleSnapshot: {
        brand:    vehicle.brand,
        model:    vehicle.model,
        type:     vehicle.type,
        category: vehicle.category,
        image:    vehicle.image,
      },

      expiresAt,
    })

    return res.status(201).json({
      success: true,
      bookingDetails: {
        _id:         booking._id,
        referenceId: booking.referenceId,
        status:      booking.status,
        totalPrice:  booking.totalPrice,
        advancePaid: booking.advancePaid,
        balanceDue:  booking.balanceDue,
      },
    })
  } catch (err) {
    console.error('[create-order] error:', err.message)
    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors).join(', ')
      return res.status(400).json({ error: `Validation failed on fields: ${fields}` })
    }
    return res.status(500).json({ error: 'Failed to create booking. Please try again.' })
  }
})

// ── GET /api/bookings/mine ──
// Returns all bookings for the logged-in customer
router.get('/mine', requireAuth, async (req, res) => {
  try {
    await connectDB()

    const bookings = await Booking
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean()
      .exec()

    return res.status(200).json({ success: true, bookings })
  } catch (err) {
    console.error('[bookings/mine] error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch bookings.' })
  }
})

// ── PATCH /api/bookings/cancel ──
// Cancels a booking by ID (only if owned by the logged-in user)
router.patch('/cancel', requireAuth, async (req, res) => {
  try {
    await connectDB()

    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Booking ID is required.' })
    }

    const booking = await Booking.findOne({ _id: id, userId: req.user.userId })

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' })
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled.' })
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed booking.' })
    }

    booking.status = 'cancelled'
    await booking.save()

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    })
  } catch (err) {
    console.error('[bookings/cancel] error:', err.message)
    return res.status(500).json({ error: 'Failed to cancel booking.' })
  }
})

// ── POST /api/bookings/verify-payment ──
// Razorpay payment verification — not yet integrated.
// When Razorpay is added, verify the signature here before marking the booking as paid.
router.post('/verify-payment', requireAuth, async (req, res) => {
  try {
    return res.status(501).json({
      success: false,
      message: 'Razorpay payment verification is not yet implemented.'
    })
  } catch (err) {
    console.error('[verify-payment] error:', err.message)
    return res.status(500).json({ error: 'Payment verification failed.' })
  }
})

export default router
