import { Router } from 'express';
import { unfriend } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.delete('/:friendId', protect, unfriend);
export default router;
