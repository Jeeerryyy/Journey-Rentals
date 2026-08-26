import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Vehicle from '../models/Vehicle.js'
import Booking from '../models/Booking.js'
import Counter from '../models/Counter.js'
import Enquiry from '../models/Enquiry.js'
import OTP from '../models/OTP.js'
import Coupon from '../models/Coupon.js'
import PushSubscription from '../models/PushSubscription.js'

async function sanitizeDatabase() {
  try {
    await connectDB()
    console.log('MongoDB Connected for Sanitization')

    // 1. Check vehicles
    const vehicles = await Vehicle.find({}).lean()
    console.log(`Found ${vehicles.length} fleet vehicles intact.`)

    const swift = vehicles.find(v => (v.model && v.model.toLowerCase().includes('swift')) || (v.title && v.title.toLowerCase().includes('swift'))) || vehicles[0]
    console.log(`Linked Swift Vehicle: ${swift?.brand} ${swift?.model} (ID: ${swift?._id})`)

    // 2. Clear bookings and seed only the 1 canonical booking
    await Booking.deleteMany({})
    console.log('Cleaned all previous bookings.')

    const canonicalBooking = await Booking.create({
      referenceId: '00794577',
      userSnapshot: {
        name: 'Piyush Sokal',
        phone: '7057090787',
        email: 'piyushsokal1607@gmail.com',
      },
      vehicleId: swift._id,
      vehicleSnapshot: {
        brand: swift.brand || 'MARUTI',
        model: swift.model || 'SWIFT',
        category: swift.category || 'Hatchback',
        image: swift.image || swift.images?.[0] || '',
        type: 'car',
      },
      bookingType: 'car',
      pickupLocation: 'Solapur Station',
      pickupDate: new Date('2026-08-14T09:00:00.000Z'),
      returnDate: new Date('2026-08-16T18:00:00.000Z'),
      pickupTime: '09:00 AM',
      returnTime: '06:00 PM',
      totalDays: 2,
      totalPrice: 4600,
      advancePaid: 500,
      balanceDue: 4100,
      payment: {
        status: 'paid',
        paymentMethod: 'UPI / Online Advance',
        razorpayPaymentId: 'pay_launch_00794577',
      },
      documents: {
        aadharNumber: 'XXXX-XXXX-7057',
        licenseNumber: 'MH13-2022-7057090',
        aadharUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        licenseUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      },
      status: 'confirmed',
      createdAt: new Date('2026-08-14T08:30:00.000Z'),
      updatedAt: new Date('2026-08-14T08:35:00.000Z'),
    })

    console.log('Seeded canonical booking #00794577 for Piyush Sokal successfully.')

    // 3. Initialize Counter for sequential booking IDs starting from 1
    await Counter.deleteMany({})
    await Counter.create({ _id: 'booking_ref', seq: 1 })
    console.log('Initialized Counter with seq: 1')

    // 4. Clean other temporary collections
    await Enquiry.deleteMany({})
    await OTP.deleteMany({})
    await PushSubscription.deleteMany({})
    console.log('Sanitized enquiries, OTPs, and push subscriptions.')

    // 5. Ensure Promotional Coupons
    await Coupon.deleteMany({})
    await Coupon.insertMany([
      { code: 'SOLAPUR10', type: 'Percentage', value: 10, min_amount: 1500, expiry: new Date(Date.now() + 90 * 86400000), active: true },
      { code: 'DARSHAN200', type: 'Fixed', value: 200, min_amount: 2000, expiry: new Date(Date.now() + 60 * 86400000), active: true },
      { code: 'WEEKEND15', type: 'Percentage', value: 15, min_amount: 3000, expiry: new Date(Date.now() + 30 * 86400000), active: true },
    ])
    console.log('Initialized standard promotional coupons.')

    console.log('\n--- SANITIZATION SUMMARY ---')
    console.log(`Vehicles: ${await Vehicle.countDocuments()}`)
    console.log(`Bookings: ${await Booking.countDocuments()}`)
    console.log(`Coupons: ${await Coupon.countDocuments()}`)
    console.log(`Enquiries: ${await Enquiry.countDocuments()}`)
    console.log('All MongoDB collections cleanly sanitized and structured for new launch!')

    process.exit(0)
  } catch (err) {
    console.error('Sanitization failed:', err)
    process.exit(1)
  }
}

sanitizeDatabase()
