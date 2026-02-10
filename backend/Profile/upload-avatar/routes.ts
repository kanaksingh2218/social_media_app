import { Router } from 'express';
import { uploadAvatar } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import { upload } from '../../shared/middlewares/upload.middleware';

const router = Router();
router.post('/', protect, upload.single('avatar'), uploadAvatar);
export default router;
