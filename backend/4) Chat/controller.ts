import { Request, Response } from 'express';
import Message from './Message.model';
import User from '../1) Authentication/User.model';

export const getMessages = async (req: any, res: Response) => {
    try {
        const { contactId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: contactId },
                { sender: contactId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req: any, res: Response) => {
    try {
        const { receiverId, content } = req.body;
        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content
        });
        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getContacts = async (req: any, res: Response) => {
    try {
        // Simple implementation: return all users excluding current user for a small demo
        // In real app, this should be friends or people you've chatted with
        const users = await User.find({ _id: { $ne: req.user.id } }).select('username fullName profilePicture');
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
