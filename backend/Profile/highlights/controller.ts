import { Request, Response } from 'express';
import Highlight from './Highlight.model';
import User from '../../Authentication/User.model';

export const createHighlight = async (req: any, res: Response) => {
    try {
        console.log('--- Create Highlight Process Start ---');
        console.log('Body:', req.body);

        const { title, posts, coverImage } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required and cannot be empty' });
        }

        const userId = req.user?.id || req.user?._id;
        console.log('Authenticated User ID:', userId);

        if (!userId) {
            console.error('No user ID found in request!');
            return res.status(401).json({ message: 'You must be logged in to create a highlight' });
        }

        if (!posts || !Array.isArray(posts) || posts.length === 0) {
            return res.status(400).json({ message: 'At least one post must be selected' });
        }

        console.log('Attempting to create highlight in DB...');
        const highlight = await Highlight.create({
            user: userId,
            title: title.trim(),
            posts,
            coverImage: coverImage || ''
        });

        console.log('Highlight created successfully:', highlight._id);
        res.status(201).json(highlight);
    } catch (error: any) {
        console.error('Critical Create Highlight Error:', error);
        res.status(500).json({
            message: 'Database error while saving highlight',
            error: error.message
        });
    } finally {
        console.log('--- Create Highlight Process End ---');
    }
};

export const getHighlights = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        console.log('Fetching highlights for user:', userId);

        if (!userId || userId === 'undefined') {
            return res.json([]);
        }

        const query = userId.match(/^[0-9a-fA-F]{24}$/)
            ? { _id: userId }
            : { username: { $regex: new RegExp(`^${userId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } };

        const user = await User.findOne(query);
        if (!user) return res.json([]); // Return empty if user not found for highlights

        const highlights = await Highlight.find({ user: user._id })
            .populate('posts', 'images content')
            .sort({ createdAt: -1 });

        console.log(`Found ${highlights.length} highlights for user ${user._id}`);
        res.json(highlights);
    } catch (error: any) {
        console.error('Get Highlights Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

export const updateHighlight = async (req: any, res: Response) => {
    try {
        const { highlightId } = req.params;
        const { title, posts, coverImage } = req.body;

        const highlight = await Highlight.findOne({ _id: highlightId, user: req.user.id });
        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found or unauthorized' });
        }

        if (title !== undefined) highlight.title = title;
        if (posts !== undefined) highlight.posts = posts;
        if (coverImage !== undefined) highlight.coverImage = coverImage;

        await highlight.save();
        res.json(highlight);
    } catch (error: any) {
        console.error('Update Highlight Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

export const deleteHighlight = async (req: any, res: Response) => {
    try {
        const { highlightId } = req.params;
        const highlight = await Highlight.findOneAndDelete({ _id: highlightId, user: req.user.id });

        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found or unauthorized' });
        }

        res.json({ message: 'Highlight deleted' });
    } catch (error: any) {
        console.error('Delete Highlight Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
