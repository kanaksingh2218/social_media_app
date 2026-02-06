import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller';
import { protect } from '../shared/middlewares/auth.middleware';

// Get current user
router.get('/me', protect, userController.getCurrentUser);

// Update privacy setting
router.patch('/me/privacy', protect, userController.updatePrivacy);

export default router;
