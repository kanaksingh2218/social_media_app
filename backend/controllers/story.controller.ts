import { Response, NextFunction } from 'express';
import Story from '../models/Story.model';
import User from '../Authentication/User.model';
import Relationship from '../models/Relationship.model';
import { catchAsync, AppError } from '../shared/middlewares/error.middleware';

/**
 * @desc    Create a new story
 * @route   POST /api/stories
 */
export const createStory = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next(new AppError(400, 'Please upload an image'));
    }

    const imagePath = `uploads/${req.file.filename}`;

    const story = await Story.create({
        user: req.user.id,
        image: imagePath
    });

    await story.populate('user', 'username profilePicture');

    res.status(201).json(story);
});

/**
 * @desc    Get stories feed (Self + Following)
 * @route   GET /api/stories/feed
 */
export const getStoriesFeed = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const currentUserId = req.user.id;

    // 1. Get users I follow
    const relationships = await Relationship.find({
        sender: currentUserId,
        status: 'accepted',
        requestType: 'follow'
    }).select('receiver');

    const followingIds = relationships.map(r => r.receiver);

    // Include self in the list
    const userIds = [...followingIds, currentUserId];

    // 2. Find active stories for these users
    // Note: TTL automatically removes old ones, but we can also filter for safety
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
        user: { $in: userIds },
        createdAt: { $gt: twentyFourHoursAgo }
    })
        .populate('user', 'username profilePicture')
        .sort({ createdAt: 1 }); // Oldest first within usage, typically want grouped by user

    // 3. Group stories by user
    const groupedStories = stories.reduce((acc: any, story: any) => {
        const userId = story.user._id.toString();

        if (!acc[userId]) {
            acc[userId] = {
                user: story.user,
                stories: [],
                hasUnseen: false
            };
        }

        acc[userId].stories.push(story);

        // simple unseen check: if viewer not in viewers array
        if (!story.viewers.includes(currentUserId)) {
            acc[userId].hasUnseen = true;
        }

        return acc;
    }, {});

    // Convert object to array and sort:
    // 1. Self first
    // 2. Users with unseen stories
    // 3. Others
    const feed = Object.values(groupedStories).sort((a: any, b: any) => {
        if (a.user._id.toString() === currentUserId) return -1;
        if (b.user._id.toString() === currentUserId) return 1;
        if (a.hasUnseen && !b.hasUnseen) return -1;
        if (!a.hasUnseen && b.hasUnseen) return 1;
        return 0;
    });

    res.status(200).json(feed);
});

/**
 * @desc    Mark story as viewed
 * @route   POST /api/stories/:id/view
 */
export const viewStory = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const storyId = req.params.id;
    const userId = req.user.id;

    const story = await Story.findByIdAndUpdate(
        storyId,
        { $addToSet: { viewers: userId } },
        { new: true }
    );

    if (!story) {
        return next(new AppError(404, 'Story not found'));
    }

    res.status(200).json({ success: true });
});
