import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const getFollowing = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('following', 'username fullName profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.following);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
