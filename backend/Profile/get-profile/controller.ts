import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../../Authentication/User.model';
import Relationship from '../../models/Relationship.model';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'Invalid user target' });
        }



        // Build query
        let query: any = {};
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = userId;
        } else {
            // Escape special chars for safe regex lookup
            const escaped = userId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.username = { $regex: new RegExp(`^${escaped}$`, 'i') };
        }



        // Attempt find - Security: Exclude reset tokens and password
        const user = await User.findOne(query).select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {

            return res.status(404).json({ message: `User not found for: ${userId}` });
        }

        const populationPaths = [
            { path: 'followers', select: 'username profilePicture fullName' },
            { path: 'following', select: 'username profilePicture fullName' },
            { path: 'friends', select: 'username profilePicture fullName' }
        ];

        for (const path of populationPaths) {
            try {
                await user.populate(path);
            } catch (popError: any) {
                console.error(`[DEBUG] Population failed for path ${path.path}:`, popError.message);
                // We continue so the basic profile still loads
            }
        }

        // Security: Convert to object and clean sensitive fields before sending
        const finalizedUser = user.toObject();
        const currentUserId = (req as any).user?.id;

        if (currentUserId !== finalizedUser._id.toString()) {
            delete (finalizedUser as any).email;
        }

        // Relationship Status
        const isOwnProfile = currentUserId === finalizedUser._id.toString();

        let isFriend = false;
        let isFollowing = false;
        let pendingRequestFromMe = false;
        let pendingRequestToMe = false;
        let requestId = null;

        if (!isOwnProfile) {
            const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);
            const profileUserIdObj = new mongoose.Types.ObjectId(finalizedUser._id);

            const sentRelationship = await Relationship.findOne({
                sender: currentUserIdObj,
                receiver: profileUserIdObj,
                requestType: 'follow'
            });

            const receivedRelationship = await Relationship.findOne({
                sender: profileUserIdObj,
                receiver: currentUserIdObj,
                requestType: 'follow'
            });

            isFriend = sentRelationship?.status === 'accepted' && receivedRelationship?.status === 'accepted';
            isFollowing = sentRelationship?.status === 'accepted';
            pendingRequestFromMe = sentRelationship?.status === 'pending';
            pendingRequestToMe = receivedRelationship?.status === 'pending';
            requestId = sentRelationship?._id || receivedRelationship?._id || null;
        }

        (finalizedUser as any).relationship = {
            isFriend,
            isFollowing,
            pendingRequestFromMe,
            pendingRequestToMe,
            pendingRequestType: (pendingRequestFromMe || pendingRequestToMe) ? 'follow' : null,
            requestId
        };


        res.json(finalizedUser);

    } catch (error: any) {
        console.error('[CRITICAL] Backend getProfile ERROR:', error);
        res.status(500).json({
            message: error.message,
            stack: error.stack,
            debugInfo: 'Critical failure in getProfile controller'
        });
    }
};
