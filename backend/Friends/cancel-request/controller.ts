import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Cancel a pending friend request
 * @route   DELETE /api/friends/cancel/:userId
 * @access  Private
 */
export const cancelFriendRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    console.log(`[FRIENDS] Attempting to cancel request: sender=${currentUserId}, receiver=${targetUserId}`);

    const { RelationshipService } = await import('../../shared/services/relationship.service');

    // Idempotent cancellation
    await RelationshipService.cancelRequest(currentUserId, targetUserId);

    console.log(`[FRIENDS] Request from ${currentUserId} to ${targetUserId} cancelled`);

    // Return unified relationship status
    res.json({
        message: 'Friend request cancelled successfully',
        relationship: {
            isFriend: false,
            isFollowing: false,
            pendingRequestFromMe: false,
            pendingRequestToMe: false
        }
    });
});
