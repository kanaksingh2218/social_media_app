import { Request, Response } from 'express';
import Comment from '../Comment.model';

export const getComments = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Only fetch top-level comments (where parentComment is null)
        const comments = await Comment.find({
            post: req.params.postId,
            parentComment: null
        })
            .populate('user', 'username profilePicture fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({
            post: req.params.postId,
            parentComment: null
        });

        res.json({
            comments,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalComments: total
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getReplies = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;

        const replies = await Comment.find({ parentComment: commentId })
            .populate('user', 'username profilePicture fullName')
            .sort({ createdAt: 1 }); // Oldest first for replies usually

        res.json(replies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
