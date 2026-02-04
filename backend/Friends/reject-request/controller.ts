import { Response, NextFunction } from 'express';
import FriendRequest from '../FriendRequest.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Reject a friend request
 * @route   PUT /api/friends/reject/:requestId
 * @access  Private
 */
export const rejectFriendRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    // 1. Find request
    const fr = await FriendRequest.findById(requestId);
    if (!fr) {
        return next(new AppError(404, 'Friend request not found'));
    }

    // 2. Security: Only receiver can reject
    if (fr.receiver.toString() !== currentUserId) {
        return next(new AppError(403, 'You are not authorized to reject this request'));
    }

    // 3. State Validation: Must be pending
    if (fr.status !== 'pending') {
        return next(new AppError(400, `Request is already ${fr.status}`));
    }

    // 4. Update Status (We could delete it, but keeping status: 'rejected' is safer for history)
    fr.status = 'rejected';
    await fr.save();

    console.log(`[FRIENDS] Request ${requestId} rejected by user ${currentUserId}`);
    res.json({ message: 'Friend request rejected successfully' });
});
