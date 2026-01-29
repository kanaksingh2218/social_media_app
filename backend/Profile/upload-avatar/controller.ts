import { Request, Response } from 'express';
import { updateAvatarService } from '../profile.service';

export const uploadAvatar = async (req: any, res: Response) => {
    try {
        console.log('DEBUG: Avatar Upload Request Received');
        console.log('DEBUG: User ID:', req.user?.id);
        console.log('DEBUG: File Payload:', req.file);

        if (!req.file) {
            console.warn('DEBUG: No file found in request');
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const user = await updateAvatarService(req.user.id, req.file.path);
        console.log('DEBUG: Avatar Service successfully called');
        res.json(user);
    } catch (error: any) {
        console.error('Upload Avatar Error:', error);
        res.status(error.message === 'User not found' ? 404 : 500).json({
            message: error.message || 'Server Error'
        });
    }
};
