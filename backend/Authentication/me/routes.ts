import { Router } from 'express';
import { getMe } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

// GET /api/auth/me - Get current user
router.get('/', protect, getMe);

export default router;
