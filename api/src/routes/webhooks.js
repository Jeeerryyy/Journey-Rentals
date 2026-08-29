import express from 'express'
import crypto from 'crypto'
import Booking from '../models/Booking.js'
import { createNotification } from '../services/notificationService.js'
import { connectDB } from '../config/db.js'

const router = express.Router()

/**
 * ── 1. GET /api/webhooks/whatsapp ──
 * Meta Webhook verification handshake.
 * Meta sends hub.mode, hub.verify_token, and hub.challenge.
 */
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'journey_rentals_webhook_2026'

  // 1. Meta Webhook Verification Request
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WhatsApp Webhook verified successfully by Meta!')
      return res.status(200).send(challenge)
    } else {
      console.warn('❌ WhatsApp Webhook token mismatch. Expected:', VERIFY_TOKEN, 'Received:', token)
      return res.sendStatus(403)
    }
  }

  // 2. Direct Browser Status Check
  return res.status(200).json({
    success: true,
    status: 'online',
    service: 'JourneyRentals WhatsApp Webhook Endpoint',
    timestamp: new Date().toISOString()
  })
})

/**
 * ── 2. POST /api/webhooks/whatsapp ──
 * Receives live incoming messages and delivery status updates from WhatsApp.
 */
router.post('/whatsapp', (req, res) => {
  try {
    const body = req.body

    if (body.object) {
      if (
        body.entry &&
        body.entry[0]?.changes &&
        body.entry[0]?.changes[0]?.value?.messages &&
        body.entry[0]?.changes[0]?.value?.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0]
        const from = message.from
        const text = message.text?.body || '[media/button]'
        console.log(`💬 Incoming WhatsApp message from ${from}: ${text}`)
      }
      return res.status(200).json({ status: 'EVENT_RECEIVED' })
    }

    return res.sendStatus(404)
  } catch (err) {
    console.error('WhatsApp Webhook POST Error:', err)
    return res.status(200).json({ status: 'ERROR_LOGGED' })
  }
})

/**
 * ── 3. POST /api/webhooks/razorpay ──
 * Receives automatic payment status updates from Razorpay.
 */
router.post('/razorpay', async (req, res) => {
  try {
    await connectDB()
    const signature = req.headers['x-razorpay-signature']
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET

    if (signature && secret) {
      const shasum = crypto.createHmac('sha256', secret)
      shasum.update(JSON.stringify(req.body))
      const digest = shasum.digest('hex')
      if (digest !== signature) {
        console.warn('⚠️ Razorpay webhook signature mismatch')
        return res.status(400).json({ status: 'INVALID_SIGNATURE' })
      }
    }

    const event = req.body.event
    const payload = req.body.payload

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity
      const orderId = paymentEntity?.order_id || payload.order?.entity?.id
      const paymentId = paymentEntity?.id

      if (orderId) {
        const booking = await Booking.findOneAndUpdate(
          { 'payment.razorpayOrderId': orderId },
          {
            status: 'confirmed',
            'payment.razorpayPaymentId': paymentId,
            'payment.status': 'paid',
            'payment.paidAt': new Date(),
          },
          { new: true }
        )

        if (booking) {
          console.log(`✅ Webhook confirmed booking #${booking.referenceId} (Order: ${orderId})`)
          createNotification({
            type: 'booking',
            title: `Payment Received #${booking.referenceId}`,
            message: `Razorpay verified payment of ₹${Number(paymentEntity?.amount ? paymentEntity.amount / 100 : (booking.advancePaid || 500)).toLocaleString('en-IN')} for booking #${booking.referenceId}`,
            link: '/admin/bookings',
            data: { bookingId: booking._id, referenceId: booking.referenceId, paymentId }
          }).catch(() => {})
        }
      }
    }

    return res.status(200).json({ status: 'OK' })
  } catch (err) {
    console.error('Razorpay Webhook Error:', err)
    return res.status(200).json({ status: 'ERROR_HANDLED' })
  }
})

export default router
