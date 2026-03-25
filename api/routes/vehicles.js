import { Router } from 'express'
import { connectDB } from '../lib/mongodb.js'
import Vehicle from '../lib/models/Vehicle.js'
import FleetSection from '../lib/models/FleetSection.js'

const router = Router()

// fetch all vehicles
router.get('/', async (req, res) => {
  try {
    await connectDB()

    const { type } = req.query
    const filter = {}
    if (type && ['car', 'bike'].includes(type)) {
      filter.type = type
    }

    const dbVehicles = await Vehicle
      .find(filter)
      .select('-__v')
      .lean()
      .exec()

    // Merge in FleetSection cars if type is 'car' or not specified
    let mergedVehicles = [...dbVehicles]
    
    if (!type || type === 'car') {
      const section = await FleetSection.findOne().lean()
      if (section && section.vehicles && section.vehicles.length > 0) {
        const fleetCars = section.vehicles.filter(v => v.isVisible).map(v => ({
          _id: v._id,
          type: 'car',
          brand: ['Swift', 'Ertiga'].includes(v.name) ? 'Maruti' : 
                 ['Venue', 'Aura'].includes(v.name) ? 'Hyundai' : 
                 v.name === 'Punch' ? 'Tata' : 
                 v.name === 'Seltos' ? 'Kia' : 'Unknown',
          model: v.name,
          year: 2023,
          category: v.category || 'SUV',
          transmission: v.transmission || 'Manual',
          fuelType: v.fuel || 'Petrol',
          sittingCapacity: parseInt(v.seats) || 5,
          pricePerDay: v.pricePerDay || 1500,
          isAvailable: true,
          image: v.image,
          images: [v.image],
          description: `Enjoy a premium self-drive experience.`,
          features: ['Air Conditioning', 'Power Steering', 'Music System'],
          locations: ['Solapur Station', 'Hotgi Road', 'Vijapur Road']
        }))
        
        // Add only if a vehicle with the same model doesn't already exist
        const existingModels = new Set(mergedVehicles.map(v => v.model))
        for (const fc of fleetCars) {
          if (!existingModels.has(fc.model)) {
            mergedVehicles.push(fc)
          }
        }
      }
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return res.status(200).json({ vehicles: mergedVehicles })
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

    let vehicle = await Vehicle.findById(req.params.id).select('-__v').lean()

    // If not found in main catalog, check FleetSection
    if (!vehicle) {
      const section = await FleetSection.findOne().lean()
      if (section && section.vehicles) {
        const fleetCar = section.vehicles.find(v => v._id.toString() === req.params.id)
        if (fleetCar) {
          vehicle = {
            _id: fleetCar._id,
            type: 'car',
            brand: ['Swift', 'Ertiga'].includes(fleetCar.name) ? 'Maruti' : 
                   ['Venue', 'Aura'].includes(fleetCar.name) ? 'Hyundai' : 
                   fleetCar.name === 'Punch' ? 'Tata' : 
                   fleetCar.name === 'Seltos' ? 'Kia' : 'Unknown',
            model: fleetCar.name,
            year: 2023,
            category: fleetCar.category || 'SUV',
            transmission: fleetCar.transmission || 'Manual',
            fuelType: fleetCar.fuel || 'Petrol',
            sittingCapacity: parseInt(fleetCar.seats) || 5,
            pricePerDay: fleetCar.pricePerDay || 1500,
            isAvailable: true,
            image: fleetCar.image,
            images: [fleetCar.image],
            description: `Enjoy a premium self-drive experience.`,
            features: ['Air Conditioning', 'Power Steering', 'Music System'],
            locations: ['Solapur Station', 'Hotgi Road', 'Vijapur Road']
          }
        }
      }
    }

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
