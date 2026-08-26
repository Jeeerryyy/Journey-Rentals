import express from 'express'

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

export default router
