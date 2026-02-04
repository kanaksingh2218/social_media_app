import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Relationship from '../models/Relationship.model';
import User from '../Authentication/User.model';
import { catchAsync, AppError } from '../shared/middlewares/error.middleware';
import { getFollowStatus, getBulkFollowStatus, validateFollowAction } from '../utils/followHelpers';

/**
 * @desc    Follow a user
 * @route   POST /api/follow/:userId
 * @access  Private
 */
export const followUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Validation
    try {
        validateFollowAction(currentUserId, userId);
    } catch (err: any) {
        return next(new AppError(400, err.message));
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
        return next(new AppError(404, 'User not found'));
    }

    const senderId = new mongoose.Types.ObjectId(currentUserId);
    const receiverId = new mongoose.Types.ObjectId(userId);

    // Use findOneAndUpdate with upsert to prevent race conditions
    const relationship = await Relationship.findOneAndUpdate(
        { sender: senderId, receiver: receiverId, requestType: 'follow' },
        {
            sender: senderId,
            receiver: receiverId,
            status: 'accepted', // Auto-accept for now (can be 'pending' for private accounts)
            requestType: 'follow'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update User model followers/following arrays
    await Promise.all([
        User.findByIdAndUpdate(receiverId, { $addToSet: { followers: senderId } }),
        User.findByIdAndUpdate(senderId, { $addToSet: { following: receiverId } })
    ]);

    // Check if mutual (friends)
    const reverseRelationship = await Relationship.findOne({
        sender: receiverId,
        receiver: senderId,
        status: 'accepted',
        requestType: 'follow'
    });

    const isFriend = !!reverseRelationship;

    // If mutual, update friends arrays
    if (isFriend) {
        await Promise.all([
            User.findByIdAndUpdate(senderId, { $addToSet: { friends: receiverId } }),
            User.findByIdAndUpdate(receiverId, { $addToSet: { friends: senderId } })
        ]);
    }

    res.status(200).json({
        success: true,
        message: 'Successfully followed user',
        relationship,
        isFriend,
        isPending: relationship.status === 'pending'
    });
});

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/unfollow/:userId
 * @access  Private
 */
export const unfollowUser = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const senderId = new mongoose.Types.ObjectId(currentUserId);
    const receiverId = new mongoose.Types.ObjectId(userId);

    // Delete the relationship
    const relationship = await Relationship.findOneAndDelete({
        sender: senderId,
        receiver: receiverId,
        requestType: 'follow'
    });

    if (!relationship) {
        return next(new AppError(404, 'Relationship not found'));
    }

    // Update User model arrays
    await Promise.all([
        User.findByIdAndUpdate(receiverId, { $pull: { followers: senderId } }),
        User.findByIdAndUpdate(senderId, { $pull: { following: receiverId } }),
        // Remove from friends if they were friends
        User.findByIdAndUpdate(senderId, { $pull: { friends: receiverId } }),
        User.findByIdAndUpdate(receiverId, { $pull: { friends: senderId } })
    ]);

    res.status(200).json({
        success: true,
        message: 'Successfully unfollowed user'
    });
});

/**
 * @desc    Accept a follow request
 * @route   POST /api/follow-request/accept/:requestId
 * @access  Private
 */
export const acceptRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const request = await Relationship.findById(requestId);
    if (!request) {
        return next(new AppError(404, 'Request not found'));
    }

    // Validate: user must be the receiver
    if (request.receiver.toString() !== currentUserId) {
        return next(new AppError(403, 'Not authorized to accept this request'));
    }

    // Validate: must be pending
    if (request.status !== 'pending') {
        return next(new AppError(400, `Request is already ${request.status}`));
    }

    // Update status to accepted
    request.status = 'accepted';
    await request.save();

    // Update User model arrays
    await Promise.all([
        User.findByIdAndUpdate(request.receiver, { $addToSet: { followers: request.sender } }),
        User.findByIdAndUpdate(request.sender, { $addToSet: { following: request.receiver } })
    ]);

    // Check if mutual (friends)
    const reverseRelationship = await Relationship.findOne({
        sender: request.receiver,
        receiver: request.sender,
        status: 'accepted',
        requestType: 'follow'
    });

    const isFriend = !!reverseRelationship;

    if (isFriend) {
        await Promise.all([
            User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } }),
            User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } })
        ]);
    }

    res.status(200).json({
        success: true,
        message: 'Request accepted successfully',
        relationship: request,
        isFriend
    });
});

/**
 * @desc    Reject a follow request
 * @route   POST /api/follow-request/reject/:requestId
 * @access  Private
 */
export const rejectRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const request = await Relationship.findById(requestId);
    if (!request) {
        return next(new AppError(404, 'Request not found'));
    }

    // Validate: user must be the receiver
    if (request.receiver.toString() !== currentUserId) {
        return next(new AppError(403, 'Not authorized to reject this request'));
    }

    // Delete the request
    await Relationship.findByIdAndDelete(requestId);

    res.status(200).json({
        success: true,
        message: 'Request rejected successfully'
    });
});

/**
 * @desc    Get followers of a user
 * @route   GET /api/followers/:userId
 * @access  Private
 */
export const getFollowers = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const relationships = await Relationship.find({
        receiver: userId,
        status: 'accepted',
        requestType: 'follow'
    }).populate('sender', 'fullName username avatar');

    const followers = relationships.map(r => r.sender);

    res.status(200).json({
        success: true,
        count: followers.length,
        followers
    });
});

/**
 * @desc    Get following of a user
 * @route   GET /api/following/:userId
 * @access  Private
 */
export const getFollowing = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const relationships = await Relationship.find({
        sender: userId,
        status: 'accepted',
        requestType: 'follow'
    }).populate('receiver', 'fullName username avatar');

    const following = relationships.map(r => r.receiver);

    res.status(200).json({
        success: true,
        count: following.length,
        following
    });
});

/**
 * @desc    Get pending requests (received by current user)
 * @route   GET /api/follow-requests/pending
 * @access  Private
 */
export const getPendingRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const currentUserId = req.user.id;

    const requests = await Relationship.find({
        receiver: currentUserId,
        status: 'pending',
        requestType: 'follow'
    }).populate('sender', 'fullName username avatar');

    res.status(200).json({
        success: true,
        count: requests.length,
        requests
    });
});

/**
 * @desc    Get sent requests (sent by current user)
 * @route   GET /api/follow-requests/sent
 * @access  Private
 */
export const getSentRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const currentUserId = req.user.id;

    const requests = await Relationship.find({
        sender: currentUserId,
        status: 'pending',
        requestType: 'follow'
    }).populate('receiver', 'fullName username avatar');

    res.status(200).json({
        success: true,
        count: requests.length,
        requests
    });
});

/**
 * @desc    Check follow status with a user
 * @route   GET /api/follow-status/:userId
 * @access  Private
 */
export const checkFollowStatus = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const status = await getFollowStatus(currentUserId, userId);

    res.status(200).json({
        success: true,
        status
    });
});

/**
 * @desc    Check bulk follow status
 * @route   POST /api/follow-status/bulk
 * @access  Private
 */
export const checkBulkFollowStatus = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userIds } = req.body;
    const currentUserId = req.user.id;

    if (!Array.isArray(userIds)) {
        return next(new AppError(400, 'userIds must be an array'));
    }

    const statuses = await getBulkFollowStatus(currentUserId, userIds);

    res.status(200).json({
        success: true,
        statuses
    });
});
