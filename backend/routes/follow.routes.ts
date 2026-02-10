import express from 'express';
const router = express.Router();
import * as followController from '../controllers/follow.controller';
import { protect } from '../shared/middlewares/auth.middleware';

// All routes require authentication
router.use(protect);

console.log('📋 Loading follow routes...');

// ⚠️ IMPORTANT: Specific routes BEFORE parameterized routes
router.get('/follow-requests/count', followController.getPendingRequestsCount);
router.get('/follow-requests', followController.getPendingRequests);
router.get('/follow-requests/sent', followController.getSentFollowRequests);
router.post('/follow-requests/:requestId/accept', followController.acceptRequest);
router.delete('/follow-requests/:requestId', followController.rejectRequest);

// User follow/unfollow and relationship - Parameterized routes LAST
router.post('/:userId/follow', followController.followUser);
router.delete('/:userId/follow', followController.unfollowUser);
router.delete('/:userId/follower', followController.removeFollower);
router.get('/:userId/relationship', followController.getRelationshipStatus);

export default router;
