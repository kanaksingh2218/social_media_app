import { Router } from 'express';
import { getSuggestions } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.get('/', protect, getSuggestions);
export default router;
