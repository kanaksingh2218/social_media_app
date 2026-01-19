import { Router } from 'express';
import { followUser } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.post('/:userId', protect, followUser);
export default router;
