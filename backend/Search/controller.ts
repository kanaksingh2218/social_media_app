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
        }).limit(20).select('_id id username profilePicture fullName friends followers');

        // Optimization: Fetch all pending requests involving me and any of these users once
        const userIds = users.map(u => u._id);
        const FriendRequest = (await import('../Friends/FriendRequest.model')).default;

        const pendingRequests = await FriendRequest.find({
            $or: [
                { sender: currentUserId, receiver: { $in: userIds }, status: 'pending' },
                { sender: { $in: userIds }, receiver: currentUserId, status: 'pending' }
            ]
        }).lean();

        // Check relationship status for each user
        const usersWithStatus = users.map((user) => {
            const userObj = user.toObject();
            const userId = user._id.toString();

            const isFriend = user.friends.some((id: any) => id.toString() === currentUserId);
            const isFollowing = user.followers?.some((id: any) => id.toString() === currentUserId);

            // Check my requests map
            const requestFromMe = pendingRequests.find(r => r.sender.toString() === currentUserId && r.receiver.toString() === userId);
            const requestToMe = pendingRequests.find(r => r.sender.toString() === userId && r.receiver.toString() === currentUserId);

            return {
                ...userObj,
                relationship: {
                    isFriend,
                    isFollowing,
                    pendingRequestFromMe: !!requestFromMe,
                    pendingRequestToMe: !!requestToMe,
                    requestId: requestFromMe?._id || requestToMe?._id || null
                }
            };
        });

        res.json(usersWithStatus);
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};
