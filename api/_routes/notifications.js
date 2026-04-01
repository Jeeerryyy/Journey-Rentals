import { Router } from 'express';
import { connectDB } from '../_lib/mongodb.js';
import PushSubscription from '../_lib/models/PushSubscription.js';
import { requireOwner } from '../_lib/auth.js';

const router = Router();

// Protect all notification routes with owner authentication
router.use(requireOwner);

// ── POST /api/notifications/subscribe ──
router.post('/subscribe', async (req, res) => {
  try {
    await connectDB();
    const subscription = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, error: 'Invalid subscription object.' });
    }

    // Upsert the subscription based on endpoint
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      subscription,
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, message: 'Subscribed to push notifications.' });
  } catch (err) {
    console.error('Push subscribe error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to subscribe to notifications.' });
  }
});

// ── DELETE /api/notifications/unsubscribe ──
router.delete('/unsubscribe', async (req, res) => {
  try {
    await connectDB();
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'Endpoint is required.' });
    }

    await PushSubscription.findOneAndDelete({ endpoint });

    return res.status(200).json({ success: true, message: 'Unsubscribed from push notifications.' });
  } catch (err) {
    console.error('Push unsubscribe error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to unsubscribe.' });
  }
});

export default router;
