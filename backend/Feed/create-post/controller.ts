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

