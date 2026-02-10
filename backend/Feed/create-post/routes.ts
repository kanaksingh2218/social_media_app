import { Router } from 'express';
import { createPost, deletePost } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import { upload } from '../../shared/middlewares/upload.middleware';

const router = Router();

import { validateCreatePost } from '../../shared/middlewares/validation.middleware';

router.post('/create', protect, upload.array('images', 10), validateCreatePost, createPost);

export default router;
