import { Router } from 'express';
import { searchPosts } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/feed/search
 * @desc    Search posts by content or author
 * @access  Private
 */
router.get('/', protect, searchPosts);

export default router;
