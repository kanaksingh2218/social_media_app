import { Response, NextFunction } from 'express';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Get friends of a user
 * @route   GET /api/friends/list/:userId
 * @access  Private
 */
export const getFriends = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.params.userId || req.user.id;
    const currentUserId = req.user.id;

    const user = await User.findById(userId).populate('friends', 'username fullName profilePicture followers following friends').lean();

    if (!user) {
        return next(new AppError(404, 'User not found'));
    }

    const friendsWithRelationship = (user.friends as any[]).map(friend => {
        return {
            ...friend,
            relationship: {
                isFollowing: friend.followers?.some((id: any) => id.toString() === currentUserId),
                isFriend: friend.friends?.some((id: any) => id.toString() === currentUserId)
            }
        };
    });

    res.json(friendsWithRelationship);
});
