import { Request, Response } from 'express';
import Post from '../Post.model';

export const updatePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check author
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to update this post' });
        }

        // Update fields
        if (content) post.content = content;

        // Handle images if any (simpler version for now, maybe append or replace?)
        // For now let's just update content to be safe and simple

        await post.save();
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
