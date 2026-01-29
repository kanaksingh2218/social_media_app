import { Request, Response } from 'express';
import Post from '../Post.model';

export const createPost = async (req: any, res: Response) => {
    try {
        const { content } = req.body;
        const images = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];

        const post = new Post({
            author: req.user.id,
            content,
            images,
        });

        await post.save();
        const populatedPost = await Post.findById(post._id).populate('author', 'username profilePicture');
        res.status(201).json(populatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check author
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
