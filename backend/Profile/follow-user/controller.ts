import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

import Notification from '../../shared/models/Notification.model';

export const followUser = async (req: any, res: Response) => {
    try {
        const targetUserId = req.params.userId;
        if (req.user.id === targetUserId) return res.status(400).json({ message: "You can't follow yourself" });

        await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: req.user.id } });
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: targetUserId } });

        // Create notification
        await Notification.create({
            recipient: targetUserId,
            sender: req.user.id,
            type: 'follow'
        });

        res.json({ message: 'User followed successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
