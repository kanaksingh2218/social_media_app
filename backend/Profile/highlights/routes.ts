import { Router } from 'express';
import { createHighlight, getHighlights, updateHighlight, deleteHighlight } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

console.log('--- LOADING HIGHLIGHT ROUTES ---');
const router = Router();

router.post('/', protect, createHighlight);
router.get('/user/:userId', getHighlights);
router.put('/:highlightId', protect, updateHighlight);
router.delete('/:highlightId', protect, deleteHighlight);

export default router;
