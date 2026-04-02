import { Router } from 'express'
import { getVehicles, getFleetSection, getVehicleById } from '../controllers/vehicles.controller.js'

const router = Router()

// fetch all available vehicles
router.get('/', getVehicles)

// fetch fleet section (public — visible vehicles only)
router.get('/fleet-section', getFleetSection)

// fetch single vehicle
router.get('/:id', getVehicleById)

export default router
