import { Request, Response } from 'express';
import Notification from '../shared/models/Notification.model';

export const getNotifications = async (req: any, res: Response) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'username profilePicture fullName')
            .populate('post', 'content')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req: any, res: Response) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
        res.json({ message: 'Notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
