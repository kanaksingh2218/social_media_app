import { Response, NextFunction } from 'express';
import FriendRequest from '../FriendRequest.model';
import User from '../../Authentication/User.model';
import Notification from '../../shared/models/Notification.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Send a friend request (Explicitly for mutual following)
 * @route   POST /api/friends/send
 * @access  Private
 */
export const sendFriendRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
        return next(new AppError(400, "You cannot send a request to yourself"));
    }

    // 1. Check if receiver exists
    const receiver = await User.findById(receiverId).select('_id isPrivate').lean();
    if (!receiver) {
        return next(new AppError(404, 'User not found'));
    }

    // 2. Check if already friends
    const sender = await User.findById(senderId).select('friends').lean();
    if (sender?.friends.some(id => id.toString() === receiverId)) {
        return next(new AppError(400, 'You are already friends with this user'));
    }

    // 3. Use RelationshipService to Create Request (Handles duplicates)
    const { RelationshipService } = await import('../../shared/services/relationship.service');
    const fr = await RelationshipService.createRequest(senderId, receiverId, 'friend');

    // 5. Async notification
    Notification.create({
        recipient: receiverId,
        sender: senderId,
        type: 'friend_request'
    }).catch(err => console.error('[FRIENDS] Notification failed:', err.message));


    res.status(201).json(fr);
});
