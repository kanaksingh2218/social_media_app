import { Router } from 'express';
import { getPendingRequests, getSentRequests } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/', protect, getPendingRequests);
router.get('/sent', protect, getSentRequests);
export default router;
