import crypto from 'crypto'
import Razorpay from 'razorpay'
import { connectDB } from '../config/db.js'
import Booking from '../models/Booking.js'
import Vehicle from '../models/Vehicle.js'
import PushSubscription from '../models/PushSubscription.js'
import { sendBookingConfirmationEmail, sendOwnerBookingNotificationEmail } from '../services/mailer.js'
import { sendOwnerWhatsAppNotification } from '../services/whatsapp.js'
import webpush from 'web-push'
import { trackEvent, trackError } from '../middleware/errorTracker.js'

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

const ADVANCE = 500

async function triggerBookingConfirmation(booking) {
  try {
    const ownerWhatsapp = process.env.OWNER_WHATSAPP;
    const vehicleName = booking.vehicleSnapshot ? `${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.model}` : 'Vehicle';
    const startDate = booking.bookingType === 'car' ? (booking.pickupDate ? booking.pickupDate.toISOString().split('T')[0] : '') : (booking.bikeDate ? booking.bikeDate.toISOString().split('T')[0] : '');
    const endDate = booking.bookingType === 'car' ? (booking.returnDate ? booking.returnDate.toISOString().split('T')[0] : '') : (booking.bikeDate ? booking.bikeDate.toISOString().split('T')[0] : '');
    
    const waMessage = encodeURIComponent(
      "Hi! My booking is confirmed on Journey Rentals.\nBooking ID: " + booking.referenceId + "\nVehicle: " + vehicleName + "\nFrom: " + startDate + " To: " + endDate + "\nName: " + booking.userSnapshot.name
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
        bookingId: booking.referenceId,
        waLink
      }).catch(err => console.error('Customer Mail Error:', err.message)),
      sendOwnerBookingNotificationEmail(ownerEmail, {
        customerName: booking.userSnapshot.name,
        customerPhone: booking.userSnapshot.phone,
        vehicleName,
        startDate,
        endDate,
        totalAmount: booking.totalPrice,
        bookingId: booking.referenceId,
        pickupLocation: booking.pickupLocation,
      }).catch(err => console.error(`Owner Mail Error to ${ownerEmail}:`, err.message)),
      sendOwnerWhatsAppNotification({
        customerName: booking.userSnapshot.name,
        customerPhone: booking.userSnapshot.phone,
        vehicleName,
        startDate,
        endDate,
        totalAmount: booking.totalPrice,
        bookingId: booking.referenceId,
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

export const createOrder = async (req, res) => {
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
    const referenceId = Date.now().toString().slice(-8)

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
}

export const verifyPayment = async (req, res) => {
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
}

export const getMyBookings = async (req, res) => {
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
}

export const cancelBooking = async (req, res) => {
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
}
