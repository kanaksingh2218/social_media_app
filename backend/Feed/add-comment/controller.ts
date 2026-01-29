import { Request, Response } from 'express';
import Comment from '../Comment.model';
import Post from '../Post.model';

import Notification from '../../shared/models/Notification.model';

export const addComment = async (req: any, res: Response) => {
    try {
        const { content } = req.body;
        const comment = await Comment.create({
            post: req.params.postId,
            author: req.user.id,
            content
        });
        const post = await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: comment._id } });

        // Create notification
        if (post && post.author.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.author,
                sender: req.user.id,
                type: 'comment',
                post: post._id
            });
        }

        await comment.populate('author', 'username profilePicture fullName');
        res.status(201).json(comment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async (req: any, res: Response) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Verify ownership
        if (comment.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this comment' });
        }

        // Remove from post's comments array
        await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
