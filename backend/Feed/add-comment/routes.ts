import { Router } from 'express';
import { addComment, deleteComment } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
import { validateComment } from '../../shared/middlewares/validation.middleware';

router.post('/:postId', protect, validateComment, addComment);
export default router;
