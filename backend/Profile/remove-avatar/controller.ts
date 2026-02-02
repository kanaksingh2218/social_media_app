import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const removeAvatar = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Reset profile picture to empty string
        user.profilePicture = '';
        await user.save();

        res.status(200).json({
            message: 'Profile photo removed',
            profilePicture: ''
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
