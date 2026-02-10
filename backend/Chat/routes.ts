import express from 'express';
import { protect } from '../shared/middlewares/auth.middleware';
import { upload } from '../shared/middlewares/upload.middleware';
import * as chatController from '../controllers/chat.controller';

const router = express.Router();

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.post('/', chatController.startConversation);
router.get('/:conversationId/messages', chatController.getMessages);
router.post('/message', upload.single('image'), chatController.sendMessage);
router.put('/:conversationId/read', chatController.markAsRead);

export default router;
