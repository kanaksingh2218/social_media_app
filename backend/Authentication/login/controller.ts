import { Request, Response } from 'express';
import User from '../User.model';
import { generateToken } from '../../shared/utils/jwt.util';
import { catchAsync } from '../../shared/middlewares/error.middleware';

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id.toString());

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            profilePicture: user.profilePicture
        }
    });
});
