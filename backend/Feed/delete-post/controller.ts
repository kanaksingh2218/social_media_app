import { Request, Response } from 'express';
import Post from '../Post.model';

export const deletePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        console.log('Backend attempting to delete post:', postId);
        const post = await Post.findById(postId);

        if (!post) {
            console.warn('Post not found in DB:', postId);
            return res.status(404).json({ message: 'Post not found' });
        }
        console.log('Post found, author:', post.author.toString(), 'Request user:', req.user.id);

        // Check if user is the author
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
