import { Router } from 'express';
import { likePost, unlikePost } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.post('/:postId', protect, likePost);
router.delete('/:postId', protect, unlikePost);

export default router;
