import { Request, Response } from 'express';
import Post from '../Post.model';
import User from '../../Authentication/User.model';

export const getUserPosts = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const query = userId.match(/^[0-9a-fA-F]{24}$/)
            ? { _id: userId }
            : { username: { $regex: new RegExp(`^${userId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } };

        const user = await User.findOne(query);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const posts = await Post.find({ author: user._id })
            .populate('author', 'username profilePicture fullName')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
