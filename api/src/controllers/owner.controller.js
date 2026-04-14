import cloudinary from '../config/cloudinary.js'
import { connectDB } from '../config/db.js'
import Booking from '../models/Booking.js'
import Vehicle from '../models/Vehicle.js'
import User from '../models/User.js'
import FleetSection from '../models/FleetSection.js'
import { fileTypeFromBuffer } from 'file-type'

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

const MAX_IMAGES = 10
const MAX_BASE64_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_MIME = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/

export const uploadVehicleImages = async (req, res) => {
  try {
    const { images } = req.body
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of images is required.' })
    }
    if (images.length > MAX_IMAGES) {
      return res.status(400).json({ success: false, error: `Maximum ${MAX_IMAGES} images allowed per upload.` })
    }
    for (const img of images) {
      if (typeof img !== 'string' || !ALLOWED_IMAGE_MIME.test(img)) {
        return res.status(400).json({ success: false, error: 'Invalid image format. Accepted: JPEG, PNG, WebP, GIF.' })
      }
      if (img.length > MAX_BASE64_SIZE) {
        return res.status(400).json({ success: false, error: 'Each image must be under 5MB.' })
      }
      const base64Data = img.split(',')[1]
      if (base64Data) {
        const type = await fileTypeFromBuffer(Buffer.from(base64Data, 'base64'))
        if (!type || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type.mime)) {
          return res.status(400).json({ success: false, error: 'Corrupt or invalid image content.' })
        }
      }
    }

    const uploadPromises = images.map(img => uploadBase64(img, 'journey-rentals/vehicles'))
    const results = await Promise.all(uploadPromises)
    const urls = results.map(r => r.secure_url)

    return res.status(200).json({ success: true, urls })
  } catch (err) {
    console.error('Owner multi-image upload error:', err.message)
    return res.status(500).json({ success: false, error: 'Image upload failed. Please try again.' })
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    await connectDB()

    // Start of current month for "this month" queries
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

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
      revenue,
      monthlyBookings,
      monthlyRevenue
    ] = await Promise.all([
      Booking.countDocuments({ status: { $ne: 'pending' } }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ isAvailable: true }),
      User.countDocuments({ role: 'customer' }),
      Booking.find({ status: { $ne: 'pending' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('referenceId vehicleSnapshot userSnapshot status totalPrice createdAt'),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$advancePaid' } } }
      ]),
      // This month's bookings count
      Booking.countDocuments({
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: monthStart }
      }),
      // This month's revenue (advance collected)
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] }, createdAt: { $gte: monthStart } } },
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
          thisMonth: monthlyRevenue[0]?.total || 0,
        },
        monthly: {
          bookings: monthlyBookings,
        }
      },
      recentBookings
    })
  } catch (error) {
    console.error('Dashboard error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch dashboard data.' })
  }
}

export const getVehicles = async (req, res) => {
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
}

export const createVehicle = async (req, res) => {
  try {
    await connectDB()

    const {
      type, brand, model, year, category,
      transmission, fuelType, sittingCapacity,
      pricePerDay, bikeSlots, description,
      features, locations, isAvailable, 
      image, images // Fallback for single image
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
}

const ALLOWED_VEHICLE_FIELDS = [
  'brand', 'model', 'year', 'category', 'transmission', 'fuelType',
  'sittingCapacity', 'pricePerDay', 'description', 'isAvailable',
  'images', 'image', 'features', 'locations', 'bikeSlots', 'type'
]

export const updateVehicle = async (req, res) => {
  try {
    await connectDB()

    // Allowlist
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
}

export const deleteVehicle = async (req, res) => {
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
}

export const toggleVehicleVisibility = async (req, res) => {
  try {
    await connectDB()

    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' })
    }

    vehicle.isAvailable = !vehicle.isAvailable
    await vehicle.save()

    return res.status(200).json({
      success: true,
      message: `${vehicle.brand} ${vehicle.model} is now ${vehicle.isAvailable ? 'visible' : 'hidden'}.`,
      vehicle
    })
  } catch (error) {
    console.error('Vehicle visibility toggle error:', error.message)
    return res.status(500).json({ error: 'Failed to update vehicle visibility.' })
  }
}

export const getBookings = async (req, res) => {
  try {
    await connectDB()

    const { status, cursor, limit = 20 } = req.query
    const pageLimit = Math.min(Number(limit) || 20, 100)
    const filter = { status: { $ne: 'pending' } }

    if (status && ['confirmed', 'completed', 'cancelled'].includes(status)) {
      filter.status = status
    }

    if (cursor) {
      filter._id = { $lt: cursor }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ _id: -1 })
        .limit(pageLimit + 1) // fetch one extra to check if there's a next page
        .select('-__v')
        .lean(),
      Booking.countDocuments(status && status !== 'pending' ? { status } : { status: { $ne: 'pending' } }),
    ])

    const hasMore = bookings.length > pageLimit
    if (hasMore) bookings.pop() // remove the extra

    const nextCursor = hasMore ? bookings[bookings.length - 1]._id : null

    return res.status(200).json({
      success: true,
      total,
      bookings,
      nextCursor,
      hasMore,
    })
  } catch (err) {
    console.error('Owner bookings error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch bookings.' })
  }
}

