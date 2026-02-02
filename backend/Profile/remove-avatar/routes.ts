import { Router } from 'express';
import { removeAvatar } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

console.log('[DEBUG] Remove Avatar Routes Module Loaded');

router.delete('/', protect, removeAvatar);

console.log('[DEBUG] DELETE / route registered for remove-avatar');

export default router;
