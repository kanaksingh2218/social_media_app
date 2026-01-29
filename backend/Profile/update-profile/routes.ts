import { Router } from 'express';
import { updateProfile } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.put('/', protect, updateProfile);
export default router;
