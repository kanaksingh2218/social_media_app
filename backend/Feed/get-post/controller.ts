import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../Post.model';

export const getPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        // Safety check for ID validity
        if (!mongoose.Types.ObjectId.isValid(postId as any)) {
            return res.status(400).json({ message: 'Invalid Post ID format' });
        }

        const post = await Post.findById(postId).populate('author', 'username profilePicture');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error: any) {
        console.error('Get Post Error:', error);
        res.status(500).json({ message: error.message });
    }
};
