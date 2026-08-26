import { connectDB } from '../config/db.js';
import Notification from '../models/Notification.js';
import PushSubscription from '../models/PushSubscription.js';

// GET /api/notifications — List notifications with unread count
export const getNotifications = async (req, res) => {
  try {
    await connectDB();
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ read: false }),
    ]);

    const formatted = notifications.map((n) => ({
      id: n._id,
      _id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link || '/admin',
      read: n.read,
      data: n.data || {},
      createdAt: n.createdAt,
    }));

    return res.status(200).json({
      success: true,
      notifications: formatted,
      data: formatted,
      unreadCount,
    });
  } catch (err) {
    console.error('Get notifications error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
};

// PATCH /api/notifications/mark-read — Mark specific or all notifications as read
export const markNotificationRead = async (req, res) => {
  try {
    await connectDB();
    const { id, all } = req.body;

    if (all || !id) {
      await Notification.updateMany({ read: false }, { read: true });
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }

    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
};

// DELETE /api/notifications/:id — Delete single notification
export const deleteNotification = async (req, res) => {
  try {
    await connectDB();
    await Notification.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    console.error('Delete notification error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to delete notification.' });
  }
};

// DELETE /api/notifications — Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    await connectDB();
    await Notification.deleteMany({});
    return res.status(200).json({ success: true, message: 'All notifications cleared.' });
  } catch (err) {
    console.error('Clear all notifications error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to clear notifications.' });
  }
};

export const subscribeToPush = async (req, res) => {
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
};

export const unsubscribeFromPush = async (req, res) => {
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
};
