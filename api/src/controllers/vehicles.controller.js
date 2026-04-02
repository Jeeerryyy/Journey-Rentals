import { connectDB } from '../config/db.js'
import Vehicle from '../models/Vehicle.js'
import FleetSection from '../models/FleetSection.js'

export const getVehicles = async (req, res) => {
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

    return res.status(200).json({ success: true, vehicles: dbVehicles })
  } catch (err) {
    console.error('vehicles/index error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch vehicles.' })
  }
}

export const getFleetSection = async (req, res) => {
  try {
    await connectDB()
    let section = await FleetSection.findOne().lean()
    if (!section) {
      return res.status(200).json({ success: true, section: { heading: 'Our Fleet', subheading: 'Best Self-Drive Rentals', vehicles: [] } })
    }
    section.vehicles = (section.vehicles || [])
      .filter(v => v.isVisible)
      .sort((a, b) => a.order - b.order)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.status(200).json({ success: true, section })
  } catch (err) {
    console.error('fleet-section error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch fleet section.' })
  }
}

export const getVehicleById = async (req, res) => {
  try {
    await connectDB()

    const vehicle = await Vehicle.findById(req.params.id).select('-__v').lean()

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' })
    }

    return res.status(200).json({ success: true, vehicle })
  } catch (err) {
    console.error('Get vehicle error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch vehicle.' })
  }
}
