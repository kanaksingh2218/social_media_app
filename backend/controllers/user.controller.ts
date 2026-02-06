import { Response, NextFunction } from 'express';
import User from '../Authentication/User.model';
import FollowRequest from '../models/FollowRequest.model';
import { catchAsync, AppError } from '../shared/middlewares/error.middleware';

/**
 * @desc    Toggle account privacy
 * @route   PATCH /api/users/me/privacy
 * @access  Private
 */
export const updatePrivacy = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const { isPrivate } = req.body;

    console.log('🔒 UPDATING PRIVACY');
    console.log('User:', userId);
    console.log('Set Private:', isPrivate);

    // Validate input
    if (typeof isPrivate !== 'boolean') {
        return next(new AppError(400, 'isPrivate must be a boolean'));
    }

    // Update user
    const user = await User.findByIdAndUpdate(
        userId,
        { isPrivate },
        { new: true }
    ).select('-password');

    if (!user) {
        return next(new AppError(404, 'User not found'));
    }

    console.log('✅ PRIVACY UPDATED');

    // If switching to public, auto-accept all pending requests
    if (!isPrivate) {
        const pendingRequests = await FollowRequest.find({
            to: userId,
            status: 'pending'
        });

        console.log(`📤 Auto-accepting ${pendingRequests.length} pending requests`);

        for (const request of pendingRequests) {
            // Add to followers/following
            await User.findByIdAndUpdate(request.from, {
                $addToSet: { following: userId },
                $inc: { followingCount: 1 }
            });

            await User.findByIdAndUpdate(userId, {
                $addToSet: { followers: request.from },
                $inc: { followerCount: 1 }
            });

            // Mark as accepted
            request.status = 'accepted';
            await request.save();
        }
    }

    res.status(200).json({
        success: true,
        message: `Account is now ${isPrivate ? 'private' : 'public'}`,
        isPrivate: user.isPrivate,
        user
    });
});

/**
 * @desc    Get current user info
 * @route   GET /api/users/me
 * @access  Private
 */
export const getCurrentUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    const user = await User.findById(userId)
        .select('-password')
        .populate('posts', '_id'); // Basic post info for count

    if (!user) {
        return next(new AppError(404, 'User not found'));
    }

    res.status(200).json(user);
});
