import Notification from '../models/Notification.js'
import PushSubscription from '../models/PushSubscription.js'
import webpush from 'web-push'
import { connectDB } from '../config/db.js'

/**
 * Creates and persists a system notification.
 * Optionally broadcasts via VAPID Web Push to subscribed devices.
 *
 * @param {Object} param
 * @param {'auth'|'user'|'booking'|'kyc'|'fleet'|'lead'|'coupon'|'payment'|'system'} param.type
 * @param {string} param.title
 * @param {string} param.message
 * @param {string} [param.link]
 * @param {Object} [param.data]
 */
export async function createNotification({ type = 'system', title, message, link = '/admin', data = {} }) {
  try {
    await connectDB()
    if (!title || !message) return null

    const notification = await Notification.create({
      type,
      title,
      message,
      link,
      data,
      read: false,
      createdAt: new Date(),
    })

    // Broadcast via Web Push (best effort, async)
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      PushSubscription.find({}).lean().then(async (subs) => {
        if (!subs || subs.length === 0) return
        const payload = JSON.stringify({
          title,
          body: message,
          icon: '/logo192.png',
          badge: '/favicon.ico',
          data: { url: link || '/admin' },
        })

        for (const sub of subs) {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: sub.keys,
            }, payload)
          } catch (err) {
            if (err.statusCode === 404 || err.statusCode === 410) {
              await PushSubscription.deleteOne({ endpoint: sub.endpoint }).catch(() => {})
            }
          }
        }
      }).catch(() => {})
    }

    return notification
  } catch (err) {
    console.error('Failed to create system notification:', err.message)
    return null
  }
}

export default createNotification
