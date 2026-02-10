import api from './api.service';

export const friendService = {
    // Friends
    getFriends: async () => {
        const res = await api.get('/friends/list');
        return res.data;
    },

    unfriend: async (friendId: string) => {
        const res = await api.delete(`/friends/unfriend/${friendId}`);
        return res.data;
    },

    // Requests
    getIncomingRequests: async () => {
        const res = await api.get('/friends/requests');
        return res.data;
    },

    getSentRequests: async () => {
        const res = await api.get('/friends/requests/sent');
        return res.data;
    },

    sendRequest: async (userId: string) => {
        if (!userId) throw new Error('User ID is required to send a friend request');
        // Body matches the backend validation expectation of { receiverId: string }
        const res = await api.post('/friends/send', { receiverId: userId });
        return res.data;
    },

    acceptRequest: async (requestId: string) => {
        const res = await api.put(`/friends/accept/${requestId}`);
        return res.data;
    },

    rejectRequest: async (requestId: string) => {
        const res = await api.put(`/friends/reject/${requestId}`);
        return res.data;
    },

    cancelRequest: async (userId: string) => {
        const res = await api.delete(`/friends/cancel/${userId}`);
        return res.data;
    },

    // Suggestions with caching
    getSuggestions: (() => {
        let cache: any = null;
        let cacheTimestamp = 0;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        return async () => {
            const now = Date.now();

            // Return cached data if still valid
            if (cache && (now - cacheTimestamp) < CACHE_DURATION) {
                console.log('📦 Using cached suggestions');
                return cache;
            }

            try {
                const res = await api.get('/friends/suggestions');
                cache = res.data;
                cacheTimestamp = now;
                return res.data;
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
                // Return empty array on error to prevent UI crash
                return [];
            }
        };
    })()
};

export default friendService;
