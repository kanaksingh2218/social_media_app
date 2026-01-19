import { Request, Response } from 'express';
import User from '../../1) Authentication/User.model';

export const updateProfile = async (req: any, res: Response) => {
    try {
        const { fullName, bio, isPrivate } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, bio, isPrivate },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
