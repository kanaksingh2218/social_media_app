import { Router } from 'express';
import { createPost, deletePost } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/posts/' });
const router = Router();

import { validateCreatePost } from '../../shared/middlewares/validation.middleware';

router.post('/create', protect, upload.array('images', 10), validateCreatePost, createPost);

export default router;
