import { Router } from 'express';
import { unfriend } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import { validateObjectId } from '../../shared/middlewares/validation.middleware';

const router = Router();
router.delete('/:friendId', protect, validateObjectId('friendId'), unfriend);
export default router;
