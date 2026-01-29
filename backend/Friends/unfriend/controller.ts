import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const unfriend = async (req: any, res: Response) => {
    try {
        const friendId = req.params.friendId;
        await User.findByIdAndUpdate(req.user.id, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user.id } });
        res.json({ message: 'Unfriended successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
