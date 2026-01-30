import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const unfollowUser = async (req: any, res: Response) => {
    try {
        const targetUserId = req.params.userId;

        const targetUserCheck = await User.findById(targetUserId);
        if (!targetUserCheck) return res.status(404).json({ message: 'User not found' });
        const targetUser = await User.findByIdAndUpdate(targetUserId, { $pull: { followers: req.user.id } }, { new: true }).select('followers');
        const currentUser = await User.findByIdAndUpdate(req.user.id, { $pull: { following: targetUserId } }, { new: true }).select('following');

        res.json({
            message: 'User unfollowed successfully',
            followers: targetUser?.followers,
            following: currentUser?.following
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
