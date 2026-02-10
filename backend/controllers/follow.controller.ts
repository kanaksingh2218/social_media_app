import { Response, NextFunction } from 'express';
import User from '../Authentication/User.model';
import Relationship from '../models/Relationship.model';
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

    if (targetUserId === currentUserId) {
        return next(new AppError(400, 'Cannot follow yourself'));
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
        return next(new AppError(404, 'User not found'));
    }

    // Check existing relationship
    const existingRelationship = await Relationship.findOne({
        sender: currentUserId,
        receiver: targetUserId,
        requestType: 'follow'
    });

    if (existingRelationship) {
        if (existingRelationship.status === 'accepted') {
            return res.status(400).json({
                message: 'Already following this user',
                status: 'following'
            });
        }
        if (existingRelationship.status === 'pending') {
            return res.status(400).json({
                message: 'Request already sent',
                status: 'requested',
                requestId: existingRelationship._id
            });
        }
        // If rejected, we might allow re-requesting depending on business logic. 
        // For now, let's treat it as a new request if it was rejected previously?
        // Or specific logic. Assuming we can update 'rejected' to 'pending'.
    }

    // IF PRIVATE ACCOUNT: Create pending request
    if (targetUser.isPrivate) {
        let request;
        if (existingRelationship) {
            existingRelationship.status = 'pending';
            request = await existingRelationship.save();
        } else {
            request = await Relationship.create({
                sender: currentUserId,
                receiver: targetUserId,
                status: 'pending',
                requestType: 'follow'
            });
        }

        console.log('✅ FOLLOW REQUEST CREATED (Private Account):', request._id);

        // Notification
        const { createNotification } = require('./notification.controller');
        await createNotification({
            to: targetUserId,
            from: currentUserId,
            type: 'follow_request', // Distinct type for private requests
            message: 'sent you a follow request'
        });

        return res.status(201).json({
            message: 'Follow request sent',
            status: 'requested',
            requestId: request._id
        });
    }

    // IF PUBLIC ACCOUNT: Follow immediately
    if (existingRelationship) {
        existingRelationship.status = 'accepted';
        await existingRelationship.save();
    } else {
        await Relationship.create({
            sender: currentUserId,
            receiver: targetUserId,
            status: 'accepted',
            requestType: 'follow'
        });
    }

    // Update Counts
    await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId },
        $inc: { followerCount: 1 }
    });

    await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId },
        $inc: { followingCount: 1 }
    });

    // Notification for immediate follow
    const { createNotification } = require('./notification.controller');
    await createNotification({
        to: targetUserId,
        from: currentUserId,
        type: 'follow',
        message: 'started following you'
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

    // Remove from Relationship
    await Relationship.findOneAndDelete({
        sender: currentUserId,
        receiver: targetUserId,
        requestType: 'follow'
    });

    // Remove from following/followers counts/arrays
    await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
        $inc: { followerCount: -1 }
    });

    await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
        $inc: { followingCount: -1 }
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

    const requests = await Relationship.find({
        receiver: userId,
        status: 'pending',
        requestType: 'follow'
    })
        .populate('sender', 'username fullName profilePicture bio')
        .sort({ createdAt: -1 });

    console.log('📋 FOUND REQUESTS:', requests.length);

    // Map to expected format if frontend expects 'from'
    const formattedRequests = requests.map(req => ({
        ...req.toObject(),
        from: req.sender // Backend model has 'sender', frontend might expect 'from' based on old model
    }));

    res.status(200).json(formattedRequests);
});

/**
 * @desc    Get count of pending follow requests
 * @route   GET /api/users/follow-requests/count
 * @access  Private
 */
export const getPendingRequestsCount = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    const count = await Relationship.countDocuments({
        receiver: userId,
        status: 'pending',
        requestType: 'follow'
    });

    console.log('✅ Found', count, 'pending requests');

    res.status(200).json({ count });
});

/**
 * @desc    Get sent follow requests
 * @route   GET /api/follow/follow-requests/sent
 * @access  Private
 */
