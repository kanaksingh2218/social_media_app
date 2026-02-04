import { Router } from 'express';
import { cancelFriendRequest } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.delete('/:userId', protect, cancelFriendRequest);

export default router;
