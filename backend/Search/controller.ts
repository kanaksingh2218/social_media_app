import { Request, Response } from 'express';
import User from '../Authentication/User.model';

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        console.log('Search query received:', query);
        if (!query) return res.json([]);

        const users = await User.find({
            $or: [
                { username: { $regex: query as string, $options: 'i' } },
                { fullName: { $regex: query as string, $options: 'i' } }
            ]
        }).limit(10).select('username profilePicture fullName _id');

        console.log(`Found ${users.length} users for query: ${query}`);
        res.json(users);
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};
