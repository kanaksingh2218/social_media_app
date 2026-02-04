import { Response, NextFunction } from 'express';
import User from '../../Authentication/User.model';
import Notification from '../../shared/models/Notification.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Follow a user or send a follow request if private
 * @route   POST /api/profile/follow/:userId
 * @access  Private
 */
export const followUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (currentUserId === targetUserId) {
        return next(new AppError(400, "You cannot follow yourself"));
    }

    // 1. Check if target user exists (Lean check for efficiency)
    const targetUserCheck = await User.findById(targetUserId).select('isPrivate followers').lean();
    if (!targetUserCheck) {
        return next(new AppError(404, 'User not found'));
    }

    // 2. Handle Private Account Logic
    if (targetUserCheck.isPrivate && !targetUserCheck.followers.some(id => id.toString() === currentUserId)) {
        const { RelationshipService } = await import('../../shared/services/relationship.service');

        try {
            await RelationshipService.createRequest(currentUserId, targetUserId, 'follow');

            // Async notification (don't block the response)
            Notification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'friend_request'
            }).catch(err => console.error('[FOLLOW] Notification failed:', err.message));

            return res.status(201).json({
                message: 'Follow request sent to private account',
                isPending: true
            });
        } catch (error: any) {
            // Check if it's our duplicates error
            if (error.statusCode === 400 && (error.message.includes('already sent') || error.message.includes('already request'))) {
                return next(new AppError(400, error.message));
            }
            throw error;
        }
    }

    // 3. Check for Mutual Follow -> Multi-Directional Friendship
    const targetUser = await User.findById(targetUserId).select('followers following friends').lean();
    const currentUser = await User.findById(currentUserId).select('followers following friends').lean();

    // Check if target is already following me
    const amIFollowedByTarget = currentUser?.followers?.some(id => id.toString() === targetUserId) ||
        targetUser?.following?.some(id => id.toString() === currentUserId);

    // Check if there's a pending request FROM the target user TO me
    const FriendRequest = (await import('../../Friends/FriendRequest.model')).default;
    const requestFromTarget = await FriendRequest.findOne({
        sender: targetUserId,
        receiver: currentUserId,
        status: 'pending'
    });

    if (requestFromTarget) {
        // Auto-accept the request from target instead of sending a new one or just following
        requestFromTarget.status = 'accepted';
        await Promise.all([
            requestFromTarget.save(),
            User.findByIdAndUpdate(targetUserId, {
                $addToSet: { followers: currentUserId, following: currentUserId, friends: currentUserId }
            }),
            User.findByIdAndUpdate(currentUserId, {
                $addToSet: { followers: targetUserId, following: targetUserId, friends: targetUserId }
            })
        ]);

        return res.json({
            message: 'You followed each other and are now friends!',
            isPending: false,
            isFriend: true
        });
    }

    // Standard Follow logic with mutual check
    const updateOps: any[] = [
        User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } }, { new: true }).select('followers friends').lean(),
        User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } }, { new: true }).select('following friends').lean()
    ];

    // If target is already following me, make it a friendship
    if (amIFollowedByTarget) {
        updateOps[0] = User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId, friends: currentUserId } }, { new: true }).select('followers friends').lean();
        updateOps[1] = User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId, friends: targetUserId } }, { new: true }).select('following friends').lean();
    }

    const [updatedTarget, updatedMe] = await Promise.all(updateOps);

    // 4. Async target notification
    Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow'
    }).catch(err => console.error('[FOLLOW] Notification failed:', err.message));



    res.json({
        message: amIFollowedByTarget ? 'User followed and added to friends' : 'User followed successfully',
        followers: updatedTarget?.followers || [],
        following: updatedMe?.following || [],
        isPending: false,
        isFriend: !!amIFollowedByTarget
    });
});
