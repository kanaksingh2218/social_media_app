import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../../Authentication/User.model';
import FriendRequest from '../FriendRequest.model';
import { catchAsync, AppError } from '../../shared/middlewares/error.middleware';

/**
 * @desc    Get friend suggestions based on mutual friends
 * @route   GET /api/friends/suggestions
 * @access  Private
 */
export const getSuggestions = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Get current user's friends and and following to use for exclusion
    const currentUser = await User.findById(userId).select('friends following').lean();
    if (!currentUser) {
        return next(new AppError(404, 'User not found'));
    }

    const friendIds = (currentUser.friends || []).map(id => new mongoose.Types.ObjectId(id));
    const followingIds = (currentUser.following || []).map(id => new mongoose.Types.ObjectId(id));

    // 2. Get pending requests to exclude those users
    const pendingRequests = await FriendRequest.find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: 'pending'
    }).select('sender receiver').lean();

    const pendingIds = pendingRequests.map(fr =>
        fr.sender.toString() === userId.toString() ? fr.receiver : fr.sender
    );

    // 3. Exclude list: Self + Current Friends + Following + Pending Requests
    const excludedIds = [userId, ...friendIds, ...followingIds, ...pendingIds];

    // 4. Aggregation Pipeline for Mutual Friends
    const suggestions = await User.aggregate([
        // Match users not in the excluded list
        { $match: { _id: { $nin: excludedIds } } },

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
                            { $map: { input: "$friends", as: "f", in: { $toObjectId: "$$f" } } },
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

    console.log(`[FRIENDS] Generated ${suggestions.length} suggestions for user ${userId}`);
    res.json(suggestions);
});
