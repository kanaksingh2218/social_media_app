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
