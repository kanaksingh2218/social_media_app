import { Response, NextFunction } from 'express';
import Relationship from '../../models/Relationship.model';
import { catchAsync } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Get all pending requests sent TO the current user
 * @route   GET /api/friends/requests
 * @access  Private
 */
export const getPendingRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    console.log(`📥 [FRIENDS-GET] Fetching pending requests for: ${userId}`);

    const requests = await Relationship.find({
        receiver: userId,
        status: 'pending'
    })
        .populate('sender', 'username profilePicture fullName')
        .sort({ createdAt: -1 })
        .lean();

    // Map sender to 'from' for frontend compatibility if needed
    const formattedRequests = requests.map(req => ({
        ...req,
        from: req.sender // Standardize for frontend if it expects 'from'
    }));

    console.log(`📋 [FRIENDS-GET] Found ${requests.length} incoming requests`);
    res.json(formattedRequests);
});

/**
 * @desc    Get all pending requests sent BY the current user
 * @route   GET /api/friends/requests/sent
 * @access  Private
 */
export const getSentRequests = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    console.log(`📤 [FRIENDS-GET] Fetching sent requests for: ${userId}`);

    const requests = await Relationship.find({
        sender: userId,
        status: 'pending'
    })
        .populate('receiver', 'username profilePicture fullName')
        .sort({ createdAt: -1 })
        .lean();

    console.log(`📋 [FRIENDS-GET] Found ${requests.length} sent requests`);
    res.json(requests);
});

