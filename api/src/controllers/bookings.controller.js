import crypto from 'crypto'
import Razorpay from 'razorpay'
import { connectDB } from '../config/db.js'
import Booking from '../models/Booking.js'
import Vehicle from '../models/Vehicle.js'
import User from '../models/User.js'
import Coupon from '../models/Coupon.js'
import Counter from '../models/Counter.js'
import PushSubscription from '../models/PushSubscription.js'
import { sendBookingConfirmationEmail, sendOwnerBookingNotificationEmail } from '../services/mailer.js'
import { sendOwnerWhatsAppNotification } from '../services/whatsapp.js'
import webpush from 'web-push'
import { trackEvent, trackError } from '../middleware/errorTracker.js'
import { createNotification } from '../services/notificationService.js'

// ── Razorpay SDK instantiation ──
export const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret) {
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return null;
};

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

    // ── Save system notification for CRM Notification Center ──
    const custName = booking.userSnapshot?.name || 'Customer';
    createNotification({
      type: 'booking',
      title: `New Reservation #${booking.referenceId}`,
      message: `${custName} booked ${vehicleName} • ₹${Number(booking.totalPrice || 0).toLocaleString('en-IN')}`,
      link: '/admin/bookings',
      data: { bookingId: booking._id, referenceId: booking.referenceId, customer: custName },
    }).catch(() => {});

    if (booking.documents && (booking.documents.aadharUrl || booking.documents.licenseUrl || booking.documents.aadharNumber || booking.documents.licenseNumber)) {
      createNotification({
        type: 'kyc',
        title: `KYC Submitted #${booking.referenceId}`,
        message: `${custName} uploaded identity / license documentation for verification.`,
        link: '/admin/bookings',
        data: { bookingId: booking._id, referenceId: booking.referenceId },
      }).catch(() => {});
    }

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

    if (!pickupLocation || !String(pickupLocation).trim()) {
      return res.status(400).json({ success: false, error: 'Pickup Hub location is mandatory.' })
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId).lean()
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' })
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ success: false, error: 'This vehicle is currently unavailable.' })
    }

    // ── Server-side Price Verification (OWASP A06 Protection) ──
    const days = bookingType === 'car' ? Math.max(1, Number(totalDays) || 1) : 1
    let serverGross = 0
    if (bookingType === 'bike') {
      serverGross = (vehicle.bikeSlots && (vehicle.bikeSlots[`price${bikeSlot}`] || vehicle.bikeSlots[bikeSlot] || vehicle.bikeSlots.price24hr || vehicle.bikeSlots.price12hr)) || (vehicle.hourlyRates && vehicle.hourlyRates[bikeSlot]) || vehicle.pricePerDay || 499
    } else {
      serverGross = (vehicle.pricePerDay || 2000) * days
    }

    let serverDiscount = 0
    const couponCode = req.body.couponApplied || req.body.couponCode
    if (couponCode) {
      const couponDoc = await Coupon.findOne({ code: String(couponCode).trim().toUpperCase(), active: true }).lean()
      if (couponDoc && (!couponDoc.expiry || new Date(couponDoc.expiry) > new Date())) {
        if (serverGross >= (couponDoc.min_amount || 0)) {
          serverDiscount = couponDoc.type === 'Percentage'
            ? Math.round((serverGross * couponDoc.value) / 100)
            : couponDoc.value
        }
      }
    }

    const finalTotalPrice = Math.max(100, serverGross - serverDiscount)
    const advanceAmount = Math.min(ADVANCE, finalTotalPrice)

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

    let userId = req.user?.userId || req.user?.id || ''
    if (!userId && customerInfo.email) {
      const existingUser = await User.findOne({ email: customerInfo.email.toLowerCase() }).lean()
      if (existingUser) userId = existingUser._id.toString()
    }
    if (!userId && customerInfo.phone) {
      const existingUser = await User.findOne({ phone: customerInfo.phone }).lean()
      if (existingUser) userId = existingUser._id.toString()
    }

    // ── Build booking document ──
    const bookingData = {
      referenceId,
      userId: userId || undefined,
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
      totalPrice:  finalTotalPrice,
      advancePaid: advanceAmount,
      balanceDue:  finalTotalPrice - advanceAmount,
      documents: {
        aadharUrl:     String(documents?.aadharUrl || ''),
        licenseUrl:    String(documents?.licenseUrl || ''),
        aadharNumber:  String(documents?.aadharNumber || req.body.customerInfo?.aadhar || ''),
        licenseNumber: String(documents?.licenseNumber || req.body.customerInfo?.drivingLicense || ''),
      },
      status: 'pending',
    }

    // ── Razorpay order creation ──
    const rzp = getRazorpayInstance()
    if (rzp) {
      const rzpOrder = await rzp.orders.create({
        amount:   Math.round(advanceAmount * 100), // Razorpay uses paise
        currency: 'INR',
        receipt:  `rcpt_${String(referenceId).slice(-30)}`,
        notes:    { vehicleId: vehicle._id.toString(), bookingType, referenceId: String(referenceId) },
      })

      bookingData.payment = {
        razorpayOrderId: rzpOrder.id,
        status: 'pending',
      }

      const booking = await Booking.create(bookingData)

      // Notify CRM immediately of new website booking
      const vName = `${vehicle.brand} ${vehicle.model}`
      const cName = String(customerInfo.name || 'Customer').trim()
      createNotification({
        type: 'booking',
        title: `New Web Reservation #${booking.referenceId}`,
        message: `${cName} reserved ${vName} (${booking.pickupLocation || 'Solapur'}) • ₹${Number(booking.totalPrice || 0).toLocaleString('en-IN')}`,
        link: '/admin/bookings',
        data: {
          bookingId: booking._id,
          referenceId: booking.referenceId,
          customer: cName,
          status: booking.status,
          vehicle: vName,
        }
      }).catch(() => {})

      if (booking.documents && (booking.documents.aadharUrl || booking.documents.licenseUrl || booking.documents.aadharNumber || booking.documents.licenseNumber)) {
        createNotification({
          type: 'kyc',
          title: `KYC Submitted #${booking.referenceId}`,
          message: `${cName} uploaded identity verification documents.`,
          link: '/admin/bookings',
          data: { bookingId: booking._id, referenceId: booking.referenceId },
        }).catch(() => {})
      }

      return res.status(201).json({
        success: true,
        booking,
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
          keyId:    process.env.RAZORPAY_KEY_ID || 'rzp_live_SVnQN5zASbc3XW',
        },
      })
    }

    // ── Fallback: no Razorpay configured — direct booking ──
    bookingData.status = 'confirmed'
    bookingData.payment = { status: 'paid' }
    const booking = await Booking.create(bookingData)

    trackEvent('booking_created', { bookingId: booking._id, userId: req.user?.userId || userId, type: bookingType, amount: totalPrice })
    await triggerBookingConfirmation(booking)

    return res.status(201).json({
      success: true,
      booking,
      bookingDetails: {
        bookingId:   booking._id,
        referenceId: booking.referenceId,
        totalPrice:  booking.totalPrice,
        advancePaid: booking.advancePaid,
      },
    })
  } catch (err) {
    trackError(err, { action: 'create_order', userId: req.user?.userId })
    console.error('Create Order Error:', err)
    return res.status(500).json({ success: false, error: err.message || 'We couldn\'t create your booking right now. Please try again.' })
  }
}

