import { Router } from 'express'
import { connectDB } from '../config/db.js'
import Booking from '../models/Booking.js'
import Vehicle from '../models/Vehicle.js'
import Coupon from '../models/Coupon.js'
import Enquiry from '../models/Enquiry.js'
import Counter from '../models/Counter.js'
import { requireOwner } from '../middleware/auth.js'
import { createNotification } from '../services/notificationService.js'

const router = Router()

// All admin/CRM routes require valid owner authentication
router.use(requireOwner)

// All routes connect to MongoDB
router.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database connection failed' })
  }
})

// ══════════════════════════════════════════════════════════════
// 1. DASHBOARD ANALYTICS
// ══════════════════════════════════════════════════════════════
router.get('/dashboard', async (req, res) => {
  try {
    const [bookings, vehicles, enquiries] = await Promise.all([
      Booking.find({}).sort({ createdAt: -1 }).lean(),
      Vehicle.find({}).sort({ createdAt: -1 }).lean(),
      Enquiry.find({}).sort({ createdAt: -1 }).lean(),
    ])

    const totalBookings = bookings.length
    const confirmedList = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
    const totalGross = confirmedList.reduce((acc, b) => acc + (b.totalPrice || 0), 0)
    const totalAdvance = confirmedList.reduce((acc, b) => acc + (b.advancePaid != null ? b.advancePaid : (b.totalPrice || 0)), 0)
    const availableVehicles = vehicles.filter(v => v.isAvailable !== false).length
    const bookedVehicles = vehicles.length - availableVehicles
    const utilPct = vehicles.length > 0 ? Math.round((bookedVehicles / vehicles.length) * 100) : 0

    // Map actual enquiries from MongoDB
    const customerLeads = (enquiries || []).map((e) => ({
      id: e._id,
      reference_id: `ENQ-${e._id.toString().slice(-6).toUpperCase()}`,
      customer_name: e.customer_name,
      phone: e.phone,
      email: e.email || '',
      city: e.city || 'Solapur',
      car_model_interested: e.car_model_interested || 'Self-Drive Vehicle',
      source: e.source || 'Phone Call',
      status: e.status || 'New',
      total_price: 0,
      created_at: e.createdAt,
      notes: e.notes || '',
    }))

    res.json({
      success: true,
      stats: {
        bookings: { total: totalBookings, confirmed: confirmedList.length },
        vehicles: { total: vehicles.length, available: availableVehicles, booked: bookedVehicles },
        revenue: { totalGross, totalAdvance },
        utilization: utilPct,
      },
      bookings: bookings.slice(0, 10),
      customerLeads,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ══════════════════════════════════════════════════════════════
// 2. BOOKINGS MANAGEMENT
// ══════════════════════════════════════════════════════════════
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean()
    res.json({ success: true, bookings, data: bookings })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Manual Offline Reservation
router.post('/bookings/offline', async (req, res) => {
  try {
    const {
      vehicle_id, customer_name, customer_phone, customer_email,
      start_date, end_date, pickup_location, total_amount,
      payment_method, notes
    } = req.body

    const vehicle = await Vehicle.findById(vehicle_id).lean()
    let referenceId
    try {
      const counter = await Counter.findByIdAndUpdate(
        'booking_ref',
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      )
      referenceId = String(counter.seq)
    } catch {
      referenceId = Date.now().toString().slice(-6)
    }

    const newBooking = await Booking.create({
      referenceId,
      userSnapshot: {
        name: customer_name?.trim() || 'Offline Customer',
        phone: customer_phone?.trim() || '',
        email: customer_email?.trim() || '',
      },
      vehicleId: vehicle ? vehicle._id : undefined,
      vehicleSnapshot: vehicle ? {
        brand: vehicle.brand,
        model: vehicle.model,
        category: vehicle.category,
        image: vehicle.image,
        type: vehicle.type,
      } : { brand: 'Offline', model: 'Reservation', category: 'Car' },
      bookingType: vehicle?.type || 'car',
      pickupLocation: pickup_location || 'Solapur Railway Station (Main Hub)',
      pickupDate: start_date ? new Date(start_date) : new Date(),
      returnDate: end_date ? new Date(end_date) : new Date(),
      pickupTime: '10:00 AM',
      returnTime: '10:00 AM',
      totalDays: 1,
      totalPrice: Number(total_amount) || 0,
      advancePaid: Number(total_amount) || 0,
      balanceDue: 0,
      payment: {
        status: 'paid',
        paymentMethod: payment_method || 'Cash',
      },
      status: 'confirmed',
      notes: notes || '',
    })

    createNotification({
      type: 'booking',
      title: `Manual Booking #${newBooking.referenceId}`,
      message: `Offline booking for ${customer_name} (${newBooking.vehicleSnapshot?.brand} ${newBooking.vehicleSnapshot?.model}) • ₹${Number(total_amount).toLocaleString('en-IN')}`,
      link: '/admin/bookings',
      data: { bookingId: newBooking._id, referenceId: newBooking.referenceId }
    }).catch(() => {})

    res.status(201).json({ success: true, booking: newBooking })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Update booking status
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { status, notes } = req.body
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...(status ? { status } : {}), ...(notes !== undefined ? { notes } : {}) },
      { new: true }
    )
    if (!updated) return res.status(404).json({ success: false, error: 'Booking not found' })

    createNotification({
      type: 'booking',
      title: `Booking #${updated.referenceId} Updated`,
      message: `Reservation status changed to ${updated.status?.toUpperCase()}${notes ? ` (Note: ${notes})` : ''}`,
      link: '/admin/bookings',
      data: { bookingId: updated._id, referenceId: updated.referenceId, status: updated.status }
    }).catch(() => {})

    res.json({ success: true, booking: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Delete booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Booking deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ══════════════════════════════════════════════════════════════
// 3. FLEET MANAGEMENT
// ══════════════════════════════════════════════════════════════
router.get('/fleet', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 }).lean()
    res.json({ success: true, vehicles, data: vehicles })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/fleet', async (req, res) => {
  try {
    const newVehicle = await Vehicle.create(req.body)

    createNotification({
      type: 'fleet',
      title: `Fleet Added: ${newVehicle.brand} ${newVehicle.model}`,
      message: `New ${newVehicle.category || 'vehicle'} added to rental inventory (₹${newVehicle.pricePerDay || 0}/day).`,
      link: '/admin/fleet',
      data: { vehicleId: newVehicle._id }
    }).catch(() => {})

    res.status(201).json({ success: true, vehicle: newVehicle })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.patch('/fleet/:id', async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ success: false, error: 'Vehicle not found' })

    createNotification({
      type: 'fleet',
      title: `Fleet Updated: ${updated.brand} ${updated.model}`,
      message: `${updated.brand} ${updated.model} specs/availability (${updated.isAvailable !== false ? 'Available' : 'Unavailable'}) updated.`,
      link: '/admin/fleet',
      data: { vehicleId: updated._id }
    }).catch(() => {})

    res.json({ success: true, vehicle: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/fleet/:id', async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Vehicle deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ══════════════════════════════════════════════════════════════
// 4. COUPONS MANAGEMENT
// ══════════════════════════════════════════════════════════════
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean()
    const formatted = coupons.map(c => ({
      id: c._id,
      _id: c._id,
      code: c.code,
      type: c.type,
      value: c.value,
      min_amount: c.min_amount,
      expiry: c.expiry,
      active: c.active,
    }))
    res.json({ success: true, data: formatted, coupons: formatted })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/coupons', async (req, res) => {
  try {
    const created = await Coupon.create(req.body)

    createNotification({
      type: 'coupon',
      title: `Coupon Created: ${created.code}`,
      message: `Promo discount '${created.code}' (${created.type === 'Percentage' ? `${created.value}%` : `₹${created.value}`} OFF) is active.`,
      link: '/admin/coupons',
      data: { couponId: created._id, code: created.code }
    }).catch(() => {})

    res.status(201).json({
      success: true,
      data: {
        id: created._id,
        _id: created._id,
        code: created.code,
        type: created.type,
        value: created.value,
        min_amount: created.min_amount,
        expiry: created.expiry,
        active: created.active,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/coupons/:id', async (req, res) => {
  try {
    const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ success: false, error: 'Coupon not found' })

    createNotification({
      type: 'coupon',
      title: `Coupon Updated: ${updated.code}`,
      message: `Promo code '${updated.code}' terms modified (${updated.active ? 'Active' : 'Disabled'}).`,
      link: '/admin/coupons',
      data: { couponId: updated._id, code: updated.code }
    }).catch(() => {})

    res.json({
      success: true,
      data: {
        id: updated._id,
        _id: updated._id,
        code: updated.code,
        type: updated.type,
        value: updated.value,
        min_amount: updated.min_amount,
        expiry: updated.expiry,
        active: updated.active,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/coupons/all', async (req, res) => {
  try {
    await Coupon.deleteMany({})
    res.json({ success: true, message: 'All coupons deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Coupon deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ══════════════════════════════════════════════════════════════
// 5. ENQUIRIES MANAGEMENT
// ══════════════════════════════════════════════════════════════
router.get('/enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 }).lean()
    const formatted = enquiries.map(e => ({
      id: e._id,
      customer_name: e.customer_name,
      phone: e.phone,
      email: e.email || '',
      city: e.city || 'Solapur',
      car_model_interested: e.car_model_interested,
      source: e.source,
      status: e.status,
      notes: e.notes,
      createdAt: e.createdAt,
    }))
    res.json({ success: true, data: formatted, items: formatted, total_enquiries: formatted.length })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/enquiries', async (req, res) => {
  try {
    const created = await Enquiry.create(req.body)

    createNotification({
      type: 'lead',
      title: `New Lead: ${created.customer_name}`,
      message: `Interested in ${created.car_model_interested || 'Rental'} • ${created.phone} (${created.city || 'Solapur'})`,
      link: '/admin',
      data: { leadId: created._id, name: created.customer_name }
    }).catch(() => {})

    res.status(201).json({
      success: true,
      data: {
        id: created._id,
        customer_name: created.customer_name,
        phone: created.phone,
        email: created.email,
        city: created.city,
        car_model_interested: created.car_model_interested,
        source: created.source,
        status: created.status,
        notes: created.notes,
        createdAt: created.createdAt,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.patch('/enquiries/:id', async (req, res) => {
  try {
    const updated = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ success: false, error: 'Enquiry not found' })

    createNotification({
      type: 'lead',
      title: `Lead Updated: ${updated.customer_name}`,
      message: `Inquiry status changed to '${updated.status}' (${updated.car_model_interested || 'Vehicle'}).`,
      link: '/admin',
      data: { leadId: updated._id, name: updated.customer_name, status: updated.status }
    }).catch(() => {})

    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/enquiries/:id', async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Enquiry deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
