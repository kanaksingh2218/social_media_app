import { Router } from 'express';
import { getMessages, sendMessage, getContacts } from './controller';
import { protect } from '../shared/middlewares/auth.middleware';

const router = Router();
router.get('/contacts', protect, getContacts);
router.get('/:contactId', protect, getMessages);
router.post('/', protect, sendMessage);
export default router;
