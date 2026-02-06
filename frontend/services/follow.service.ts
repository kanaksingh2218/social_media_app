import api from './api.service';
import {
    FollowResponse,
    FollowStatusResponse,
    BulkFollowStatusResponse,
    FollowListResponse,
    PendingRequestsResponse
} from '../types/follow.types';

/**
 * Follow a user
 */
export const followUser = async (userId: string): Promise<FollowResponse> => {
    try {
        console.log(`🔄 Sending follow request to user: ${userId}`);
        const response = await api.post(`/users/${userId}/follow`);
        console.log('✅ Follow response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Follow user error:', error);
        throw new Error(error.response?.data?.message || 'Failed to follow user');
    }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId: string): Promise<FollowResponse> => {
    try {
        console.log(`🔄 Unfollowing user: ${userId}`);
        const response = await api.delete(`/users/${userId}/follow`);
        console.log('✅ Unfollow response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Unfollow user error:', error);
        throw new Error(error.response?.data?.message || 'Failed to unfollow user');
    }
};

/**
 * Accept a follow request
 */
export const acceptRequest = async (requestId: string): Promise<FollowResponse> => {
    try {
        console.log(`✅ Accepting follow request: ${requestId}`);
        const response = await api.post(`/users/follow-requests/${requestId}/accept`);
        console.log('✅ Accept response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Accept request error:', error);
        throw new Error(error.response?.data?.message || 'Failed to accept request');
    }
};

/**
 * Reject a follow request
 */
export const rejectRequest = async (requestId: string): Promise<FollowResponse> => {
    try {
        console.log(`❌ Rejecting follow request: ${requestId}`);
        const response = await api.delete(`/users/follow-requests/${requestId}`);
        console.log('✅ Reject response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Reject request error:', error);
        throw new Error(error.response?.data?.message || 'Failed to reject request');
    }
};

/**
 * Alias for rejectRequest
 */
export const declineRequest = rejectRequest;

/**
 * Get followers of a user
 */
export const getFollowers = async (userId: string): Promise<FollowListResponse> => {
    try {
        const response = await api.get(`/users/${userId}/followers`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch followers');
    }
};

/**
 * Get following of a user
 */
export const getFollowing = async (userId: string): Promise<FollowListResponse> => {
    try {
        const response = await api.get(`/users/${userId}/following`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch following');
    }
};

/**
 * Get pending requests (received)
 */
export const getPendingRequests = async (): Promise<any> => {
    try {
        console.log('🔄 Fetching pending requests...');
        console.log('API Endpoint:', '/users/follow-requests');

        const response = await api.get('/users/follow-requests');

        console.log('✅ Fetched requests response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Error fetching requests:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch pending requests');
    }
};

/**
 * Get sent requests
 */
export const getSentRequests = async (): Promise<PendingRequestsResponse> => {
    try {
        const response = await api.get('/users/follow-requests/sent');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch sent requests');
    }
};

/**
 * Get follow status with a user
 */
export const getFollowStatus = async (userId: string): Promise<FollowStatusResponse> => {
    try {
        const response = await api.get(`/users/${userId}/relationship`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch follow status');
    }
};

/**
 * Get bulk follow status
 */
export const getBulkFollowStatus = async (userIds: string[]): Promise<BulkFollowStatusResponse> => {
    try {
        const response = await api.post('/users/follow-status/bulk', { userIds });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bulk follow status');
    }
};
