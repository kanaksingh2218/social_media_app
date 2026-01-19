import { Request, Response } from 'express';
import FriendRequest from '../FriendRequest.model';
import User from '../../1) Authentication/User.model';

import Notification from '../../shared/models/Notification.model';

export const sendFriendRequest = async (req: any, res: Response) => {
    try {
        const { receiverId } = req.body;
        if (req.user.id === receiverId) {
            return res.status(400).json({ message: "Can't send request to yourself" });
        }
        const existing = await FriendRequest.findOne({
            sender: req.user.id,
            receiver: receiverId,
            status: 'pending'
        });
        if (existing) {
            return res.status(400).json({ message: 'Request already sent' });
        }
        const fr = await FriendRequest.create({
            sender: req.user.id,
            receiver: receiverId
        });

        // Create notification
        await Notification.create({
            recipient: receiverId,
            sender: req.user.id,
            type: 'friend_request'
        });

        res.status(201).json(fr);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
