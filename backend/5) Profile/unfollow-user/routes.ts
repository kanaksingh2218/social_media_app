import { Router } from 'express';
import { unfollowUser } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.post('/:userId', protect, unfollowUser);
export default router;
