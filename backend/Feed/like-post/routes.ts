import { Router } from 'express';
import { likePost } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.post('/:postId', protect, likePost);

export default router;
