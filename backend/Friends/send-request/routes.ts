import { Router } from 'express';
import { sendFriendRequest } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.post('/', protect, sendFriendRequest);

export default router;
