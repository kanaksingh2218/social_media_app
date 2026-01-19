import { Router } from 'express';
import { rejectFriendRequest } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.put('/:requestId', protect, rejectFriendRequest);
export default router;
