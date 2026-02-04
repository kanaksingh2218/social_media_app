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
        const response = await api.post(`/follow/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to follow user');
    }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId: string): Promise<FollowResponse> => {
    try {
        const response = await api.delete(`/unfollow/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to unfollow user');
    }
};

/**
 * Accept a follow request
 */
export const acceptRequest = async (requestId: string): Promise<FollowResponse> => {
    try {
        const response = await api.post(`/follow-request/accept/${requestId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to accept request');
    }
};

/**
 * Reject a follow request
 */
export const rejectRequest = async (requestId: string): Promise<FollowResponse> => {
    try {
        const response = await api.post(`/follow-request/reject/${requestId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to reject request');
    }
};

/**
 * Get followers of a user
 */
export const getFollowers = async (userId: string): Promise<FollowListResponse> => {
    try {
        const response = await api.get(`/followers/${userId}`);
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
        const response = await api.get(`/following/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch following');
    }
};

/**
 * Get pending requests (received)
 */
export const getPendingRequests = async (): Promise<PendingRequestsResponse> => {
    try {
        const response = await api.get('/follow-requests/pending');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending requests');
    }
};

/**
 * Get sent requests
 */
export const getSentRequests = async (): Promise<PendingRequestsResponse> => {
    try {
        const response = await api.get('/follow-requests/sent');
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
        const response = await api.get(`/follow-status/${userId}`);
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
        const response = await api.post('/follow-status/bulk', { userIds });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bulk follow status');
    }
};
