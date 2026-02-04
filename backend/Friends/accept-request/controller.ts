import { Response, NextFunction } from 'express';
import FriendRequest from '../FriendRequest.model';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Accept a friend request
 * @route   PUT /api/friends/accept/:requestId
 * @access  Private
 */
export const acceptFriendRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    // 1. Find request
    const fr = await FriendRequest.findById(requestId);
    if (!fr) {
        return next(new AppError(404, 'Friend request not found'));
    }

    // 2. Security: Only receiver can accept
    if (fr.receiver.toString() !== currentUserId) {
        return next(new AppError(403, 'You are not authorized to accept this request'));
    }

    // 3. State Validation: Must be pending
    if (fr.status !== 'pending') {
        return next(new AppError(400, `Request is already ${fr.status}`));
    }

    // 4. Update friends lists and mutual followers
    // 4. Update friends lists and followers based on Request Type
    // If requestType is 'friend' (default), do mutual follow + friends.
    // If requestType is 'follow', ONLY add sender to receiver's followers (and receiver to sender's following).

    if (fr.requestType === 'follow') {
        await Promise.all([
            // Add Sender (follower) to Receiver's (target) followers list
            User.findByIdAndUpdate(fr.receiver, {
                $addToSet: { followers: fr.sender }
            }),
            // Add Receiver (target) to Sender's following list
            User.findByIdAndUpdate(fr.sender, {
                $addToSet: { following: fr.receiver }
            }),
            // Mark request as accepted
            FriendRequest.findByIdAndUpdate(requestId, { status: 'accepted' })
        ]);

    } else {
        // Default 'friend' behavior: Mutual Follow + Friend
        await Promise.all([
            User.findByIdAndUpdate(fr.sender, {
                $addToSet: {
                    friends: fr.receiver,
                    following: fr.receiver,
                    followers: fr.receiver
                }
            }),
            User.findByIdAndUpdate(fr.receiver, {
                $addToSet: {
                    friends: fr.sender,
                    following: fr.sender,
                    followers: fr.sender
                }
            }),
            // Mark request as accepted
            FriendRequest.findByIdAndUpdate(requestId, { status: 'accepted' })
        ]);

    }

    res.json({ message: 'Friend request accepted successfully' });
});
