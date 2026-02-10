import { Request, Response } from 'express';
import Post from '../Post.model';

export const getTrendingPosts = async (req: Request, res: Response) => {
    try {
        // Simple trending logic: most liked posts in last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const posts = await Post.find({
            createdAt: { $gte: lastWeek }
        })
            .sort({ likesCount: -1 }) // Assuming likesCount or likes.length
            .limit(10)
            .populate('author', 'username profilePicture');

        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
