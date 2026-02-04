import { Router } from 'express';
import { protect } from '../shared/middlewares/auth.middleware';
import {
    followUser,
    unfollowUser,
    acceptRequest,
    rejectRequest,
    getFollowers,
    getFollowing,
    getPendingRequests,
    getSentRequests,
    checkFollowStatus,
    checkBulkFollowStatus
} from '../controllers/follow.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Follow/Unfollow
router.post('/follow/:userId', followUser);
router.delete('/unfollow/:userId', unfollowUser);

// Request Management
router.post('/follow-request/accept/:requestId', acceptRequest);
router.post('/follow-request/reject/:requestId', rejectRequest);

// Lists
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);
router.get('/follow-requests/pending', getPendingRequests);
router.get('/follow-requests/sent', getSentRequests);

// Status Checks
router.get('/follow-status/:userId', checkFollowStatus);
router.post('/follow-status/bulk', checkBulkFollowStatus);

export default router;
