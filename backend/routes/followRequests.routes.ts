import { Router } from 'express';
import * as followController from '../controllers/followRequests.controller';
import { protect } from '../shared/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Get pending follow requests for current user
router.get('/follow-requests', followController.getPendingRequests);

// Debug endpoint to see all requests in database
router.get('/debug/all-requests', followController.getAllRequestsDebug);

// Send follow request to a user
router.post('/:userId/follow', followController.sendFollowRequest);

// Get relationship status with a user
router.get('/:userId/relationship', followController.getRelationshipStatus);

// Accept a follow request
router.post('/follow-requests/:requestId/accept', followController.acceptRequest);

// Decline/delete a follow request
router.delete('/follow-requests/:requestId', followController.declineRequest);

export default router;
