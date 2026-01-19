import { Request, Response } from 'express';
import Post from '../Post.model';

import Notification from '../../shared/models/Notification.model';

export const likePost = async (req: any, res: Response) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isLiked = post.likes.includes(req.user.id);
        if (isLiked) {
            await Post.findByIdAndUpdate(req.params.postId, { $pull: { likes: req.user.id } });
            res.json({ message: 'Post unliked' });
        } else {
            await Post.findByIdAndUpdate(req.params.postId, { $addToSet: { likes: req.user.id } });

            // Create notification
            if (post.author.toString() !== req.user.id) {
                await Notification.create({
                    recipient: post.author,
                    sender: req.user.id,
                    type: 'like',
                    post: post._id
                });
            }

            res.json({ message: 'Post liked' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
