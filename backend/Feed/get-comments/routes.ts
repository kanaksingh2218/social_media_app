import { Router } from 'express';
import { getComments } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/:postId', protect, getComments);
export default router;
