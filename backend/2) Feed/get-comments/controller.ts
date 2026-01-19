import { Request, Response } from 'express';
import Comment from '../Comment.model';

export const getComments = async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'username profilePicture fullName')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
