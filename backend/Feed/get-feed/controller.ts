import { Request, Response } from 'express';
import Post from '../Post.model';
import User from '../../Authentication/User.model';

/**
 * Calculate engagement score for post ranking
 * Formula: (likes * 3) + (comments * 5) + recencyBoost
 */
function calculateEngagementScore(post: any): number {
    const likesScore = (post.likes?.length || 0) * 3;
    const commentsScore = (post.commentCount || 0) * 5;

    // Recency boost: posts < 24hrs get 10 points, older get 5
    const hoursSincePost = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    const recencyBoost = hoursSincePost < 24 ? 10 : 5;

    return likesScore + commentsScore + recencyBoost;
}

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

        // Fetch posts from followed users
        const posts = await Post.find({ author: { $in: authorIds } })
            .populate('author', 'username profilePicture fullName')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate engagement scores and sort
        const scoredPosts = posts.map(post => ({
            ...post,
            engagementScore: calculateEngagementScore(post)
        }));

        // Sort by engagement score (highest first)
        scoredPosts.sort((a, b) => b.engagementScore - a.engagementScore);

        // Paginate
        const paginatedPosts = scoredPosts.slice(skip, skip + limit);
        const totalPages = Math.ceil(scoredPosts.length / limit);

        res.json({
            posts: paginatedPosts,
            currentPage: page,
            totalPages,
            totalPosts: scoredPosts.length,
            hasMore: page < totalPages
        });
    } catch (error: any) {
        console.error('Feed Error:', error);
        res.status(500).json({ message: error.message });
    }
};
