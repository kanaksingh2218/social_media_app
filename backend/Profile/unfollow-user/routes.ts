import { Router } from 'express';
import { unfollowUser } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import { validateObjectId } from '../../shared/middlewares/validation.middleware';

const router = Router();
router.post('/:userId', protect, validateObjectId('userId'), unfollowUser);
export default router;
