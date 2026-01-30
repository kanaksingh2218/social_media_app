import { Request, Response } from 'express';
import User from '../Authentication/User.model';
import FriendRequest from '../Friends/FriendRequest.model';

export const searchUsers = async (req: any, res: Response) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.id;

        if (!query) return res.json([]);

        const users = await User.find({
            $or: [
                { username: { $regex: query as string, $options: 'i' } },
                { fullName: { $regex: query as string, $options: 'i' } }
            ]
        }).limit(10).select('_id id username profilePicture fullName friends');

        // Check relationship status for each user
        const usersWithStatus = await Promise.all(users.map(async (user) => {
            const userObj = user.toObject();
            const isFriend = user.friends.includes(currentUserId);

            const pendingRequest = await FriendRequest.findOne({
                $or: [
                    { sender: currentUserId, receiver: user._id },
                    { sender: user._id, receiver: currentUserId }
                ],
                status: 'pending'
            });

            return {
                ...userObj,
                isFollowing: isFriend, // If in friends list, they are essentially linked
                hasPendingRequest: !!pendingRequest
            };
        }));

        res.json(usersWithStatus);
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};
