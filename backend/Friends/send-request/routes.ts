import { Router } from 'express';
import { sendFriendRequest } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import { validateSendRequest } from '../../shared/middlewares/validation.middleware';

const router = Router();

router.post('/', protect, validateSendRequest, sendFriendRequest);

export default router;
