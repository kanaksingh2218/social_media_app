import { Request, Response, NextFunction } from 'express';
import Relationship from '../models/Relationship.model';
import User from '../Authentication/User.model';
import { catchAsync, AppError } from '../shared/middlewares/error.middleware';

/**
 * @desc    Get pending follow requests for current user
 * @route   GET /api/users/follow-requests
 * @access  Private
 */
export const getPendingRequests = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.id; // Current logged-in user (receiver)

    console.log('📥 FETCHING PENDING REQUESTS FOR USER:', userId);

    const requests = await Relationship.find({
        receiver: userId,  // Requests sent TO this user
        status: 'pending',
        requestType: 'follow'
    })
        .populate('sender', 'username fullName profilePicture bio')
        .sort({ createdAt: -1 });

    console.log('📋 FOUND REQUESTS:', requests.length);

    // Map sender to 'from' for frontend compatibility if needed, 
    // but Relationship model uses 'sender'
    const formattedRequests = requests.map(req => ({
        ...req.toObject(),
        from: req.sender // Legacy support for frontend
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
    const userId = req.user.id; // Current user is the receiver

    console.log('✅ ACCEPTING REQUEST:', requestId, 'BY USER:', userId);

    const request = await Relationship.findOne({
        _id: requestId,
        receiver: userId,
        status: 'pending',
        requestType: 'follow'
    });

    if (!request) {
        return next(new AppError(404, 'Request not found or already processed'));
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    const senderId = request.sender;

    // Add to followers/following arrays and update counts
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

    console.log('✨ Request accepted successfully');

    res.status(200).json({ message: 'Request accepted', status: 'following' });
});

/**
 * @desc    Reject/Decline a follow request
 * @route   DELETE /api/users/follow-requests/:requestId
 * @access  Private
 */
export const declineRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const userId = req.user.id;

    console.log('❌ DECLINING REQUEST:', requestId, 'BY USER:', userId);

    const result = await Relationship.findOneAndDelete({
        _id: requestId,
        receiver: userId,
        status: 'pending',
        requestType: 'follow'
    });

    if (!result) {
        return next(new AppError(404, 'Request not found or already processed'));
    }

    console.log('🗑️ Request declined successfully');

    res.status(200).json({ message: 'Request declined' });
});

/**
 * @desc    Send follow request
 * @route   POST /api/users/:userId/follow
 * @access  Private
 */
export const sendFollowRequest = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { userId: targetUserId } = req.params; // User to follow
    const currentUserId = req.user.id; // Current user

    console.log('📤 SENDING FOLLOW REQUEST');
    console.log('From:', currentUserId);
    console.log('To:', targetUserId);

    if (targetUserId === currentUserId) {
        return next(new AppError(400, 'Cannot follow yourself'));
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
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
            return res.status(400).json({ message: 'Already following this user' });
        }
        if (existingRelationship.status === 'pending') {
            return res.status(400).json({ message: 'Request already sent' });
        }
    }

    // If target user is private, create pending request
    if (targetUser.isPrivate) {
        const newRequest = await Relationship.create({
            sender: currentUserId,
            receiver: targetUserId,
            status: 'pending',
            requestType: 'follow'
        });

        // Notification
        const { createNotification } = require('./notification.controller');
        await createNotification({
            to: targetUserId,
            from: currentUserId,
            type: 'follow_request',
            message: 'sent you a follow request'
        });

        console.log('✅ REQUEST CREATED:', newRequest._id);

        return res.status(201).json({
            message: 'Follow request sent',
            status: 'requested',
            requestId: newRequest._id
        });
    }

    // If public, follow immediately
    await Relationship.create({
        sender: currentUserId,
        receiver: targetUserId,
        status: 'accepted',
        requestType: 'follow'
    });

    // Update Counts/Arrays
    await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId },
        $inc: { followerCount: 1 }
    });

    await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId },
        $inc: { followingCount: 1 }
    });

    // Notification
    const { createNotification } = require('./notification.controller');
    await createNotification({
        to: targetUserId,
        from: currentUserId,
        type: 'follow',
        message: 'started following you'
    });

    res.status(200).json({ message: 'Now following', status: 'following' });
});

/**
 * @desc    Get relationship status with a user
 * @route   GET /api/users/:userId/relationship
 * @access  Private
 */
export const getRelationshipStatus = catchAsync(async (req: any, res: Response) => {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
        return res.status(200).json({ status: 'self' });
    }

    // Check if following or requested
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
            return res.status(200).json({ status: 'requested', requestId: relationship._id });
        }
    }

    // Check if they want to follow current user (pending acceptance)
    const reverseRelationship = await Relationship.findOne({
        sender: targetUserId,
        receiver: currentUserId,
        status: 'pending',
        requestType: 'follow'
    });

    if (reverseRelationship) {
        return res.status(200).json({ status: 'pending_acceptance', requestId: reverseRelationship._id });
    }

    res.status(200).json({ status: 'none' });
});

/**
 * @desc    Debug endpoint to see all requests in database
 * @route   GET /api/users/debug/all-requests
 */
export const getAllRequestsDebug = catchAsync(async (req: Request, res: Response) => {
    const allRequests = await Relationship.find({ requestType: 'follow' })
        .populate('sender', 'username')
        .populate('receiver', 'username');

    console.log('🗄️ ALL REQUESTS IN DATABASE:', allRequests.length);

    res.status(200).json({
        total: allRequests.length,
        requests: allRequests
    });
});
