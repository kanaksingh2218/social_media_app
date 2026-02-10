import express from 'express';
import { protect } from '../shared/middlewares/auth.middleware';
import * as blockController from '../controllers/block.controller';

const router = express.Router();

router.use(protect);

router.get('/', blockController.getBlockedUsers);
router.post('/:userId', blockController.blockUser);
router.delete('/:userId', blockController.unblockUser);

export default router;
