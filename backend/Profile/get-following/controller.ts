import { Response, NextFunction } from 'express';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Get users followed by a user
 * @route   GET /api/profile/following/:userId
 * @access  Private
 */
export const getFollowing = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(userId).populate('following', 'username fullName profilePicture followers following friends').lean();

    if (!user) {
        return next(new AppError(404, 'User not found'));
    }

    const followingList = user.following as any[];

    // Optimization: Fetch all pending requests involving me and any of these users once
    const followingIds = followingList.map(f => f._id);
    const FriendRequest = (await import('../../Friends/FriendRequest.model')).default;

    const pendingRequests = await FriendRequest.find({
        $or: [
            { sender: currentUserId, receiver: { $in: followingIds }, status: 'pending' },
            { sender: { $in: followingIds }, receiver: currentUserId, status: 'pending' }
        ]
    }).lean();

    const followingWithRelationship = followingList.map(followedUser => {
        const followedId = followedUser._id.toString();

        const requestFromMe = pendingRequests.find(r => r.sender.toString() === currentUserId && r.receiver.toString() === followedId);
        const requestToMe = pendingRequests.find(r => r.sender.toString() === followedId && r.receiver.toString() === currentUserId);

        return {
            ...followedUser,
            relationship: {
                isFollowing: followedUser.followers?.some((id: any) => id.toString() === currentUserId),
                isFriend: followedUser.friends?.some((id: any) => id.toString() === currentUserId),
                pendingRequestFromMe: !!requestFromMe,
                pendingRequestToMe: !!requestToMe,
                requestId: requestFromMe?._id || requestToMe?._id || null
            }
        };
    });

    res.json(followingWithRelationship);
});
