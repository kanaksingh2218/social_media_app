import { Router } from 'express';
import { getFollowing } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.get('/:userId', protect, getFollowing);

export default router;
