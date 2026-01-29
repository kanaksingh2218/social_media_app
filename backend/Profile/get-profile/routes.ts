import { Router } from 'express';
import { getProfile } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/:userId', protect, getProfile);
export default router;
