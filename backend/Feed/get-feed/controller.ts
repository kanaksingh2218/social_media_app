import { Request, Response } from 'express';
import Post from '../Post.model';

export const getFeed = async (req: any, res: Response) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username profilePicture fullName')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
