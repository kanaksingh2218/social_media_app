import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../../Authentication/User.model';
import Relationship from '../../models/Relationship.model';


import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Get friend suggestions based on mutual friends
 * @route   GET /api/friends/suggestions
 * @access  Private
 */
export const getSuggestions = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    console.log('🔍 [SUGGESTIONS] Generating suggestions for:', userId);

    // 1. Get current user's friends and and following to use for exclusion
    const currentUser = await User.findById(userId).select('friends following').lean();
    if (!currentUser) {
        return next(new AppError(404, 'User not found'));
    }

    // Ensure we have ObjectIds for exclusion
    const friendIds = (currentUser.friends || []).map(id => new mongoose.Types.ObjectId(id.toString()));
    const followingIds = (currentUser.following || []).map(id => new mongoose.Types.ObjectId(id.toString()));

    // 2. Get pending requests from Relationship model (New system)
    const pendingRelations = await Relationship.find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: 'pending'
    }).select('sender receiver').lean();

    const pendingIds = pendingRelations.map((rel: any) =>
        rel.sender.toString() === userId.toString() ? rel.receiver : rel.sender
    );

    // 3. Exclude list: Self + Current Friends + Following + Pending Requests
    // Using a Set or just unique map to be sure, and ensuring all are ObjectIds
    const excludedIdsSet = new Set([
        userId.toString(),
        ...friendIds.map((id: any) => id.toString()),
        ...followingIds.map((id: any) => id.toString()),
        ...pendingIds.map((id: any) => id.toString())
    ]);


    const excludedIds = Array.from(excludedIdsSet).map(id => new mongoose.Types.ObjectId(id));

    console.log(`🚫 [SUGGESTIONS] Excluding ${excludedIds.length} users:`, Array.from(excludedIdsSet));

    // 4. Aggregation Pipeline for Mutual Friends
    const suggestions = await User.aggregate([
        // Match users not in the excluded list
        {
            $match: {
                _id: { $nin: excludedIds },
                // Double check: ensure self is excluded even if userId was somehow missing from set
                username: { $ne: currentUser.username }
            }
        },

        // Project mutual friends count
        {
            $project: {
                username: 1,
                fullName: 1,
                profilePicture: 1,
                friends: 1,
                mutualFriendsCount: {
                    $size: {
                        $setIntersection: [
                            { $ifNull: ["$friends", []] },
                            friendIds
                        ]
                    }
                }
            }
        },

        // Sort by mutual friends count descending, then by creation date (new users first)
        { $sort: { mutualFriendsCount: -1, _id: -1 } },

        // Limit to top 10
        { $limit: 10 },

        // Final cleanup of response object
        {
            $project: {
                _id: 1,
                id: "$_id",
                username: 1,
                fullName: 1,
                profilePicture: 1,
                mutualFriendsCount: 1,
                relationship: {
                    isFriend: { $literal: false },
                    isFollowing: { $literal: false },
                    pendingRequestFromMe: { $literal: false },
                    pendingRequestToMe: { $literal: false },
                    requestId: { $literal: null }
                }
            }
        }
    ]);

    console.log(`✅ [SUGGESTIONS] Successfully generated ${suggestions.length} suggestions`);
    res.json(suggestions);
});

