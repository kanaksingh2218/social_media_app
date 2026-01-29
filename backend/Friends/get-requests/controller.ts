import { Request, Response } from 'express';
import FriendRequest from '../FriendRequest.model';

export const getPendingRequests = async (req: any, res: Response) => {
    try {
        const requests = await FriendRequest.find({
            receiver: req.user.id,
            status: 'pending'
        }).populate('sender', 'username profilePicture fullName');
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
