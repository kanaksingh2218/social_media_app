import express from 'express';
import { deletePost } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = express.Router();

router.delete('/:postId', protect, deletePost);

export default router;
