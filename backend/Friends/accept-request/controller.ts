import { Response, NextFunction } from 'express';
import Relationship from '../../models/Relationship.model';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Accept a friend/follow request
 * @route   PUT /api/friends/accept/:requestId
 * @access  Private
 */
export const acceptFriendRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    console.log(`✅ [FRIENDS-ACCEPT] Attempting to accept request: ${requestId}`);

    // 1. Find request in Relationship model
    const rel = await Relationship.findById(requestId);
    if (!rel) {
        return next(new AppError(404, 'Request not found'));
    }

    // 2. Security: Only receiver can accept
    if (rel.receiver.toString() !== currentUserId) {
        return next(new AppError(403, 'You are not authorized to accept this request'));
    }

    // 3. State Validation: Must be pending
    if (rel.status !== 'pending') {
        return next(new AppError(400, `Request is already ${rel.status}`));
    }

    const { sender: senderId, receiver: receiverId, requestType } = rel;

    if (requestType === 'follow') {
        // Follow Type: Only one-way connection
        await Promise.all([
            // Add Sender (follower) to Receiver's (target) followers list
            User.findByIdAndUpdate(receiverId, {
                $addToSet: { followers: senderId },
                $inc: { followerCount: 1 }
            }),
            // Add Receiver (target) to Sender's following list
            User.findByIdAndUpdate(senderId, {
                $addToSet: { following: receiverId },
                $inc: { followingCount: 1 }
            }),
            // Mark request as accepted
            Relationship.findByIdAndUpdate(requestId, { status: 'accepted' })
        ]);
        console.log(`✨ [FRIENDS-ACCEPT] Follow request accepted: ${senderId} -> ${receiverId}`);

    } else {
        // Default 'friend' behavior: Mutual Follow + Friend
        await Promise.all([
            User.findByIdAndUpdate(senderId, {
                $addToSet: {
                    friends: receiverId,
                    following: receiverId,
                    followers: receiverId
                },
                $inc: { followerCount: 1, followingCount: 1 } // Mutual
            }),
            User.findByIdAndUpdate(receiverId, {
                $addToSet: {
                    friends: senderId,
                    following: senderId,
                    followers: senderId
                },
                $inc: { followerCount: 1, followingCount: 1 } // Mutual
            }),
            // Mark request as accepted
            Relationship.findByIdAndUpdate(requestId, { status: 'accepted' })
        ]);
        console.log(`✨ [FRIENDS-ACCEPT] Friend request accepted (Mutual): ${senderId} <-> ${receiverId}`);
    }

    res.json({ message: 'Request accepted successfully', status: 'accepted' });
});

