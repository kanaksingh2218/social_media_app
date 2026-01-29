import { Router } from 'express';
import { addComment, deleteComment } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.post('/:postId', protect, addComment);
router.delete('/:commentId', protect, deleteComment);
export default router;
