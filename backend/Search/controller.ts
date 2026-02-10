import { Request, Response } from 'express';
import User from '../Authentication/User.model';
import Relationship from '../models/Relationship.model';

export const search = async (req: any, res: Response) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.id;

        if (!query) return res.json({ users: [], posts: [] });

        const isHashtag = query.startsWith('#');

        if (isHashtag) {
            // Search Posts by hash tag
            const Post = (await import('../Feed/Post.model')).default;
            const posts = await Post.find({
                content: { $regex: query as string, $options: 'i' }
            })
                .populate('author', 'username profilePicture')
                .sort({ createdAt: -1 })
                .limit(20);

            return res.json({ type: 'posts', data: posts });
        }

        // Search Users
        const users = await User.find({
            $or: [
                { username: { $regex: query as string, $options: 'i' } },
                { fullName: { $regex: query as string, $options: 'i' } }
            ]
        }).limit(20).select('_id id username profilePicture fullName friends followers');

        // Optimization: Fetch all pending requests involving me and any of these users once
        const userIds = users.map(u => u._id);

        const pendingRequests = await Relationship.find({
            $or: [
                { sender: currentUserId, receiver: { $in: userIds }, status: 'pending', requestType: 'friend' },
                { sender: { $in: userIds }, receiver: currentUserId, status: 'pending', requestType: 'friend' }
            ]
        }).lean();

        // Check relationship status for each user
        const usersWithStatus = users.map((user) => {
            const userObj = user.toObject();
            const userId = user._id.toString();

            const isFriend = (user.friends || []).some((id: any) => id.toString() === currentUserId);
            const isFollowing = (user.followers || [])?.some((id: any) => id.toString() === currentUserId);

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

        res.json({ type: 'users', data: usersWithStatus });

    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const addToHistory = async (req: any, res: Response) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { recentSearches: query }
        });

        // Optional: limit history size ideally, but fine for now
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getHistory = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('recentSearches');
        // Return reversed to show most recent first (if appended to end)
        res.json(user?.recentSearches?.reverse() || []);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const clearHistory = async (req: any, res: Response) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $set: { recentSearches: [] }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
