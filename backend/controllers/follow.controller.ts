import { Response, NextFunction } from 'express';
import User from '../Authentication/User.model';
import FollowRequest from '../models/FollowRequest.model';
import { catchAsync, AppError } from '../shared/middlewares/error.middleware';

/**
 * @desc    Follow a user or send a follow request
 * @route   POST /api/users/:userId/follow
 * @access  Private
 */
export const followUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    console.log('📤 FOLLOW REQUEST');
    console.log('Current User:', currentUserId);
    console.log('Target User:', targetUserId);

    // Can't follow yourself
    if (targetUserId === currentUserId) {
        return next(new AppError(400, 'Cannot follow yourself'));
    }

    // Get both users
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
        return next(new AppError(404, 'User not found'));
    }

    if (!currentUser) {
        return next(new AppError(404, 'Current user not found'));
    }

    // Check if already following
    if (currentUser.following.includes(targetUserId as any)) {
        return res.status(400).json({
            message: 'Already following this user',
            status: 'following'
        });
    }

    // Check if request already exists
    const existingRequest = await FollowRequest.findOne({
        from: currentUserId,
        to: targetUserId,
        status: 'pending'
    });

    if (existingRequest) {
        return res.status(400).json({
            message: 'Request already sent',
            status: 'requested',
            requestId: existingRequest._id
        });
    }

    // IF PRIVATE ACCOUNT: Create follow request
    if (targetUser.isPrivate) {
        const newRequest = await FollowRequest.create({
            from: currentUserId,
            to: targetUserId,
            status: 'pending'
        });

        console.log('✅ FOLLOW REQUEST CREATED (Private Account):', newRequest);

        return res.status(201).json({
            message: 'Follow request sent',
            status: 'requested',
            requestId: newRequest._id
        });
    }

    // IF PUBLIC ACCOUNT: Follow immediately
    await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId },
        $inc: { followerCount: 1 }
    });

    await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId },
        $inc: { followingCount: 1 }
    });

    console.log('✅ NOW FOLLOWING (Public Account)');

    res.status(200).json({
        message: 'Now following',
        status: 'following'
    });
});

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:userId/follow
 * @access  Private
 */
export const unfollowUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    console.log('🔻 UNFOLLOW REQUEST');
    console.log('Unfollowing:', targetUserId);

    // Remove from following/followers
    await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
        $inc: { followerCount: -1 }
    });

    await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
        $inc: { followingCount: -1 }
    });

    // Also delete any pending request
    await FollowRequest.deleteOne({
        from: currentUserId,
        to: targetUserId
    });

    console.log('✅ UNFOLLOWED');

    res.status(200).json({
        message: 'Unfollowed',
        status: 'none'
    });
});

/**
 * @desc    Get pending follow requests sent TO the current user
 * @route   GET /api/users/follow-requests
 * @access  Private
 */
export const getPendingRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    console.log('📥 FETCHING PENDING REQUESTS FOR:', userId);

    const requests = await FollowRequest.find({
        to: userId,
        status: 'pending'
    })
        .populate('from', 'username fullName profilePicture bio')
        .sort({ createdAt: -1 });

    console.log('📋 FOUND REQUESTS:', requests.length);

    res.status(200).json(requests);
});

/**
 * @desc    Get count of pending follow requests
 * @route   GET /api/users/follow-requests/count
 * @access  Private
 */
export const getPendingRequestsCount = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    console.log('🔢 FETCHING REQUEST COUNT FOR:', userId);

    const count = await FollowRequest.countDocuments({
        to: userId,
        status: 'pending'
    });

    console.log('✅ Found', count, 'pending requests');

    res.status(200).json({ count });
});

/**
 * @desc    Accept a follow request
 * @route   POST /api/users/follow-requests/:requestId/accept
 * @access  Private
 */
export const acceptRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const userId = req.user.id;

    console.log('✅ ACCEPTING REQUEST:', requestId);

    const request = await FollowRequest.findOne({
        _id: requestId,
        to: userId,
        status: 'pending'
    });

    if (!request) {
        return next(new AppError(404, 'Request not found'));
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Create notification
    const { createNotification } = require('./notification.controller');
    await createNotification({
        to: request.from.toString(),
        from: userId,
        type: 'follow',
        message: 'accepted your follow request'
    });

    // Add to followers/following
    await User.findByIdAndUpdate(request.from, {
        $addToSet: { following: userId },
        $inc: { followingCount: 1 }
    });

    await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: request.from },
        $inc: { followerCount: 1 }
    });

    console.log('✅ REQUEST ACCEPTED');

    res.status(200).json({
        message: 'Request accepted',
        status: 'following'
    });
});

/**
 * @desc    Reject a follow request
 * @route   DELETE /api/users/follow-requests/:requestId
 * @access  Private
 */
export const rejectRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const userId = req.user.id;

    console.log('❌ REJECTING REQUEST:', requestId);

    const result = await FollowRequest.findOneAndDelete({
        _id: requestId,
        to: userId,
        status: 'pending'
    });

    if (!result) {
        return next(new AppError(404, 'Request not found'));
    }

    console.log('✅ REQUEST REJECTED');

    res.status(200).json({ message: 'Request rejected' });
});

/**
 * @desc    Get relationship status with another user
 * @route   GET /api/users/:userId/relationship
 * @access  Private
 */
export const getRelationshipStatus = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
        return res.status(200).json({ status: 'self' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        return next(new AppError(404, 'User not found'));
    }

    // Check if following
    if (currentUser.following.includes(targetUserId as any)) {
        return res.status(200).json({ status: 'following' });
    }

    // Check if you sent a pending request
    const sentRequest = await FollowRequest.findOne({
        from: currentUserId,
        to: targetUserId,
        status: 'pending'
    });

    if (sentRequest) {
        return res.status(200).json({
            status: 'requested',
            requestId: sentRequest._id
        });
    }

    // Check if they sent YOU a request
    const receivedRequest = await FollowRequest.findOne({
        from: targetUserId,
        to: currentUserId,
        status: 'pending'
    });

    if (receivedRequest) {
        return res.status(200).json({
            status: 'pending_acceptance',
            requestId: receivedRequest._id
        });
    }

    res.status(200).json({ status: 'none' });
});
