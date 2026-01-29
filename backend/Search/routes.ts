import { Router } from 'express';
import { searchUsers } from './controller';
import { protect } from '../shared/middlewares/auth.middleware';

const router = Router();
router.get('/', protect, searchUsers);
export default router;
