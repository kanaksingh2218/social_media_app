import { Router } from 'express';
import { acceptFriendRequest } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import { validateObjectId } from '../../shared/middlewares/validation.middleware';

const router = Router();
router.put('/:requestId', protect, validateObjectId('requestId'), acceptFriendRequest);
export default router;
