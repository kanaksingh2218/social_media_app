import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Unfriend a user (Bidirectional removal)
 * @route   DELETE /api/friends/unfriend/:friendId
 * @access  Private
 */
export const unfriend = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { friendId } = req.params;
    const currentUserId = req.user.id;

    // 1. Validate friendId
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return next(new AppError(400, 'Invalid friend ID format'));
    }

    // 2. Check if they are friends (Lean check)
    const currentUserCheck = await User.findById(currentUserId).select('friends').lean();
    if (!currentUserCheck) {
        return next(new AppError(404, 'User not found'));
    }
    if (!currentUserCheck?.friends.some(id => id.toString() === friendId)) {
        return next(new AppError(400, 'You are not friends with this user'));
    }

    // 3. Bidirectional Removal (Friends, Followers, and Following)
    await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
            $pull: {
                friends: friendId,
                followers: friendId,
                following: friendId
            }
        }),
        User.findByIdAndUpdate(friendId, {
            $pull: {
                friends: currentUserId,
                followers: currentUserId,
                following: currentUserId
            }
        })
    ]);



    res.json({ message: 'User removed from friends and following' });
});
