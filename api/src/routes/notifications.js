import { Router } from 'express';
import { requireOwner } from '../middleware/auth.js';
import { subscribeToPush, unsubscribeFromPush } from '../controllers/notifications.controller.js';

const router = Router();

// Protect all notification routes with owner authentication
router.use(requireOwner);

// ── POST /api/notifications/subscribe ──
router.post('/subscribe', subscribeToPush);

// ── DELETE /api/notifications/unsubscribe ──
router.delete('/unsubscribe', unsubscribeFromPush);

export default router;
