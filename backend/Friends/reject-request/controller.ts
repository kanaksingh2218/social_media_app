import { Response, NextFunction } from 'express';
import Relationship from '../../models/Relationship.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Reject a friend/follow request
 * @route   PUT /api/friends/reject/:requestId
 * @access  Private
 */
export const rejectFriendRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    console.log(`❌ [FRIENDS-REJECT] Attempting to reject request: ${requestId}`);

    // 1. Find request in Relationship model
    const rel = await Relationship.findById(requestId);
    if (!rel) {
        return next(new AppError(404, 'Request not found'));
    }

    // 2. Security: Only receiver can reject
    if (rel.receiver.toString() !== currentUserId) {
        return next(new AppError(403, 'You are not authorized to reject this request'));
    }

    // 3. State Validation: Must be pending
    if (rel.status !== 'pending') {
        return next(new AppError(400, `Request is already ${rel.status}`));
    }

    // 4. Update Status (Keeping for history, or could delete)
    rel.status = 'rejected';
    await rel.save();

    console.log(`🗑️ [FRIENDS-REJECT] Request ${requestId} rejected by user ${currentUserId}`);
    res.json({ message: 'Request rejected successfully' });
});

