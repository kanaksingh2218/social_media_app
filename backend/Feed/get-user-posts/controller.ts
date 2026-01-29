import { Request, Response } from 'express';
import Post from '../Post.model';

export const getUserPosts = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author: userId })
            .populate('author', 'username profilePicture fullName')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
