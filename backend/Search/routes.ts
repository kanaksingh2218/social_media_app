import { Router } from 'express';
import { search, addToHistory, getHistory, clearHistory } from './controller';
import { protect } from '../shared/middlewares/auth.middleware';

const router = Router();



router.get('/', protect, search);

// Search History
router.get('/history', protect, getHistory);
router.post('/history', protect, addToHistory);
router.delete('/history', protect, clearHistory);

export default router;
