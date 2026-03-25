import { Router } from 'express'
import { connectDB } from '../_lib/mongodb.js'
import Vehicle from '../_lib/models/Vehicle.js'

const router = Router()

// fetch all vehicles
router.get('/', async (req, res) => {
  try {
    await connectDB()

    const { type } = req.query
    const filter = { isAvailable: true }
    if (type && ['car', 'bike'].includes(type)) {
      filter.type = type
    }

    const dbVehicles = await Vehicle
      .find(filter)
      .select('-__v')
      .lean()
      .exec()

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return res.status(200).json({ vehicles: dbVehicles })
  } catch (err) {
    console.error('vehicles/index error:', err)
    return res.status(500).json({ error: 'Failed to fetch vehicles.' })
  }
})

// fetch fleet section (public — visible vehicles only)
router.get('/fleet-section', async (req, res) => {
  try {
    await connectDB()
    let section = await FleetSection.findOne().lean()
    if (!section) {
      return res.status(200).json({ section: { heading: 'Our Fleet', subheading: 'Best Self-Drive Rentals', vehicles: [] } })
    }
    section.vehicles = (section.vehicles || [])
      .filter(v => v.isVisible)
      .sort((a, b) => a.order - b.order)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.status(200).json({ section })
  } catch (err) {
    console.error('fleet-section error:', err)
    return res.status(500).json({ error: 'Failed to fetch fleet section.' })
  }
})

// fetch single vehicle
router.get('/:id', async (req, res) => {
  try {
    await connectDB()

    const vehicle = await Vehicle.findById(req.params.id).select('-__v').lean()

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' })
    }

    return res.status(200).json({
      success: true,
      vehicle
    })
  } catch (error) {
    console.error('Get vehicle error:', error)
    return res.status(500).json({ error: 'Failed to fetch vehicle.' })
  }
})

export default router
