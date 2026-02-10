import { Request, Response } from 'express';
import User from '../User.model';
import { generateToken } from '../../shared/utils/jwt.util';
import { catchAsync } from '../../shared/middlewares/error.middleware';

export const signup = catchAsync(async (req: Request, res: Response) => {
    const { username, email, password, fullName } = req.body;
    console.log('Signup attempt:', { username, email, fullName });

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, email, password, fullName });
    console.log('User created successfully:', user._id);

    const token = generateToken(user._id.toString());

    res.status(201).json({
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
