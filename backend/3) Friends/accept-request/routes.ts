import { Router } from 'express';
import { acceptFriendRequest } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.put('/:requestId', protect, acceptFriendRequest);
export default router;
