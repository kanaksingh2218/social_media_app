import { Router } from 'express';
import { getPendingRequests } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/', protect, getPendingRequests);
export default router;
