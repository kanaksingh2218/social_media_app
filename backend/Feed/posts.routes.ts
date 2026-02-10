import { Router, Request, Response, NextFunction } from 'express';
import {
    getFeed,
    createPost,
    getPost,
    updatePost,
    deletePost,
    likePost,
    getUserPosts,
    getComments,
    addComment,
    deleteComment,
    searchPosts,
    getTrendingPosts
} from './posts.controller';
import { protect } from '../shared/middlewares/auth.middleware';
import { upload } from '../shared/middlewares/upload.middleware';
import { validateCreatePost } from '../shared/middlewares/validation.middleware';

const router = Router();

// ==========================================
// SPECIFIC ROUTES (Must come BEFORE parameterized routes)
// ==========================================

// GET /api/posts/feed
router.get('/feed', protect, getFeed);

// GET /api/posts/trending
router.get('/trending', protect, getTrendingPosts);

// GET /api/posts/search
router.get('/search', protect, searchPosts);

// GET /api/posts/user/:userId
router.get('/user/:userId', protect, getUserPosts);

// POST /api/posts/create
router.post('/create', protect, upload.array('images', 10), validateCreatePost, createPost);

// POST /api/posts (Alternative for create)
router.post('/', protect, upload.array('images', 10), validateCreatePost, createPost);

// ==========================================
// PARAMETERIZED ROUTES (ID-based)
// ==========================================

// NOTE: Regex in paths is deprecated in Express 5. 
// Handle validation in controllers.

// GET /api/posts/:postId
router.get('/:postId', protect, getPost);

// PUT /api/posts/:postId
router.put('/:postId', protect, updatePost);

// DELETE /api/posts/:postId
router.delete('/:postId', protect, deletePost);

// POST /api/posts/:postId/like
router.post('/:postId/like', protect, likePost);

// GET /api/posts/:postId/comments
router.get('/:postId/comments', protect, getComments);

// POST /api/posts/:postId/comment
router.post('/:postId/comment', protect, addComment);

// DELETE /api/posts/comments/:commentId
router.delete('/comments/:commentId', protect, deleteComment);

export default router;
