import { Router } from 'express';
import { addComment } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.post('/:postId', protect, addComment);
export default router;
