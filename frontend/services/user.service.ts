import api from './api.service';

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<any> => {
    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user settings');
    }
};

/**
 * Update account privacy
 */
export const updatePrivacy = async (isPrivate: boolean): Promise<any> => {
    try {
        console.log(`📡 [USER-SERVICE] Updating privacy to: ${isPrivate}`);
        const response = await api.patch('/users/me/privacy', { isPrivate });
        return response.data;
    } catch (error: any) {
        console.error('❌ [USER-SERVICE] Update privacy failed:', error);
        throw new Error(error.response?.data?.message || 'Failed to update privacy settings');
    }
};

