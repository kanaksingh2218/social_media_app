import { Router } from 'express';
import { uploadAvatar } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
    filename: (req: any, file, cb) => cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = Router();
router.post('/', protect, upload.single('avatar'), uploadAvatar);
export default router;
