import { Response, NextFunction } from 'express';
import User from '../../Authentication/User.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Get followers of a user
 * @route   GET /api/profile/followers/:userId
 * @access  Private
 */
export const getFollowers = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(userId).populate('followers', 'username fullName profilePicture followers following friends').lean();

    if (!user) {
        return next(new AppError(404, 'User not found'));
    }

    const followersList = user.followers as any[];

    // Optimization: Fetch all pending requests involving me and any of these users once
    const followerIds = followersList.map(f => f._id);
    const FriendRequest = (await import('../../Friends/FriendRequest.model')).default;

    const pendingRequests = await FriendRequest.find({
        $or: [
            { sender: currentUserId, receiver: { $in: followerIds }, status: 'pending' },
            { sender: { $in: followerIds }, receiver: currentUserId, status: 'pending' }
        ]
    }).lean();

    const followersWithRelationship = followersList.map(follower => {
        const followerId = follower._id.toString();
        // Check my requests map
        const requestFromMe = pendingRequests.find(r => r.sender.toString() === currentUserId && r.receiver.toString() === followerId);
        const requestToMe = pendingRequests.find(r => r.sender.toString() === followerId && r.receiver.toString() === currentUserId);

        return {
            ...follower,
            relationship: {
                isFollowing: follower.followers?.some((id: any) => id.toString() === currentUserId),
                isFriend: follower.friends?.some((id: any) => id.toString() === currentUserId),
                pendingRequestFromMe: !!requestFromMe,
                pendingRequestToMe: !!requestToMe,
                requestId: requestFromMe?._id || requestToMe?._id || null
            }
        };
    });

    res.json(followersWithRelationship);
});
