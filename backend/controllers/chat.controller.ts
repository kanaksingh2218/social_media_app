import { Response, NextFunction } from 'express';
import Conversation from '../Chat/Conversation.model';
import Message from '../Chat/Message.model';
import { catchAsync, AppError } from '../shared/middlewares/error.middleware';

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/chat/conversations
 */
export const getConversations = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    const conversations = await Conversation.find({
        participants: userId
    })
        .populate('participants', 'username profilePicture')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
});

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/chat/:conversationId/messages
 */
export const getMessages = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 }) // Oldest to newest
        .limit(100); // Pagination in v2

    res.status(200).json(messages);
});

/**
 * @desc    Start a conversation or get existing one
 * @route   POST /api/chat
 */
export const startConversation = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
        return next(new AppError(400, 'Participant ID required'));
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
        participants: { $all: [userId, participantId] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, participantId],
            unreadCounts: {}
        });
    }

    await conversation.populate('participants', 'username profilePicture');
    res.status(200).json(conversation);
});

/**
 * @desc    Send a message
 * @route   POST /api/chat/message
 */
export const sendMessage = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { conversationId, text } = req.body;
    const userId = req.user.id;
    const image = req.file ? `uploads/${req.file.filename}` : undefined;

    if (!conversationId || (!text && !image)) {
        return next(new AppError(400, 'Invalid message data'));
    }

    const message = await Message.create({
        conversationId,
        sender: userId,
        text,
        image,
        seenBy: [userId]
    });

    // Update conversation last message & unread counts
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
        conversation.lastMessage = message._id as any;

        // Increment unread for others
        conversation.participants.forEach((pId: any) => {
            if (pId.toString() !== userId) {
                const current = conversation.unreadCounts.get(pId.toString()) || 0;
                conversation.unreadCounts.set(pId.toString(), current + 1);
            }
        });

        await conversation.save();

        // Socket Emission
        try {
            const { getIO } = require('../socket');
            const io = getIO();
            const recipients = conversation.participants.filter((p: any) => p.toString() !== userId);

            recipients.forEach((recipientId: any) => {
                io.to(recipientId.toString()).emit('new_message', {
                    message,
                    conversationId
                });
            });
        } catch (err) {
            console.error('Socket emit failed', err);
        }
    }

    res.status(201).json(message);
});

/**
 * @desc    Mark conversation as read
 * @route   PUT /api/chat/:conversationId/read
 */
export const markAsRead = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return next(new AppError(404, 'Not found'));

    // Reset unread count for me
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();

    res.status(200).json({ success: true });
});
