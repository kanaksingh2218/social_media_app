import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const getFriends = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.userId || (req as any).user.id)
            .populate('friends', 'username profilePicture fullName');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.friends);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
