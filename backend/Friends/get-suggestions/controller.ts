import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const getSuggestions = async (req: any, res: Response) => {
    try {
        // Basic suggestion: users who are not friends and not the user themselves
        const user = await User.findById(req.user.id);
        const suggestions = await User.find({
            _id: { $nin: [...user!.friends, req.user.id] }
        }).limit(10).select('username profilePicture fullName');
        res.json(suggestions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
