import { Response } from 'express';
import User from '../User.model';
import { catchAsync } from '../../shared/middlewares/error.middleware';

export const getMe = catchAsync(async (req: any, res: Response) => {
    // req.user.id is set by the existing protect middleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    res.json({
        success: true,
        user
    });
});
