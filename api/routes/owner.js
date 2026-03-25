import { Router } from 'express'
import cloudinary from '../lib/cloudinary.js'
import { connectDB } from '../lib/mongodb.js'
import Booking from '../lib/models/Booking.js'
import Vehicle from '../lib/models/Vehicle.js'
import User from '../lib/models/User.js'
import FleetSection from '../lib/models/FleetSection.js'
import { requireOwner } from '../lib/auth.js'

const router = Router()

// All owner routes require owner authentication
router.use(requireOwner)



const uploadBase64 = (base64String, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64String,
      {
        folder,
        public_id:     `vehicle_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
  })
}

// ── POST /api/owner/upload/images ──
const MAX_IMAGES = 10
const MAX_BASE64_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_MIME = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/

router.post('/upload/images', async (req, res) => {
  try {
    const { images } = req.body
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Array of images is required.' })
    }
    if (images.length > MAX_IMAGES) {
      return res.status(400).json({ error: `Maximum ${MAX_IMAGES} images allowed per upload.` })
    }
    for (const img of images) {
      if (typeof img !== 'string' || !ALLOWED_IMAGE_MIME.test(img)) {
        return res.status(400).json({ error: 'Invalid image format. Accepted: JPEG, PNG, WebP, GIF.' })
      }
      if (img.length > MAX_BASE64_SIZE) {
        return res.status(400).json({ error: 'Each image must be under 5MB.' })
      }
    }

    const uploadPromises = images.map(img => uploadBase64(img, 'journey-rentals/vehicles'))
    const results = await Promise.all(uploadPromises)
    const urls = results.map(r => r.secure_url)

    return res.status(200).json({ success: true, urls })
  } catch (error) {
    console.error('Owner multi-image upload error:', error.message)
    return res.status(500).json({ error: 'Image upload failed. Please try again.' })
  }
})

// ── GET /api/owner/dashboard ──
router.get('/dashboard', async (req, res) => {
  try {
    await connectDB()

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalVehicles,
      availableVehicles,
      totalUsers,
      recentBookings,
      revenue
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ isAvailable: true }),
      User.countDocuments({ role: 'customer' }),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('referenceId vehicleSnapshot userSnapshot status totalPrice createdAt'),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$advancePaid' } } }
      ])
    ])

    return res.status(200).json({
      success: true,
      stats: {
        bookings: {
          total:     totalBookings,
          pending:   pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        vehicles: {
          total:     totalVehicles,
          available: availableVehicles,
          unavailable: totalVehicles - availableVehicles,
        },
        users: {
          total: totalUsers,
        },
        revenue: {
          totalAdvance: revenue[0]?.total || 0,
        }
      },
      recentBookings
    })
  } catch (error) {
    console.error('Dashboard error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch dashboard data.' })
  }
})

// ── GET /api/owner/vehicles ──
router.get('/vehicles', async (req, res) => {
  try {
    await connectDB()

    const vehicles = await Vehicle.find().sort({ createdAt: -1 }).select('-__v').lean()
    return res.status(200).json({
      success: true,
      count:   vehicles.length,
      vehicles
    })
  } catch (error) {
    console.error('Owner vehicles error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch vehicles.' })
  }
})

// ── POST /api/owner/vehicles ──
router.post('/vehicles', async (req, res) => {
  try {
    await connectDB()

    const {
      type, brand, model, year, category,
      transmission, fuelType, sittingCapacity,
      pricePerDay, bikeSlots, description,
      features, locations, isAvailable, 
      image, images // Fallback for single image, but prefer images array
    } = req.body

    const finalImages = images && images.length > 0 ? images : (image ? [image] : [])

    if (!type || !brand || !model || !year || finalImages.length === 0) {
      return res.status(400).json({ error: 'type, brand, model, year and at least one image are required.' })
    }

    const vehicle = await Vehicle.create({
      type, brand, model,
      year:            Number(year),
      category,
      transmission,
      fuelType,
      sittingCapacity: Number(sittingCapacity),
      pricePerDay:     pricePerDay ? Number(pricePerDay) : undefined,
      bikeSlots,
      description,
      features:        features  || [],
      locations:       locations || [],
      image:           finalImages[0], // Keep for backwards compatibility
      images:          finalImages,
      isAvailable:     isAvailable ?? true
    })

    return res.status(201).json({
      success: true,
      message: `${brand} ${model} added successfully.`,
      vehicle
    })
  } catch (error) {
    console.error('Owner add vehicle error:', error.message)
    return res.status(500).json({ error: 'Failed to add vehicle.' })
  }
})

// ── PATCH /api/owner/vehicles-item/:id ──
const ALLOWED_VEHICLE_FIELDS = [
  'brand', 'model', 'year', 'category', 'transmission', 'fuelType',
  'sittingCapacity', 'pricePerDay', 'description', 'isAvailable',
  'images', 'image', 'features', 'locations', 'bikeSlots', 'type'
]

router.patch('/vehicles-item/:id', async (req, res) => {
  try {
    await connectDB()

    // Allowlist: only permit known vehicle fields
    const updates = {}
    for (const key of ALLOWED_VEHICLE_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    )
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' })
    }
    return res.status(200).json({
      success: true,
      message: 'Vehicle updated.',
      vehicle
    })
  } catch (error) {
    console.error('Vehicle update error:', error.message)
    return res.status(500).json({ error: 'Vehicle update failed.' })
  }
})

// ── DELETE /api/owner/vehicles-item/:id ──
router.delete('/vehicles-item/:id', async (req, res) => {
  try {
    await connectDB()

    const vehicle = await Vehicle.findByIdAndDelete(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' })
    }
    return res.status(200).json({
      success: true,
      message: `${vehicle.brand} ${vehicle.model} deleted.`
    })
  } catch (error) {
    console.error('Vehicle delete error:', error.message)
    return res.status(500).json({ error: 'Failed to delete vehicle.' })
  }
})

// ── GET /api/owner/bookings ──
router.get('/bookings', async (req, res) => {
  try {
    await connectDB()

    const { status, page = 1, limit = 20 } = req.query
    const filter = status ? { status } : {}
    const skip   = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter)
    ])

    return res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / limit),
      bookings
    })
  } catch (error) {
    console.error('Owner bookings error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch bookings.' })
  }
})

// ── GET /api/owner/bookings/:id ──
router.get('/bookings/:id', async (req, res) => {
  try {
    await connectDB()

    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' })
    }
    return res.status(200).json({ success: true, booking })
  } catch (error) {
    console.error('Get booking error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch booking.' })
  }
})

// ── PATCH /api/owner/bookings/:id ──
router.patch('/bookings/:id', async (req, res) => {
  try {
    await connectDB()

    const { status } = req.body
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled']
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' })
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' })
    }

    return res.status(200).json({
      success: true,
      message: `Booking marked as ${status}.`,
      booking
    })
  } catch (error) {
    console.error('Update booking error:', error.message)
    return res.status(500).json({ error: 'Failed to update booking.' })
  }
})

// Default fleet vehicles — seeded on first access
const DEFAULT_FLEET_VEHICLES = [
  { name: 'Swift',  category: 'Hatchback', seats: '5', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 1500, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 0 },
  { name: 'Ertiga', category: 'MPV',       seats: '7', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 2500, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 1 },
  { name: 'Venue',  category: 'SUV',       seats: '5', fuel: 'Petrol', transmission: 'Automatic', pricePerDay: 2000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 2 },
  { name: 'Aura',   category: 'Sedan',     seats: '5', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 1800, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 3 },
  { name: 'Punch',  category: 'Mini SUV',  seats: '5', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 1700, image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 4 },
  { name: 'Seltos', category: 'SUV',       seats: '5', fuel: 'Petrol', transmission: 'Automatic', pricePerDay: 2800, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 5 },
]

// ── GET /api/owner/fleet-section ──
router.get('/fleet-section', async (req, res) => {
  try {
    await connectDB()
    let section = await FleetSection.findOne()
    if (!section) {
      section = await FleetSection.create({
        heading: 'Our Fleet',
        subheading: 'Best Self-Drive Rentals',
        vehicles: DEFAULT_FLEET_VEHICLES
      })
    } else if (!section.vehicles || section.vehicles.length === 0) {
      section.vehicles = DEFAULT_FLEET_VEHICLES
      await section.save()
    }
    return res.status(200).json({ success: true, section })
  } catch (error) {
    console.error('Get fleet section error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch fleet section.' })
  }
})

// ── PUT /api/owner/fleet-section ──
router.put('/fleet-section', async (req, res) => {
  try {
    await connectDB()
    const { heading, subheading, vehicles } = req.body

    let section = await FleetSection.findOne()
    if (!section) {
      section = new FleetSection({})
    }

    if (heading !== undefined) section.heading = heading
    if (subheading !== undefined) section.subheading = subheading
    if (vehicles !== undefined) section.vehicles = vehicles

    await section.save()
    return res.status(200).json({ success: true, message: 'Fleet section updated.', section })
  } catch (error) {
    console.error('Update fleet section error:', error.message)
    return res.status(500).json({ error: 'Failed to update fleet section.' })
  }
})

export default router
