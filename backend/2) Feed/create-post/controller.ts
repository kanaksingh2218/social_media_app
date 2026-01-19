import { Request, Response } from 'express';
import Post from '../Post.model';

export const createPost = async (req: any, res: Response) => {
    try {
        const { content } = req.body;
        const images = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];
        const post = await Post.create({
            author: req.user.id,
            content,
            images
        });
        await post.populate('author', 'username profilePicture fullName');
        res.status(201).json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
