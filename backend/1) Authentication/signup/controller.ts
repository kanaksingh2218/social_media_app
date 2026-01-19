import { Request, Response } from 'express';
import User from '../User.model';
import { generateToken } from '../../shared/utils/jwt.util';

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, email, password, fullName } = req.body;
        console.log('Signup attempt:', { username, email, fullName });

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            console.log('User already exists:', { username, email });
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ username, email, password, fullName });
        console.log('User created successfully:', user._id);

        const token = generateToken(user._id.toString());
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error: any) {
        console.error('Signup error details:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};
