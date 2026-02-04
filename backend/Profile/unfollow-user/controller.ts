import { Response, NextFunction } from 'express';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Unfollow a user and remove from friends
 * @route   POST /api/profile/unfollow/:userId
 * @access  Private
 */
export const unfollowUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    // 1. Lean check for existence
    const targetUserCheck = await User.findById(targetUserId).select('_id').lean();
    if (!targetUserCheck) {
        return next(new AppError(404, 'User not found'));
    }

    // 2. Atomic Removal 
    // If I unfollow B, we are NO LONGER friends, even if B still follows A.
    // In this system "Friends" are mutual followers.
    const [targetUser, currentUser] = await Promise.all([
        User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId, friends: currentUserId } }, { new: true }).select('followers').lean(),
        User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId, friends: targetUserId } }, { new: true }).select('following').lean()
    ]);



    res.json({
        message: 'User unfollowed successfully',
        followers: targetUser?.followers || [],
        following: currentUser?.following || []
    });
});
