import { Request, Response } from 'express';
import Post from '../Post.model';
import User from '../../Authentication/User.model';

export const getFeed = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Get user's following list
        const user = await User.findById(userId).select('following');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Build query: posts from following + own posts
        const followingIds = user.following || [];
        const authorIds = [...followingIds, userId];

        // 1. Get Total Count for metadata
        const totalPosts = await Post.countDocuments({ author: { $in: authorIds } });

        // 2. Fetch Paginated Posts directly from DB
        const posts = await Post.find({ author: { $in: authorIds } })
            .populate('author', 'username profilePicture fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            posts,
            currentPage: page,
            totalPages,
            totalPosts,
            hasMore: page < totalPages
        });
    } catch (error: any) {
        console.error('Feed Error:', error);
        res.status(500).json({ message: error.message });
    }
};
