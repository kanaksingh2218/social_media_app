import { Router } from 'express';
import { createPost, deletePost } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/posts/' });
const router = Router();

router.post('/create', protect, upload.array('images', 10), createPost);
router.delete('/:postId', protect, deletePost);

export default router;
