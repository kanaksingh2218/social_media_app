import { Router } from 'express';
import { createPost } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/posts/' });
const router = Router();

router.post('/', protect, upload.array('images', 10), createPost);

export default router;