export const getSentFollowRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    console.log('📤 FETCHING SENT FOLLOW REQUESTS FOR:', userId);

    const requests = await Relationship.find({
        sender: userId,
        status: 'pending',
        requestType: 'follow'
    })
        .populate('receiver', 'username fullName profilePicture bio')
        .sort({ createdAt: -1 });

    console.log('📋 FOUND SENT REQUESTS:', requests.length);

    // Map to expected format with 'to' field
    const formattedRequests = requests.map(req => ({
        ...req.toObject(),
        to: req.receiver
    }));

    res.status(200).json(formattedRequests);
});

/**
 * @desc    Accept a follow request
 * @route   POST /api/users/follow-requests/:requestId/accept
 * @access  Private
 */
export const acceptRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const userId = req.user.id; // Receiver of the request

    console.log('✅ ACCEPTING REQUEST:', requestId);

    const request = await Relationship.findOne({
        _id: requestId,
        receiver: userId,
        status: 'pending',
        requestType: 'follow'
    });

    if (!request) {
        return next(new AppError(404, 'Request not found'));
    }

    // Update status
    request.status = 'accepted';
    await request.save();

    const senderId = request.sender;

    // Update Counts/Arrays
    await User.findByIdAndUpdate(senderId, {
        $addToSet: { following: userId },
        $inc: { followingCount: 1 }
    });

    await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: senderId },
        $inc: { followerCount: 1 }
    });

    // Notification
    const { createNotification } = require('./notification.controller');
    await createNotification({
        to: senderId,
        from: userId,
        type: 'follow', // Standard follow notification
        message: 'accepted your follow request'
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

    const result = await Relationship.findOneAndDelete({
        _id: requestId,
        receiver: userId,
        status: 'pending',
        requestType: 'follow'
    });

    if (!result) {
        return next(new AppError(404, 'Request not found'));
    }

    console.log('✅ REQUEST REJECTED');

    res.status(200).json({ message: 'Request rejected' });
});

/**
 * @desc    Remove a follower
 * @route   DELETE /api/users/:userId/follower
 * @access  Private
 */
export const removeFollower = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const followerUserId = req.params.userId;
    const currentUserId = req.user.id;

    console.log(`🗑️ REMOVING FOLLOWER: ${followerUserId} from ${currentUserId}`);

    // Find and delete the follow relationship where they follow me
    const relationship = await Relationship.findOneAndDelete({
        sender: followerUserId,
        receiver: currentUserId,
        status: 'accepted',
        requestType: 'follow'
    });

    if (!relationship) {
        return next(new AppError(404, 'Follower relationship not found'));
    }

    // Update follower's following count and array
    await User.findByIdAndUpdate(followerUserId, {
        $pull: { following: currentUserId },
        $inc: { followingCount: -1 }
    });

    // Update my followers count and array
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { followers: followerUserId },
        $inc: { followerCount: -1 }
    });

    console.log('✅ FOLLOWER REMOVED');

    res.status(200).json({
        message: 'Follower removed successfully',
        removedUserId: followerUserId
    });
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

    // Check relationship from DB directly for truth
    const relationship = await Relationship.findOne({
        sender: currentUserId,
        receiver: targetUserId,
        requestType: 'follow'
    });

    if (relationship) {
        if (relationship.status === 'accepted') {
            return res.status(200).json({ status: 'following' });
        }
        if (relationship.status === 'pending') {
            return res.status(200).json({
                status: 'requested',
                requestId: relationship._id
            });
        }
    }

    // Check if they follow YOU (pending acceptance)
    const reverseRelationship = await Relationship.findOne({
        sender: targetUserId,
        receiver: currentUserId,
        status: 'pending',
        requestType: 'follow'
    });

    if (reverseRelationship) {
        return res.status(200).json({
            status: 'pending_acceptance',
            requestId: reverseRelationship._id
        });
    }

    res.status(200).json({ status: 'none' });
});
