import User from '../Authentication/User.model';

/**
 * Service to update user profile information
 * @param userId - ID of the user to update
 * @param updateData - Data to update (fullName, bio, isPrivate, username, website)
 * @returns Updated user object
 */
export const updateProfileService = async (userId: string, updateData: { fullName?: string; bio?: string; isPrivate?: boolean; username?: string; website?: string }) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Service to update user profile picture
 * @param userId - ID of the user to update
 * @param filePath - Path to the uploaded file
 * @returns Updated user object
 */
export const updateAvatarService = async (userId: string, filePath: string) => {
    // Normalize path: replace backslashes with forward slashes
    const normalizedPath = filePath.replace(/\\/g, '/');

    const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: normalizedPath },
        { new: true }
    ).select('-password');

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};
