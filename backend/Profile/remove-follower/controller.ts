import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../../Authentication/User.model';

export const removeFollower = async (req: any, res: Response) => {
    try {
        const followerId = req.params.userId;
        const currentUserId = req.user.id;

        if (followerId === currentUserId) {
            return res.status(400).json({ message: "You cannot remove yourself as a follower" });
        }

        // 1. Remove follower from my followers list
        const currentUser = await User.findByIdAndUpdate(
            currentUserId,
            { $pull: { followers: new mongoose.Types.ObjectId(followerId) } },
            { new: true }
        ).select('followers');

        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found' });
        }

        // 2. Remove myself (currentUserId) from THEIR following list
        const followerUser = await User.findByIdAndUpdate(
            followerId,
            { $pull: { following: new mongoose.Types.ObjectId(currentUserId) } },
            { new: true }
        ).select('following');

        res.json({
            message: 'Follower removed successfully',
            followers: currentUser.followers,
            following: followerUser?.following || []
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
