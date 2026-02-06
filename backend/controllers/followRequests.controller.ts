import { Request, Response, NextFunction } from 'express';
import FollowRequest from '../models/FollowRequest.model';
import User from '../Authentication/User.model';

// GET /api/users/follow-requests - Get pending requests for current user
export const getPendingRequests = async (req: any, res: Response) => {
    try {
        const userId = req.user.id; // Current logged-in user

        console.log('📥 FETCHING PENDING REQUESTS FOR USER:', userId);

        const requests = await FollowRequest.find({
            to: userId,  // Requests sent TO this user
            status: 'pending'
        })
            .populate('from', 'username fullName profilePicture bio')
            .sort({ createdAt: -1 });

        console.log('📋 FOUND REQUESTS:', requests.length);
        // console.log('Requests data:', requests); // Uncomment if detailed data dump is needed

        res.json(requests);
    } catch (error: any) {
        console.error('❌ ERROR FETCHING REQUESTS:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/follow-requests/:requestId/accept - Accept a follow request
export const acceptRequest = async (req: any, res: Response) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        console.log('✅ ACCEPTING REQUEST:', requestId, 'BY USER:', userId);

        // Find the request
        const request = await FollowRequest.findOne({
            _id: requestId,
            to: userId,
            status: 'pending'
        });

        if (!request) {
            console.log('❌ Request not found or not pending');
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update request status
        request.status = 'accepted';
        await request.save();

        // Add to followers/following
        await User.findByIdAndUpdate(request.from, {
            $addToSet: { following: userId },
            $inc: { followingCount: 1 }
        });

        await User.findByIdAndUpdate(userId, {
            $addToSet: { followers: request.from },
            $inc: { followerCount: 1 }
        });

        console.log('✨ Request accepted successfully');

        res.json({ message: 'Request accepted', status: 'following' });
    } catch (error: any) {
        console.error('❌ ERROR ACCEPTING REQUEST:', error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/follow-requests/:requestId - Decline/delete a follow request
export const declineRequest = async (req: any, res: Response) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        console.log('❌ DECLINING REQUEST:', requestId, 'BY USER:', userId);

        const request = await FollowRequest.findOneAndDelete({
            _id: requestId,
            to: userId,
            status: 'pending'
        });

        if (!request) {
            console.log('❌ Request not found or not pending');
            return res.status(404).json({ message: 'Request not found' });
        }

        console.log('🗑️ Request declined successfully');

        res.json({ message: 'Request declined' });
    } catch (error: any) {
        console.error('❌ ERROR DECLINING REQUEST:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/:userId/follow - Send follow request
export const sendFollowRequest = async (req: any, res: Response) => {
    try {
        const { userId } = req.params; // User to follow
        const currentUserId = req.user.id; // Current user

        console.log('📤 SENDING FOLLOW REQUEST');
        console.log('From:', currentUserId);
        console.log('To:', userId);

        if (userId === currentUserId) {
            console.log('❌ Cannot follow yourself');
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if request already exists
        const existingRequest = await FollowRequest.findOne({
            from: currentUserId,
            to: userId,
            status: 'pending'
        });

        if (existingRequest) {
            console.log('⚠️ Request already exists:', existingRequest._id);
            return res.status(400).json({ message: 'Request already sent' });
        }

        // Check if already following
        const currentUser = await User.findById(currentUserId);
        if (currentUser?.following && currentUser.following.includes(userId as any)) {
            console.log('❌ Already following this user');
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Create new follow request
        const newRequest = await FollowRequest.create({
            from: currentUserId,
            to: userId,
            status: 'pending'
        });

        console.log('✅ REQUEST CREATED:', newRequest._id);

        res.status(201).json({
            message: 'Follow request sent',
            status: 'requested',
            requestId: newRequest._id
        });
    } catch (error: any) {
        console.error('❌ ERROR SENDING REQUEST:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/:userId/relationship - Get relationship status with a user
export const getRelationshipStatus = async (req: any, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (userId === currentUserId) {
            return res.json({ status: 'self' });
        }

        // Check if following
        const currentUser = await User.findById(currentUserId);
        if (currentUser?.following && currentUser.following.includes(userId as any)) {
            return res.json({ status: 'following' });
        }

        // Check if pending request from current user
        const sentRequest = await FollowRequest.findOne({
            from: currentUserId,
            to: userId,
            status: 'pending'
        });

        if (sentRequest) {
            return res.json({ status: 'requested', requestId: sentRequest._id });
        }

        // Check if pending request TO current user (they want to follow you)
        const receivedRequest = await FollowRequest.findOne({
            from: userId,
            to: currentUserId,
            status: 'pending'
        });

        if (receivedRequest) {
            return res.json({ status: 'pending_acceptance', requestId: receivedRequest._id });
        }

        // No relationship
        res.json({ status: 'none' });
    } catch (error: any) {
        console.error('❌ ERROR GETTING RELATIONSHIP STATUS:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/debug/all-requests - Debug endpoint to see all requests
export const getAllRequestsDebug = async (req: Request, res: Response) => {
    try {
        const allRequests = await FollowRequest.find({})
            .populate('from', 'username')
            .populate('to', 'username');

        console.log('🗄️ ALL REQUESTS IN DATABASE:', allRequests.length);

        res.json({
            total: allRequests.length,
            requests: allRequests
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
