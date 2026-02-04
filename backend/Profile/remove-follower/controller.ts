import { Response, NextFunction } from 'express';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Remove a follower (Owner view)
 * @route   POST /api/profile/remove-follower/:userId
 * @access  Private
 */
export const removeFollower = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const followerId = req.params.userId;
    const currentUserId = req.user.id;

    if (followerId === currentUserId) {
        return next(new AppError(400, "You cannot remove yourself as a follower"));
    }

    // 1. Check if follower exists
    const followerCheck = await User.findById(followerId).select('_id').lean();
    if (!followerCheck) {
        return next(new AppError(404, 'Follower not found'));
    }

    // 2. Atomic Removal: 
    // Remove follower FROM my followers and friends
    // Remove ME FROM their following and friends
    const [currentUser, updatedFollower] = await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
            $pull: { followers: followerId, friends: followerId }
        }, { new: true }).select('followers').lean(),
        User.findByIdAndUpdate(followerId, {
            $pull: { following: currentUserId, friends: currentUserId }
        }, { new: true }).select('following').lean()
    ]);

    console.log(`[PROFILE] User ${currentUserId} removed follower ${followerId}`);

    res.json({
        message: 'Follower removed successfully',
        followers: currentUser?.followers || []
    });
});
