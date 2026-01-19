import { Router } from 'express';
import { getFriends } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/', protect, getFriends);
router.get('/:userId', protect, getFriends);
export default router;
