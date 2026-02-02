import express from 'express';
import { updatePost } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = express.Router();

router.put('/:postId', protect, updatePost);

export default router;
