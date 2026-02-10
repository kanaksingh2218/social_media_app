import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Relationship from '../../models/Relationship.model';
import User from '../../Authentication/User.model';

export const getFollowers = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const currentUserId = (req as any).user?.id || (req as any).user?._id;

        // 1. Find all relationships where:
        // - receiver is the target user AND status is 'accepted' (Followers)
        // - OR status is 'accepted' and type is 'friend' (Friends are also followers)
        const relationships = await Relationship.find({
            $or: [
                { receiver: userId, status: 'accepted', requestType: 'follow' },
                {
                    $or: [{ receiver: userId }, { sender: userId }],
                    status: 'accepted',
                    requestType: 'friend'
                }
            ]
        }).lean();

        // 2. Extract User IDs
        const followerIds = relationships.map(rel => {
            // For friend requests, the "other" person is the follower
            if (rel.requestType === 'friend') {
                return rel.sender.toString() === userId ? rel.receiver : rel.sender;
            }
            return rel.sender; // For follow requests, sender is the follower
        });

        // 3. Fetch User Details
        const followers = await User.find({ _id: { $in: followerIds } })
            .select('username fullName profilePicture isPrivate')
            .lean();

        // 4. Add relationship status for the current viewer (Am I following them?)
        // Optimization: We could do this in a better way, but loop is fine for pagination-less list
        const results = await Promise.all(followers.map(async (follower) => {
            // Check if I am following this follower
            let isFollowing = false;
            if (currentUserId) {
                const rel = await Relationship.findOne({
                    sender: currentUserId,
                    receiver: follower._id,
                    status: 'accepted'
                }).lean();
                // Check reverse for friends
                if (!rel) {
                    const friendRel = await Relationship.findOne({
                        $or: [
                            { sender: currentUserId, receiver: follower._id },
                            { sender: follower._id, receiver: currentUserId }
                        ],
                        status: 'accepted',
                        requestType: 'friend'
                    }).lean();
                    if (friendRel) isFollowing = true;
                } else {
                    isFollowing = true;
                }
            }
            return {
                ...follower,
                isFollowing
            };
        }));

        res.json(results);
    } catch (error: any) {
        console.error('getFollowers Error:', error);
        res.status(500).json({ message: 'Failed to fetch followers' });
    }
};

export const getFollowing = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const currentUserId = (req as any).user?.id || (req as any).user?._id;

        // 1. Find all relationships where:
        // - sender is the target user AND status is 'accepted' (Following)
        // - OR status is 'accepted' and type is 'friend' (Friends are acting as following)
        const relationships = await Relationship.find({
            $or: [
                { sender: userId, status: 'accepted', requestType: 'follow' },
                {
                    $or: [{ receiver: userId }, { sender: userId }],
                    status: 'accepted',
                    requestType: 'friend'
                }
            ]
        }).lean();

        // 2. Extract User IDs
        const followingIds = relationships.map(rel => {
            // For friend requests, the "other" person is being followed
            if (rel.requestType === 'friend') {
                return rel.sender.toString() === userId ? rel.receiver : rel.sender;
            }
            return rel.receiver; // For follow requests, receiver is being followed
        });

        // 3. Fetch User Details
        const following = await User.find({ _id: { $in: followingIds } })
            .select('username fullName profilePicture isPrivate')
            .lean();

        // 4. Add relationship status for the current viewer
        const results = await Promise.all(following.map(async (followedUser) => {
            let isFollowing = false;
            if (currentUserId) {
                // If I am viewing my own profile, I am obviously following them (since this is MY following list)
                // But if viewing someone else's profile, check if *I* follow these users
                if (currentUserId === userId) {
                    isFollowing = true;
                } else {
                    const rel = await Relationship.findOne({
                        sender: currentUserId,
                        receiver: followedUser._id,
                        status: 'accepted'
                    }).lean();
                    if (!rel) {
                        const friendRel = await Relationship.findOne({
                            $or: [
                                { sender: currentUserId, receiver: followedUser._id },
                                { sender: followedUser._id, receiver: currentUserId }
                            ],
                            status: 'accepted',
                            requestType: 'friend'
                        }).lean();
                        if (friendRel) isFollowing = true;
                    } else {
                        isFollowing = true;
                    }
                }
            }
            return {
                ...followedUser,
                isFollowing
            };
        }));

        res.json(results);
    } catch (error: any) {
        console.error('getFollowing Error:', error);
        res.status(500).json({ message: 'Failed to fetch following' });
    }
};
