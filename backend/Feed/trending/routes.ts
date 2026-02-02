import { Router } from 'express';
import { getTrendingPosts } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/feed/trending
 * @desc    Get trending posts
 * @access  Private
 */
router.get('/', protect, getTrendingPosts);

export default router;
