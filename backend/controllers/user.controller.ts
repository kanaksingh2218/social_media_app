import { Response, NextFunction } from 'express';
import User from '../Authentication/User.model';
import Relationship from '../models/Relationship.model';
import { catchAsync, AppError } from '../shared/middlewares/error.middleware';

/**
 * @desc    Toggle account privacy
 * @route   PATCH /api/users/me/privacy
 * @access  Private
 */
export const updatePrivacy = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const { isPrivate } = req.body;

    console.log('🔒 [PRIVACY-UPDATE] Start');
    console.log(`User: ${userId}, New State: ${isPrivate}`);

    // Validate input
    if (typeof isPrivate !== 'boolean') {
        console.error('❌ Validation failed: isPrivate must be a boolean');
        return next(new AppError(400, 'isPrivate must be a boolean'));
    }

    // Update user
    const user = await User.findByIdAndUpdate(
        userId,
        { isPrivate },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        console.error('❌ User not found');
        return next(new AppError(404, 'User not found'));
    }

    // If switching to public, auto-accept all pending follow requests
    if (!isPrivate) {
        try {
            const pendingRequests = await Relationship.find({
                receiver: userId,
                status: 'pending',
                requestType: 'follow'
            });

            if (pendingRequests.length > 0) {
                console.log(`📤 Auto-accepting ${pendingRequests.length} pending follow requests`);

                for (const request of pendingRequests) {
                    // 1. Update sender's following
                    await User.findByIdAndUpdate(request.sender, {
                        $addToSet: { following: userId },
                        // Recalculate count to be safe
                    });

                    // 2. Update receiver's followers
                    await User.findByIdAndUpdate(userId, {
                        $addToSet: { followers: request.sender },
                    });

                    // 3. Mark relationship as accepted
                    request.status = 'accepted';
                    await request.save();
                }

                // Final sync of counts for all affected users (or at least the current user)
                const updatedUser = await User.findById(userId);
                if (updatedUser) {
                    updatedUser.followerCount = updatedUser.followers.length;
                    updatedUser.followingCount = updatedUser.following.length;
                    await updatedUser.save();
                }

                // Also update counts for senders - simple approach: just let them be updated on next fetch
                // or we could iterate, but for the current user we want the returned object to be accurate
            }
        } catch (error) {
            console.error('❌ Error during auto-accepting requests:', error);
            // We don't fail the whole privacy update if this fails, but it's important to log
        }
    }

    // Get the most up-to-date user object for response
    const finalUser = await User.findById(userId).select('-password');

    console.log('✅ [PRIVACY-UPDATE] Success');
    res.status(200).json({
        success: true,
        message: `Account is now ${isPrivate ? 'private' : 'public'}`,
        isPrivate: finalUser?.isPrivate,
        user: finalUser
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

/**
 * @desc    Change password
 * @route   PUT /api/users/me/password
 */
export const changePassword = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 1. Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
        return next(new AppError(404, 'User not found'));
    }

    // 2. Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return next(new AppError(401, 'Incorrect current password'));
    }

    // 3. Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
});
