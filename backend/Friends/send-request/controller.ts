import { Request, Response } from 'express';
import FriendRequest from '../FriendRequest.model';
import User from '../../Authentication/User.model';

import Notification from '../../shared/models/Notification.model';

export const sendFriendRequest = async (req: any, res: Response) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "Can't send request to yourself" });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already friends
        const sender = await User.findById(senderId);
        if (sender?.friends.includes(receiverId)) {
            return res.status(400).json({ message: 'You are already friends with this user' });
        }

        const existing = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ],
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ message: 'A friend request is already pending between you' });
        }

        const fr = await FriendRequest.create({
            sender: senderId,
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
