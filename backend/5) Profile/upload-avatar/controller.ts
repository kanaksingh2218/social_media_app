import { Request, Response } from 'express';
import User from '../../1) Authentication/User.model';

export const uploadAvatar = async (req: any, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: req.file.path },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
