import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notification.controller';
import { protect } from '../shared/middlewares/auth.middleware';

// All routes require authentication
router.use(protect);

// Get unread count (combined notifications + follow requests)
router.get('/unread-count', notificationController.getUnreadCount);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

export default router;
