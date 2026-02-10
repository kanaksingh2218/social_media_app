import { Router } from 'express';
import { getComments, getReplies } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/:postId', protect, getComments);
router.get('/replies/:commentId', protect, getReplies);
export default router;
