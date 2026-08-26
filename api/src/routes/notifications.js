import { Router } from 'express';
import { requireOwner } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
  subscribeToPush,
  unsubscribeFromPush,
} from '../controllers/notifications.controller.js';

const router = Router();

// Protect all notification routes with owner authentication
router.use(requireOwner);

// ── GET /api/notifications ──
router.get('/', getNotifications);

// ── PATCH /api/notifications/mark-read ──
router.patch('/mark-read', markNotificationRead);

// ── DELETE /api/notifications (clear all) ──
router.delete('/', clearAllNotifications);

// ── DELETE /api/notifications/:id (delete single) ──
router.delete('/:id', deleteNotification);

// ── POST /api/notifications/subscribe ──
router.post('/subscribe', subscribeToPush);

// ── DELETE /api/notifications/unsubscribe ──
router.delete('/unsubscribe', unsubscribeFromPush);

export default router;