export const verifyPayment = async (req, res) => {
  try {
    await connectDB()

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return res.status(500).json({ success: false, error: 'Payment gateway secret not configured.' })
    }

    // ── Signature verification using HMAC SHA256 ──
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed. Invalid signature.' })
    }

    // ── Update booking status ──
    const query = {
      $or: [
        { 'payment.razorpayOrderId': razorpay_order_id },
        ...(bookingId ? [{ _id: bookingId }] : [])
      ]
    }

    const booking = await Booking.findOneAndUpdate(
      query,
      {
        status: 'confirmed',
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.razorpaySignature': razorpay_signature,
        'payment.status': 'paid',
        'payment.paidAt': new Date(),
      },
      { new: true }
    )

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found for this payment.' })
    }

    // Notify CRM of verified advance payment
    createNotification({
      type: 'booking',
      title: `Payment Received #${booking.referenceId}`,
      message: `Advance ₹${Number(booking.advancePaid || 500).toLocaleString('en-IN')} paid via Razorpay by ${booking.userSnapshot?.name || 'Customer'}.`,
      link: '/admin/bookings',
      data: {
        bookingId: booking._id,
        referenceId: booking.referenceId,
        paymentId: razorpay_payment_id,
      }
    }).catch(() => {})

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
    const user = req.user || {}
    const userCriteria = [
      ...(user.userId ? [{ userId: user.userId }] : []),
      ...(user.id ? [{ userId: user.id }] : []),
      ...(user.phone ? [{ 'userSnapshot.phone': user.phone }] : []),
      ...(user.email ? [{ 'userSnapshot.email': user.email.toLowerCase() }] : []),
    ]

    const query = userCriteria.length > 0 ? { $or: userCriteria } : { userId: user.userId }
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .select('-__v -adminPhotoWithVehicleUrl')
      .lean()

    return res.status(200).json({ success: true, bookings, data: bookings })
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

