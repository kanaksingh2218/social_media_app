import { Request, Response } from 'express';
import User from '../../Authentication/User.model';
import FriendRequest from '../FriendRequest.model';

export const getSuggestions = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get all pending requests where user is either sender or receiver
        const pendingRequests = await FriendRequest.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: 'pending'
        });

        const excludedIds = [
            userId,
            ...user.friends,
            ...pendingRequests.map(fr => fr.sender.toString()),
            ...pendingRequests.map(fr => fr.receiver.toString())
        ];

        // Basic suggestion: users who are not friends, not the user themselves, and have no pending requests
        const suggestions = await User.find({
            _id: { $nin: excludedIds }
        }).limit(10).select('_id username profilePicture fullName');

        res.json(suggestions);
    } catch (error: any) {
        console.error('Get Suggestions Error:', error);
        res.status(500).json({ message: error.message });
    }
};
