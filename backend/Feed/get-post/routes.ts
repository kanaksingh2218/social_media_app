import express from 'express';
import { getPost } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = express.Router();

router.get('/:postId', protect, getPost);

export default router;
