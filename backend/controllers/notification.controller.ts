import Notification from '../models/Notification.model';
import Relationship from '../models/Relationship.model';
import { catchAsync } from '../shared/middlewares/error.middleware';

// GET /api/notifications/unread-count - Get count of unread notifications + follow requests
export const getUnreadCount = catchAsync(async (req: any, res: any) => {
    const userId = req.user.id;

    console.log('📊 Fetching unread count for user:', userId);

    // Count unread notifications
    const notificationCount = await Notification.countDocuments({
        to: userId,
        read: false
    });

    // Count pending follow requests
    const requestCount = await Relationship.countDocuments({
        receiver: userId,
        status: 'pending',
        requestType: 'follow'
    });

    const totalCount = notificationCount + requestCount;

    console.log('✅ Counts - Notifications:', notificationCount, 'Requests:', requestCount);

    res.json({
        success: true,
        count: totalCount,
        notifications: notificationCount,
        requests: requestCount
    });
});

// GET /api/notifications - Get all notifications
export const getNotifications = catchAsync(async (req: any, res: any) => {
    const userId = req.user.id;

    const notifications = await Notification.find({ to: userId })
        .populate('from', 'username profilePicture')
        .populate('post', 'image')
        .sort({ createdAt: -1 })
        .limit(50);

    res.json(notifications);
});

// PUT /api/notifications/:id/read - Mark notification as read
export const markAsRead = catchAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
        { _id: id, to: userId },
        { read: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
});

// PUT /api/notifications/read-all - Mark all as read
export const markAllAsRead = catchAsync(async (req: any, res: any) => {
    const userId = req.user.id;

    await Notification.updateMany(
        { to: userId, read: false },
        { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
});

// Helper function to create notification (export for use in other controllers)
export const createNotification = async (data: {
    to: string;
    from: string;
    type: string;
    message: string;
    post?: string;
}) => {
    try {
        // Don't notify yourself
        if (data.to === data.from) return;

        const notification = await Notification.create(data);
        console.log('✅ Notification created:', data.type);

        // Emit real-time event
        try {
            const { getIO } = require('../socket');
            const io = getIO();
            io.to(data.to).emit('new_notification', notification);
            console.log(`📡 Emitted new_notification to user ${data.to}`);
        } catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }

    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};
