import api from './api.service';

export const highlightService = {
    createHighlight: async (data: { title: string; posts: string[]; coverImage?: string }) => {
        const res = await api.post('/highlights', data);
        return res.data;
    },
    getHighlightsByUserId: async (userId: string) => {
        const res = await api.get(`/highlights/user/${userId}`);
        return res.data;
    },
    updateHighlight: async (highlightId: string, data: { title?: string; posts?: string[]; coverImage?: string }) => {
        const res = await api.put(`/highlights/${highlightId}`, data);
        return res.data;
    },
    deleteHighlight: async (highlightId: string) => {
        const res = await api.delete(`/highlights/${highlightId}`);
        return res.data;
    }
};