// ══════════════════════════════════════════════════════════════
// POST Request Extension
// ══════════════════════════════════════════════════════════════
export const requestExtension = async (req, res) => {
  try {
    await connectDB()
    const { id } = req.params

    const booking = await Booking.findOne({ _id: id, userId: req.user.userId })

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }

    if (!['confirmed', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: 'Cannot request extension for this booking status.' })
    }

    booking.extensionRequested = true
    booking.extensionStatus = 'pending'
    await booking.save()

    return res.status(200).json({ success: true, message: 'Extension requested successfully.' })
  } catch (err) {
    console.error('Extension request error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to request extension.' })
  }
}

// ══════════════════════════════════════════════════════════════
// GET Booking HTML/PDF Tax Invoice
// ══════════════════════════════════════════════════════════════
export const getBookingInvoice = async (req, res) => {
  try {
    await connectDB()
    const { id } = req.params

    const isObjectId = id && /^[0-9a-fA-F]{24}$/.test(id)
    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { referenceId: id }
      ]
    })

    if (!booking) {
      return res.status(404).send('<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>Invoice Not Found</h2><p>The requested booking reference could not be located in our system.</p></body></html>')
    }

    const refId = booking.referenceId || booking._id
    const invNumber = `JR-INV-${refId}`
    const invDate = new Date(booking.createdAt || Date.now()).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })

    const customerName = booking.userSnapshot?.name || "Customer"
    const customerPhone = booking.userSnapshot?.phone || "N/A"
    const customerEmail = booking.userSnapshot?.email || "N/A"
    const vehicleName = booking.vehicleSnapshot ? `${booking.vehicleSnapshot.brand} ${booking.vehicleSnapshot.model}` : "Self-Drive Vehicle"
    const vehicleCategory = booking.vehicleSnapshot?.category || "Standard Fleet"
    const pickupHub = booking.pickupLocation || "Solapur Railway Station (Main Hub)"
    const pickupDateStr = booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : (booking.bikeDate ? new Date(booking.bikeDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A")
    const returnDateStr = booking.returnDate ? new Date(booking.returnDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : (booking.bikeSlot ? `${booking.bikeSlot} Slot` : pickupDateStr)
    const totalDays = booking.totalDays || 1
    const totalPrice = Number(booking.totalPrice || 0)
    const advancePaid = Number(booking.advancePaid || (booking.payment?.status === "paid" ? totalPrice : 500))
    const balanceDue = Math.max(0, totalPrice - advancePaid)
    const paymentStatus = booking.payment?.status === "paid" || booking.status === "completed" || balanceDue === 0 ? "PAID IN FULL" : (advancePaid > 0 ? "ADVANCE PAID" : "PENDING")

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Journey Rentals Invoice · ${invNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #F6F5FA; color: #212121; padding: 24px; }
    .no-print { display: flex; justify-content: space-between; align-items: center; max-width: 820px; margin: 0 auto 20px auto; }
    .btn-action { background: #212121; color: #FFFFFF; font-weight: 700; font-size: 12px; padding: 10px 20px; border-radius: 9999px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .btn-action:hover { background: #000000; }
    .btn-outline { background: #FFFFFF; color: #212121; border: 1px solid #DFDCE8; margin-right: 8px; }
    .invoice-card { background: #FFFFFF; max-width: 820px; margin: 0 auto; border-radius: 28px; border: 1px solid #DFDCE8; padding: 48px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 2px solid #DFDCE8; }
    .brand-logo { display: flex; align-items: center; gap: 14px; }
    .brand-logo-img { width: 46px; height: 46px; object-fit: contain; flex-shrink: 0; }
    .brand-name { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #212121; }
    .brand-name span { color: #3F5F8C; }
    .brand-address { font-size: 11px; color: #6F6E73; margin-top: 6px; line-height: 1.5; }
    .inv-tag { text-align: right; }
    .inv-title { font-size: 26px; font-weight: 900; color: #212121; letter-spacing: 0.5px; }
    .inv-meta { margin-top: 6px; font-size: 11px; color: #6F6E73; font-family: 'JetBrains Mono', monospace; }
    .inv-meta strong { color: #212121; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; padding-bottom: 28px; border-bottom: 1px solid #DFDCE8; }
    .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #6F6E73; margin-bottom: 8px; }
    .customer-name { font-size: 16px; font-weight: 800; color: #212121; margin-bottom: 4px; }
    .detail-item { font-size: 12px; color: #4B4A50; line-height: 1.6; }
    .detail-item span { font-weight: 600; color: #212121; }
    .rental-badge { display: inline-block; background: #e1b808; color: #212121; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 28px; }
    th { text-align: left; background: #F6F5FA; padding: 12px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6F6E73; border-radius: 8px; }
    td { padding: 14px; font-size: 12px; border-bottom: 1px solid #DFDCE8; }
    .text-right { text-align: right; }
    .font-mono { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 24px; }
    .notes-box { max-width: 380px; background: #F6F5FA; border: 1px solid #DFDCE8; border-radius: 16px; padding: 16px; font-size: 11px; color: #6F6E73; line-height: 1.5; }
    .notes-box strong { color: #212121; }
    .totals-box { width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #6F6E73; }
    .total-row.grand { border-top: 2px solid #212121; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 900; color: #212121; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 11px; }
    .status-paid { background: #CFDECA; color: #4B8039; }
    .status-pending { background: #e1b808; color: #212121; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #DFDCE8; display: flex; justify-content: space-between; align-items: flex-end; }
    .sign-box { text-align: right; }
    .sign-line { width: 160px; border-top: 1px solid #212121; margin-top: 40px; margin-left: auto; }
    .sign-text { font-size: 11px; font-weight: 700; color: #212121; margin-top: 6px; }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .no-print { display: none; }
      .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div style="font-size: 13px; font-weight: 800;">
      Journey Rentals Solapur &nbsp;&middot;&nbsp; <span style="font-family: monospace; color: #6F6E73;">#${invNumber}</span>
    </div>
    <div>
      <button class="btn-action btn-outline" onclick="window.close()">Close Window</button>
      <button class="btn-action" onclick="window.print()">Print / Save PDF</button>
    </div>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div class="brand-left">
        <div class="brand-logo">
          <img src="/logo.png" alt="Journey Rentals Solapur Logo" class="brand-logo-img" />
          <div>
            <div class="brand-name">JOURNEY<span>RENTALS</span></div>
            <div style="font-size: 11px; font-weight: 700; color: #6F6E73; text-transform: uppercase;">Self-Drive Cars &amp; Bikes Solapur</div>
          </div>
        </div>
        <div class="brand-address">
          Main Station Hub &amp; Operations Center, Railway Lines, Solapur 413001<br>
          Dispatch Hotline: +91 96044 37794 &nbsp;&middot;&nbsp; +91 90213 11033<br>
          Email: rental.journeycars@gmail.com &nbsp;&middot;&nbsp; Web: www.journeyrentals.in
        </div>
      </div>
      <div class="inv-tag">
        <div class="inv-title">TAX INVOICE</div>
        <div class="inv-meta">
          Invoice No: <strong>#${invNumber}</strong><br>
          Booking Ref: <strong>#${refId}</strong><br>
          Date: <strong>${invDate}</strong>
        </div>
      </div>
    </div>
    <div class="grid-2">
      <div>
        <div class="section-title">Billed To (Customer Details)</div>
        <div class="customer-name">${customerName}</div>
        <div class="detail-item">Contact Phone: <span>${customerPhone}</span></div>
        <div class="detail-item">Email Address: <span>${customerEmail}</span></div>
      </div>
      <div>
        <div class="section-title">Reservation &amp; Dispatch Details</div>
        <div class="customer-name">${vehicleName}</div>
        <div class="detail-item">Class / Category: <span>${vehicleCategory}</span></div>
        <div class="detail-item">Pickup Hub: <span>${pickupHub}</span></div>
        <div class="detail-item">Pickup Time: <span>${pickupDateStr}</span></div>
        <div class="detail-item">Return Time: <span>${returnDateStr} (${totalDays} Days)</span></div>
        <span class="rental-badge">Zero Security Deposit Verified</span>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description &amp; Services</th>
          <th>Rate / Day</th>
          <th>Duration</th>
          <th class="text-right">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Self-Drive Rental — ${vehicleName}</strong><br>
            <span style="font-size: 10px; color: #6F6E73;">Full sanitized vehicle delivery with 300 KM / Day limit.</span>
          </td>
          <td class="font-mono">₹${Math.round(totalPrice / Math.max(1, totalDays)).toLocaleString('en-IN')}</td>
          <td>${totalDays} Days</td>
          <td class="text-right font-mono">₹${totalPrice.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>
            <strong>Solapur Railway Station Express Handover</strong><br>
            <span style="font-size: 10px; color: #6F6E73;">Platform 1 doorstep delivery &amp; return concierge</span>
          </td>
          <td>₹0</td>
          <td>1 Service</td>
          <td class="text-right font-mono">₹0</td>
        </tr>
      </tbody>
    </table>
    <div class="summary-section">
      <div class="notes-box">
        <strong>Terms &amp; Important Instructions:</strong><br>
        1. Fuel policy: Same to Same.<br>
        2. Valid original Driving License &amp; Aadhaar must be presented during handover.<br>
        3. 24/7 Roadside Assistance: <strong>+91 96044 37794</strong>.
      </div>
      <div class="totals-box">
        <div class="total-row">
          <span>Rental Subtotal:</span>
          <span class="font-mono">₹${totalPrice.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row">
          <span>Security Deposit:</span>
          <span class="font-mono" style="color: #4B8039;">₹0 (Waived)</span>
        </div>
        <div class="total-row">
          <span>Advance Paid:</span>
          <span class="font-mono">₹${advancePaid.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row grand">
          <span>Balance Due:</span>
          <span class="font-mono">₹${balanceDue.toLocaleString('en-IN')}</span>
        </div>
        <div style="margin-top: 10px; text-align: right;">
          <span class="status-badge ${balanceDue === 0 ? 'status-paid' : 'status-pending'}">
            ● ${paymentStatus}
          </span>
        </div>
      </div>
    </div>
    <div class="footer">
      <div style="font-size: 11px; color: #99989E;">
        This is a computer-generated tax invoice issued by Journey Rentals Solapur.<br>
        GSTIN: 27AABCT1234F1Z5 &nbsp;&middot;&nbsp; SAC Code: 996601
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-text">Authorized Signatory<br><span style="font-size: 10px; color: #6F6E73; font-weight: normal;">Journey Rentals Solapur</span></div>
      </div>
    </div>
  </div>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    return res.send(html)
  } catch (err) {
    console.error('Invoice error:', err.message)
    return res.status(500).send('<h2>Failed to generate invoice</h2>')
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/bookings/:id — Get Booking Details by ID or Ref ID
// ══════════════════════════════════════════════════════════════
export const getBookingById = async (req, res) => {
  try {
    await connectDB()
    const { id } = req.params
    const isObjectId = id && /^[0-9a-fA-F]{24}$/.test(id)
    const booking = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { referenceId: id }
      ]
    }).populate('vehicleId').lean()

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }

    const user = req.user
    const isOwner = user?.role === 'owner'
    const isBookingUser = Boolean(
      (user?.userId && booking.userId && String(user.userId) === String(booking.userId)) ||
      (user?.phone && booking.userSnapshot?.phone === user.phone) ||
      (user?.email && booking.userSnapshot?.email?.toLowerCase() === user.email?.toLowerCase())
    )

    if (isOwner || isBookingUser) {
      return res.json({ success: true, booking, data: booking })
    }

    // Redact sensitive PII and KYC document URLs for unauthenticated/guest callers
    const sanitizedBooking = {
      ...booking,
      userSnapshot: {
        name: booking.userSnapshot?.name || 'Customer',
        phone: booking.userSnapshot?.phone ? booking.userSnapshot.phone.replace(/(\d{2})\d{5}(\d{3})/, '$1*****$2') : '',
        email: booking.userSnapshot?.email ? booking.userSnapshot.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '',
      },
      documents: {
        aadharNumber: booking.documents?.aadharNumber ? 'Verified' : '',
        licenseNumber: booking.documents?.licenseNumber ? 'Verified' : '',
        aadharUrl: '',
        licenseUrl: '',
      },
    }

    return res.json({ success: true, booking: sanitizedBooking, data: sanitizedBooking })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/bookings/validate-coupon — Check and apply promo coupon
// ══════════════════════════════════════════════════════════════
export const validateCoupon = async (req, res) => {
  try {
    await connectDB()
    const { code, totalAmount } = req.body
    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, error: 'Please enter a coupon code.' })
    }

    const cleanCode = String(code).trim().toUpperCase()
    const coupon = await Coupon.findOne({ code: cleanCode, active: true }).lean()

    if (!coupon) {
      return res.status(404).json({ success: false, error: `Coupon code '${cleanCode}' is invalid or inactive.` })
    }

    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({ success: false, error: `Coupon code '${cleanCode}' has expired.` })
    }

    const amount = Number(totalAmount || 0)
    if (coupon.min_amount && amount < coupon.min_amount) {
      return res.status(400).json({
        success: false,
        error: `Minimum fare of ₹${coupon.min_amount.toLocaleString('en-IN')} required to apply coupon '${cleanCode}'.`
      })
    }

    let discount = 0
    if (coupon.type === 'Percentage') {
      discount = Math.round((amount * coupon.value) / 100)
    } else {
      discount = Math.min(coupon.value, amount)
    }

    const finalAmount = Math.max(0, amount - discount)

    return res.json({
      success: true,
      message: `Coupon '${cleanCode}' applied successfully!`,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalAmount,
        min_amount: coupon.min_amount,
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}
