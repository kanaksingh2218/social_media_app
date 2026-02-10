import { Request, Response } from 'express';
import Post from '../Post.model';

export const searchPosts = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const posts = await Post.find({
            content: { $regex: query as string, $options: 'i' }
        })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
