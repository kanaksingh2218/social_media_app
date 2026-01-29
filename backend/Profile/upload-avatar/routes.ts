import { Router } from 'express';
import { uploadAvatar } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req: any, file, cb) => {
        console.log('DEBUG: Multer Destination Start');
        console.log('DEBUG: User in Multer:', req.user?.id);
        const dir = 'uploads/profiles/';
        if (!fs.existsSync(dir)) {
            console.log('DEBUG: Creating directory:', dir);
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req: any, file, cb) => {
        const uniqueName = `${req.user?.id || 'unknown'}-${Date.now()}-${file.originalname}`;
        console.log('DEBUG: Multer Filename:', uniqueName);
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

const router = Router();
router.post('/', protect, upload.single('avatar'), uploadAvatar);
export default router;
