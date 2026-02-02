import { Response } from 'express';
import Post from './Post.model';
import User from '../Authentication/User.model';
import mongoose from 'mongoose';
import Notification from '../shared/models/Notification.model';

/**
 * @desc    Create a new post
 * @route   POST /api/feed/create-post
 * @access  Private
 */
export const createPost = async (req: any, res: Response) => {
    try {
        const { content } = req.body;

        // Handle images from multer if available, otherwise from body
        let images: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            images = (req.files as Express.Multer.File[]).map(file => file.path);
        } else if (req.body.images && Array.isArray(req.body.images)) {
            images = req.body.images;
        }

        if (!images || images.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        const post = new Post({
            author: req.user.id,
            content,
            images,
        });

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username fullName profilePicture');

        res.status(201).json(populatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};



import Comment from './Comment.model';

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/comment/:postId
 * @access  Private
 */
export const addComment = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await Comment.create({
            post: postId,
            user: req.user.id,
            text
        });

        // Atomically increment comment count
        await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

        // Create notification for post author
        if (post.author.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.author,
                sender: req.user.id,
                type: 'comment',
                post: postId
            });
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'username fullName profilePicture');

        res.status(201).json(populatedComment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get comments for a post
 * @route   GET /api/posts/comments/:postId
 * @access  Private
 */
export const getComments = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ post: postId })
            .populate('user', 'username fullName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ post: postId });

        res.status(200).json({
            comments,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalComments: total
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/posts/comment/:commentId
 * @access  Private (Comment author or Post owner)
 */
export const deleteComment = async (req: any, res: Response) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const post = await Post.findById(comment.post);
        if (!post) {
            return res.status(404).json({ message: 'Post not found for this comment' });
        }

        // Authorization: Comment author OR Post owner
        const isCommentAuthor = comment.user.toString() === req.user.id;
        const isPostOwner = post.author.toString() === req.user.id;

        if (!isCommentAuthor && !isPostOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);

        // Atomically decrement comment count
        await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get ranked home feed
 * @route   GET /api/feed/get-feed
 * @access  Private
 */
export const getFeed = async (req: any, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // 1. Get user's following list
        const user = await User.findById(req.user.id).select('following');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const followingIds = user.following || [];
        const authorIds = [...followingIds, new mongoose.Types.ObjectId(req.user.id)];

        // 2. Aggregation pipeline for ranking
        const now = new Date();
        const posts = await Post.aggregate([
            {
                $match: {
                    author: { $in: authorIds }
                }
            },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    // Using the atomic counter field for efficiency
                    commentsCount: { $ifNull: ["$commentCount", 0] },
                    hoursSincePost: {
                        $divide: [
                            { $subtract: [now, "$createdAt"] },
                            3600000 // Convert ms to hours
                        ]
                    }
                }
            },
            {
                $addFields: {
                    // Score = (Likes*1 + Comments*2 + 1) / (HoursSincePost + 2)^1.5
                    baseScore: {
                        $add: [
                            { $multiply: ["$likesCount", 1] },
                            { $multiply: ["$commentsCount", 2] },
                            1
                        ]
                    },
                    timeDecay: {
                        $pow: [
                            { $add: ["$hoursSincePost", 2] },
                            1.5
                        ]
                    }
                }
            },
            {
                $addFields: {
                    rankingScore: { $divide: ["$baseScore", "$timeDecay"] }
                }
            },
            { $sort: { rankingScore: -1 } },
            { $skip: skip },
            { $limit: limit },
            // 3. Populate author details
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            // Project selected fields to match production output
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0,
                    'author.resetPasswordToken': 0,
                    'author.resetPasswordExpire': 0,
                    rankingScore: 0,
                    baseScore: 0,
                    timeDecay: 0,
                    hoursSincePost: 0
                }
            }
        ]);

        const total = await Post.countDocuments({ author: { $in: authorIds } });

        res.status(200).json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error: any) {
        console.error('Feed Algorithm Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get a single post by ID
 * @route   GET /api/feed/get-post/:postId
 * @access  Private
 */
export const getPost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId)
            .populate('author', 'username fullName profilePicture')
            .populate('likes', 'username fullName profilePicture')
            .populate('comments.user', 'username fullName profilePicture');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update a post
 * @route   PUT /api/feed/update-post/:postId
 * @access  Private (Owner only)
 */
export const updatePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        const { content, images } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Authorization check
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        // Partial updates
        if (content !== undefined) post.content = content;
        // Partial updates
        if (content !== undefined) post.content = content;

        // Handle images:
        // 1. New files from Multer (req.files)
        // 2. Existing images kept by user (req.body.images - might be string or array of strings)
        let finalImages: string[] = [];

        // Check for existing images sent in body
        if (req.body.images) {
            if (Array.isArray(req.body.images)) {
                finalImages = [...req.body.images];
            } else {
                finalImages = [req.body.images];
            }
        } else {
            // If images key is missing in body but we have files, we might be replacing all?
            // Or if explicit 'images' is not sent, do we keep old? 
            // Usually update replaces the field if sent. 
            // Let's assume if client sends FormData, it sends 'images' for kept URLs too.
            // If strictly undefined in body and no files, we assume no change? 
            // But FormData fields are usually '' if empty.
        }

        // Add new files
        if (req.files && Array.isArray(req.files)) {
            const newFiles = (req.files as Express.Multer.File[]).map(file => file.path);
            finalImages = [...finalImages, ...newFiles];
        }

        // Only update if we have an image intent (files or body images present)
        // If finalImages is empty but user intended to remove all... 
        // Validation: "Post must have at least one image"
        if (req.files || req.body.images !== undefined) {
            if (finalImages.length > 0) {
                post.images = finalImages;
            } else {
                // return res.status(400).json({ message: 'Post must have at least one image' });
                // If removing all images is not allowed. 
                // Let's check original logic:
                // if (Array.isArray(images) && images.length > 0) post.images = images;
            }
        }

        // Simplified Logic combining above:
        if (images !== undefined || (req.files && req.files.length > 0)) {
            let updatedImages = [];

            // Existing ones passed as strings
            if (images) {
                updatedImages = Array.isArray(images) ? images : [images];
            }

            // New ones
            if (req.files && Array.isArray(req.files)) {
                updatedImages = [...updatedImages, ...req.files.map((f: any) => f.path)];
            }

            if (updatedImages.length > 0) {
                post.images = updatedImages;
            } else {
                return res.status(400).json({ message: 'Post must have at least one image' });
            }
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username fullName profilePicture')
            .populate('likes', 'username fullName profilePicture')
            .populate('comments.user', 'username fullName profilePicture');

        res.status(200).json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};



/**
 * @desc    Like a post
 * @route   POST /api/posts/like/:postId
 * @access  Private
 */
export const likePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;

        // Use $addToSet for atomic, idempotent like addition
        const post = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: req.user.id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Create notification if the liker is not the author
        if (post.author.toString() !== req.user.id) {
            // Check if notification already exists to avoid spamming
            const existingNotification = await Notification.findOne({
                recipient: post.author,
                sender: req.user.id,
                type: 'like',
                post: postId
            });

            if (!existingNotification) {
                await Notification.create({
                    recipient: post.author,
                    sender: req.user.id,
                    type: 'like',
                    post: postId
                });
            }
        }

        res.status(200).json({
            message: 'Post liked',
            likesCount: post.likes.length,
            likes: post.likes
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Unlike a post
 * @route   DELETE /api/posts/like/:postId
 * @access  Private
 */
export const unlikePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;

        // Use $pull for atomic removal
        const post = await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: req.user.id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({
            message: 'Post unliked',
            likesCount: post.likes.length,
            likes: post.likes
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Search posts by content and author
 * @route   GET /api/feed/search
 * @access  Private
 */
export const searchPosts = async (req: any, res: Response) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const queryStr = q as string;

        // Aggregation pipeline for search
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $match: {
                    $or: [
                        { content: { $regex: queryStr, $options: 'i' } },
                        { 'author.username': { $regex: queryStr, $options: 'i' } },
                        { 'author.fullName': { $regex: queryStr, $options: 'i' } }
                    ]
                }
            },
            {
                $addFields: {
                    // If text index search is not used, we can't get meta score easily in $match regex
                    // But we can prioritize matches by content over author if needed
                    relevance: {
                        $cond: [
                            { $regexMatch: { input: "$content", regex: queryStr, options: "i" } },
                            2, // higher priority for content match
                            1  // lower priority for author match
                        ]
                    }
                }
            },
            { $sort: { relevance: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit as string) },
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0,
                    'author.resetPasswordToken': 0,
                    'author.resetPasswordExpire': 0,
                    relevance: 0
                }
            }
        ]);

        // Total count for pagination
        // Note: For large datasets, this count should be optimized or estimated
        const totalCount = await Post.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $match: {
                    $or: [
                        { content: { $regex: queryStr, $options: 'i' } },
                        { 'author.username': { $regex: queryStr, $options: 'i' } },
                        { 'author.fullName': { $regex: queryStr, $options: 'i' } }
                    ]
                }
            },
            { $count: 'total' }
        ]);

        const total = totalCount[0]?.total || 0;

        res.status(200).json({
            posts,
            currentPage: parseInt(page as string),
            totalPages: Math.ceil(total / parseInt(limit as string)),
            totalPosts: total
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get trending posts based on engagement and recency
 * @route   GET /api/feed/trending
 * @access  Private
 */
export const getTrendingPosts = async (req: any, res: Response) => {
    try {
        const { timeRange = 'all', page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        // 1. Calculate Date Range
        let dateFilter: any = {};
        const now = new Date();

        if (timeRange !== 'all') {
            const startDate = new Date();
            if (timeRange === 'day') startDate.setDate(now.getDate() - 1);
            else if (timeRange === 'week') startDate.setDate(now.getDate() - 7);
            else if (timeRange === 'month') startDate.setMonth(now.getMonth() - 1);

            dateFilter = { createdAt: { $gte: startDate } };
        }

        // 2. Aggregation Pipeline
        const posts = await Post.aggregate([
            { $match: dateFilter },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    commentsCount: { $ifNull: ["$commentCount", 0] },
                    hoursSincePost: {
                        $divide: [
                            { $subtract: [now, "$createdAt"] },
                            3600000 // Convert ms to hours
                        ]
                    }
                }
            },
            {
                $addFields: {
                    // Trend Score = (Likes*1 + Comments*2) / (HoursSincePost + 2)^1.8
                    // We removed the +1 base score to let true engagement shine, 
                    // but kept the denominator offset to avoid division by zero or huge scores for brand new posts.
                    engagementScore: {
                        $add: [
                            { $multiply: ["$likesCount", 1] },
                            { $multiply: ["$commentsCount", 2] }
                        ]
                    },
                    timeDecay: {
                        $pow: [
                            { $add: ["$hoursSincePost", 2] },
                            1.8
                        ]
                    }
                }
            },
            {
                $addFields: {
                    trendScore: { $divide: ["$engagementScore", "$timeDecay"] }
                }
            },
            { $sort: { trendScore: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit as string) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0,
                    'author.resetPasswordToken': 0,
                    'author.resetPasswordExpire': 0,
                    trendScore: 0,
                    engagementScore: 0,
                    timeDecay: 0,
                    hoursSincePost: 0
                }
            }
        ]);

        const total = await Post.countDocuments(dateFilter);

        res.status(200).json({
            posts,
            currentPage: parseInt(page as string),
            totalPages: Math.ceil(total / parseInt(limit as string)),
            totalPosts: total
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete a post
 * @route   DELETE /api/feed/delete-post/:postId
 * @access  Private (Owner only)
 */
export const deletePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Authorization check
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
