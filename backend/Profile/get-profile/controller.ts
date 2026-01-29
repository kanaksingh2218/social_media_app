import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('followers', 'username profilePicture fullName')
            .populate('following', 'username profilePicture fullName')
            .populate('friends', 'username profilePicture fullName');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