export const searchBooking = async (req, res) => {
  try {
    await connectDB()
    const refId = req.params.refId
    if (!refId || !/^[A-Za-z0-9]{1,20}$/.test(refId)) {
      return res.status(400).json({ success: false, error: 'Invalid booking reference.' })
    }
    const booking = await Booking.findOne({ referenceId: { $regex: `^${refId}$`, $options: 'i' } })
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }
    return res.status(200).json({ success: true, booking })
  } catch (error) {
    console.error('Search booking error:', error.message)
    return res.status(500).json({ error: 'Failed to search booking.' })
  }
}

export const getBookingById = async (req, res) => {
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
}

export const updateBookingStatus = async (req, res) => {
  try {
    await connectDB()

    const { status, extensionStatus } = req.body
    
    const updateData = {}
    
    if (status) {
      const allowed = ['pending', 'confirmed', 'completed', 'cancelled']
      if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status value.' })
      updateData.status = status
    }

    if (extensionStatus) {
      const allowedExt = ['none', 'pending', 'approved', 'rejected']
      if (!allowedExt.includes(extensionStatus)) return res.status(400).json({ error: 'Invalid extension value.' })
      updateData.extensionStatus = extensionStatus
      if (extensionStatus === 'approved') updateData.extensionRequested = false // Reset requested flag once approved
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
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
}

export const uploadBookingPhoto = async (req, res) => {
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ success: false, error: 'Image is required.' })
    }

    if (typeof image !== 'string' || !ALLOWED_IMAGE_MIME.test(image)) {
      return res.status(400).json({ success: false, error: 'Invalid image format.' })
    }
    const base64Data = image.split(',')[1]
    if (base64Data) {
      const type = await fileTypeFromBuffer(Buffer.from(base64Data, 'base64'))
      if (!type || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type.mime)) {
        return res.status(400).json({ success: false, error: 'Corrupt or invalid image content.' })
      }
    }

    await connectDB()
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }

    const filePrefix = `booking_${booking.referenceId}_${Date.now()}`
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        image,
        {
          folder: 'journey-rentals/admin-attachments',
          public_id: filePrefix,
          resource_type: 'auto'
        },
        (error, res) => {
          if (error) reject(error)
          else resolve(res)
        }
      )
    })

    booking.adminPhotoWithVehicleUrl = result.secure_url
    await booking.save()

    return res.status(200).json({
      success: true,
      message: 'Photo attached to booking.',
      url: result.secure_url
    })
  } catch (err) {
    console.error('Booking photo upload error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to upload photo.' })
  }
}

export const deleteBookingPhoto = async (req, res) => {
  try {
    await connectDB()
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }

    booking.adminPhotoWithVehicleUrl = undefined
    await booking.save()

    return res.status(200).json({ success: true, message: 'Photo removed from booking.' })
  } catch (err) {
    console.error('Booking photo delete error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to delete photo.' })
  }
}

const DEFAULT_FLEET_VEHICLES = [
  { name: 'Swift',  category: 'Hatchback', seats: '5', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 1500, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 0 },
  { name: 'Ertiga', category: 'MPV',       seats: '7', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 2500, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 1 },
  { name: 'Venue',  category: 'SUV',       seats: '5', fuel: 'Petrol', transmission: 'Automatic', pricePerDay: 2000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 2 },
  { name: 'Aura',   category: 'Sedan',     seats: '5', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 1800, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 3 },
  { name: 'Punch',  category: 'Mini SUV',  seats: '5', fuel: 'CNG',    transmission: 'Manual',    pricePerDay: 1700, image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 4 },
  { name: 'Seltos', category: 'SUV',       seats: '5', fuel: 'Petrol', transmission: 'Automatic', pricePerDay: 2800, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80', isFeatured: false, isVisible: true, order: 5 },
]

export const getFleetSection = async (req, res) => {
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
}

export const updateFleetSection = async (req, res) => {
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
}
