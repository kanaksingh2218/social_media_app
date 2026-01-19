import { Request, Response } from 'express';
import FriendRequest from '../FriendRequest.model';
import User from '../../1) Authentication/User.model';

export const acceptFriendRequest = async (req: any, res: Response) => {
    try {
        const fr = await FriendRequest.findById(req.params.requestId);
        if (!fr || fr.status !== 'pending') return res.status(404).json({ message: 'Request not found' });
        if (fr.receiver.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        fr.status = 'accepted';
        await fr.save();

        await User.findByIdAndUpdate(fr.sender, { $addToSet: { friends: fr.receiver } });
        await User.findByIdAndUpdate(fr.receiver, { $addToSet: { friends: fr.sender } });

        res.json({ message: 'Friend request accepted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
