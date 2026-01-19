import { Request, Response } from 'express';
import User from '../../1) Authentication/User.model';

export const unfollowUser = async (req: any, res: Response) => {
    try {
        const targetUserId = req.params.userId;
        await User.findByIdAndUpdate(targetUserId, { $pull: { followers: req.user.id } });
        await User.findByIdAndUpdate(req.user.id, { $pull: { following: targetUserId } });
        res.json({ message: 'User unfollowed successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
