import { Request, Response } from 'express';
import User from '../../Authentication/User.model';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'Invalid user target' });
        }

        console.log(`[DEBUG] getProfile starting for: ${userId}`);

        // Build query
        let query: any = {};
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = userId;
        } else {
            // Escape special chars for safe regex lookup
            const escaped = userId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.username = { $regex: new RegExp(`^${escaped}$`, 'i') };
        }

        console.log(`[DEBUG] Query:`, JSON.stringify(query));

        // Attempt find - Security: Exclude reset tokens and password
        const user = await User.findOne(query).select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            console.log(`[DEBUG] User not found for query`);
            return res.status(404).json({ message: `User not found for: ${userId}` });
        }

        const populationPaths = [
            { path: 'followers', select: 'username profilePicture fullName' },
            { path: 'following', select: 'username profilePicture fullName' },
            { path: 'friends', select: 'username profilePicture fullName' }
        ];

        for (const path of populationPaths) {
            try {
                await user.populate(path);
            } catch (popError: any) {
                console.error(`[DEBUG] Population failed for path ${path.path}:`, popError.message);
                // We continue so the basic profile still loads
            }
        }

        // Security: Convert to object and clean sensitive fields before sending
        const finalizedUser = user.toObject();
        if ((req as any).user?.id !== finalizedUser._id.toString()) {
            delete (finalizedUser as any).email;
        }

        console.log(`[DEBUG] Sending profile for ${user.username}`);
        res.json(finalizedUser);

    } catch (error: any) {
        console.error('[CRITICAL] Backend getProfile ERROR:', error);
        res.status(500).json({
            message: error.message,
            stack: error.stack,
            debugInfo: 'Critical failure in getProfile controller'
        });
    }
};
