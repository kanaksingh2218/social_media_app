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

    // Suggestions
    getSuggestions: async () => {
        const res = await api.get('/friends/suggestions');
        return res.data;
    }
};

export default friendService;
