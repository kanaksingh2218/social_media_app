import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

import Notification from '../../shared/models/Notification.model';

export const followUser = async (req: any, res: Response) => {
    try {
        const targetUserId = req.params.userId;

        // Check if user exists
        const targetUserCheck = await User.findById(targetUserId);
        if (!targetUserCheck) return res.status(404).json({ message: 'User not found' });

        if (req.user.id === targetUserId) return res.status(400).json({ message: "You can't follow yourself" });

        const targetUser = await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: req.user.id } }, { new: true }).select('followers');
        const currentUser = await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: targetUserId } }, { new: true }).select('following');

        // Create notification
        await Notification.create({
            recipient: targetUserId,
            sender: req.user.id,
            type: 'follow'
        });

        res.json({
            message: 'User followed successfully',
            followers: targetUser?.followers,
            following: currentUser?.following
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
