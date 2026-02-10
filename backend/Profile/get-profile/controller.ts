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
        let followsMe = false;
        let pendingFollowRequestFromMe = false;
        let pendingFollowRequestToMe = false;
        let pendingFriendRequestFromMe = false;
        let pendingFriendRequestToMe = false;
        let requestId = null;

        if (!isOwnProfile) {
            const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);
            const profileUserIdObj = new mongoose.Types.ObjectId(finalizedUser._id);

            // Check FOLLOW relationships
            const sentFollowRel = await Relationship.findOne({
                sender: currentUserIdObj,
                receiver: profileUserIdObj,
                requestType: 'follow'
            });

            const receivedFollowRel = await Relationship.findOne({
                sender: profileUserIdObj,
                receiver: currentUserIdObj,
                requestType: 'follow'
            });

            // Check FRIEND relationships
            const friendRel = await Relationship.findOne({
                $or: [
                    { sender: currentUserIdObj, receiver: profileUserIdObj },
                    { sender: profileUserIdObj, receiver: currentUserIdObj }
                ],
                requestType: 'friend'
            });

            // Determine statuses
            isFriend = friendRel?.status === 'accepted';
            isFollowing = sentFollowRel?.status === 'accepted' || isFriend;
            followsMe = receivedFollowRel?.status === 'accepted' || isFriend;

            pendingFollowRequestFromMe = sentFollowRel?.status === 'pending';
            pendingFollowRequestToMe = receivedFollowRel?.status === 'pending';

            if (friendRel) {
                const iAmSender = friendRel.sender.toString() === currentUserId;
                pendingFriendRequestFromMe = friendRel.status === 'pending' && iAmSender;
                pendingFriendRequestToMe = friendRel.status === 'pending' && !iAmSender;
            }

            requestId = sentFollowRel?._id || receivedFollowRel?._id || friendRel?._id || null;
        }

        // --- DYNAMIC COUNT CALCULATION ---
        // Followers: People who follow this user (requestType='follow') OR are friends (requestType='friend')
        const followerCount = await Relationship.countDocuments({
            $or: [
                { receiver: finalizedUser._id, status: 'accepted', requestType: 'follow' },
                {
                    $or: [{ receiver: finalizedUser._id }, { sender: finalizedUser._id }],
                    status: 'accepted',
                    requestType: 'friend'
                }
            ]
        });

        // Following: People this user follows (requestType='follow') OR are friends (requestType='friend')
        const followingCount = await Relationship.countDocuments({
            $or: [
                { sender: finalizedUser._id, status: 'accepted', requestType: 'follow' },
                {
                    $or: [{ receiver: finalizedUser._id }, { sender: finalizedUser._id }],
                    status: 'accepted',
                    requestType: 'friend'
                }
            ]
        });

        // Overwrite standard user counts with dynamic ones
        (finalizedUser as any).followerCount = followerCount;
        (finalizedUser as any).followingCount = followingCount;
        // Also overwrite array lengths for safety
        (finalizedUser as any).followers = { length: followerCount };
        (finalizedUser as any).following = { length: followingCount };


        (finalizedUser as any).relationship = {
            isFriend,
            isFollowing,
            followsMe,
            pendingFollowRequestFromMe,
            pendingFollowRequestToMe,
            pendingFriendRequestFromMe,
            pendingFriendRequestToMe,
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
