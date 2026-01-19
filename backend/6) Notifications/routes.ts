import { Router } from 'express';
import { getNotifications, markAsRead } from './controller';
import { protect } from '../shared/middlewares/auth.middleware';

const router = Router();
router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);
export default router;
