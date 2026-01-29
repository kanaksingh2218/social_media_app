import { Request, Response } from 'express';
import { updateProfileService } from '../profile.service';

export const updateProfile = async (req: any, res: Response) => {
    try {
        const { fullName, bio, isPrivate, username, website } = req.body;
        console.log('Update Profile Request Body:', req.body);

        if (fullName !== undefined && fullName.trim() === '') {
            return res.status(400).json({ message: 'Full name cannot be empty' });
        }

        if (username !== undefined && username.trim() === '') {
            return res.status(400).json({ message: 'Username cannot be empty' });
        }

        const updateData: any = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (bio !== undefined) updateData.bio = bio;
        if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
        if (username !== undefined) updateData.username = username;
        if (website !== undefined) updateData.website = website;

        console.log('Update Data for user', req.user.id, ':', updateData);

        const user = await updateProfileService(req.user.id, updateData);
        console.log('Updated user in DB:', user.username, user.website);
        res.json(user);
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        res.status(error.message === 'User not found' ? 404 : 500).json({
            message: error.message || 'Server Error'
        });
    }
};
