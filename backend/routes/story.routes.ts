import express from 'express';
import { protect } from '../shared/middlewares/auth.middleware';
import { upload } from '../shared/middlewares/upload.middleware';
import * as storyController from '../controllers/story.controller';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('image'), storyController.createStory);
router.get('/feed', storyController.getStoriesFeed);
router.post('/:id/view', storyController.viewStory);

export default router;
