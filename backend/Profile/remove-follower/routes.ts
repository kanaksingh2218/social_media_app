import { Router } from 'express';
import { removeFollower } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.post('/:userId', protect, removeFollower);

export default router;
