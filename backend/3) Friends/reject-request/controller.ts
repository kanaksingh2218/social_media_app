import { Request, Response } from 'express';
import FriendRequest from '../FriendRequest.model';

export const rejectFriendRequest = async (req: any, res: Response) => {
    try {
        const fr = await FriendRequest.findById(req.params.requestId);
        if (!fr || fr.status !== 'pending') return res.status(404).json({ message: 'Request not found' });
        if (fr.receiver.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        fr.status = 'rejected';
        await fr.save();
        res.json({ message: 'Friend request rejected' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
