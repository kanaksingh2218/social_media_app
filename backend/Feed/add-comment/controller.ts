import { Request, Response } from 'express';
import Comment from '../Comment.model';
import Post from '../Post.model';

import Notification from '../../shared/models/Notification.model';

export const addComment = async (req: any, res: Response) => {
    try {
        const { content, parentCommentId } = req.body;

        const commentData: any = {
            post: req.params.postId,
            user: req.user.id,
            text: content
        };

        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId);
            if (!parent) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            commentData.parentComment = parentCommentId;

            // Increment reply count on parent
            await Comment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: 1 } });
        }

        const comment = await Comment.create(commentData);

        // Update post comment count (only for top-level comments or all? usually all)
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $inc: { commentCount: 1 } },
            { new: true }
        );

        // Create notification
        if (post && post.author.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.author,
                sender: req.user.id,
                type: 'comment',
                post: post._id,
                message: parentCommentId ? 'replied to a comment on your post' : 'commented on your post'
            });
        }

        await comment.populate('user', 'username profilePicture fullName');
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
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this comment' });
        }

        // Decrement commentCount on post
        await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
