import express from 'express';
import { deleteComment } from '../posts.controller';
import { protect } from '../../shared/middlewares/auth.middleware';
import { validateObjectId } from '../../shared/middlewares/validation.middleware';

const router = express.Router();

router.delete('/:commentId', protect, validateObjectId('commentId'), deleteComment);

export default router;
