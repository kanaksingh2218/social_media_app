import { Response, NextFunction } from 'express';
import FriendRequest from '../FriendRequest.model';
import { catchAsync } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Get all pending friend requests for the current user
 * @route   GET /api/friends/requests
 * @access  Private
 */
export const getPendingRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const requests = await FriendRequest.find({
        receiver: req.user.id,
        status: 'pending'
    })
        .populate('sender', 'username profilePicture fullName')
        .sort({ createdAt: -1 })
        .lean();

    console.log(`[FRIENDS] Found ${requests.length} pending requests for user ${req.user.id}`);
    res.json(requests);
});

/**
 * @desc    Get all sent friend requests sent by the current user
 * @route   GET /api/friends/requests/sent
 * @access  Private
 */
export const getSentRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const requests = await FriendRequest.find({
        sender: req.user.id,
        status: 'pending'
    })
        .populate('receiver', 'username profilePicture fullName')
        .sort({ createdAt: -1 })
        .lean();

    console.log(`[FRIENDS] Found ${requests.length} sent requests from user ${req.user.id}`);
    res.json(requests);
});
