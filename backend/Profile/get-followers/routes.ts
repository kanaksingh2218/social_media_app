import { Router } from 'express';
import { getFollowers } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.get('/:userId', protect, getFollowers);

export default router;
