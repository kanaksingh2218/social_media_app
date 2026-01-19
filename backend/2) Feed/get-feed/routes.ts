import { Router } from 'express';
import { getFeed } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getFeed);

export default router;
