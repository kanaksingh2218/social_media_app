import { useState, useCallback, useEffect, useRef } from 'react';
import api from '@/services/api.service';

export interface Comment {
    _id: string;
    content: string; // The API returns 'content' for the comment text field based on previous implementation
    author: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    createdAt: string;
}

interface UseCommentsReturn {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    addComment: (content: string, user: any) => Promise<boolean>;
    deleteComment: (commentId: string) => Promise<boolean>;
    refreshComments: () => void;
}

export const useComments = (postId: string, limit: number = 10): UseCommentsReturn => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Prevent duplicate fetches
    const isFetchingRef = useRef(false);

    const fetchComments = useCallback(async (currentPage: number, reset: boolean = false) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const res = await api.get(`/posts/comments/${postId}?page=${currentPage}&limit=${limit}`);
            const newComments = res.data.comments || [];
            const totalPages = res.data.totalPages || 1;

            setComments(prev => {
                if (reset) return newComments;

                // Deduplicate logic
                const existingIds = new Set(prev.map(c => c._id));
                const uniqueNewComments = newComments.filter((c: Comment) => !existingIds.has(c._id));

                return [...prev, ...uniqueNewComments];
            });

            setHasMore(currentPage < totalPages);
        } catch (err) {
            console.error('Failed to fetch comments', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [postId, limit]);

    // Initial load
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchComments(1, true);
    }, [postId, fetchComments]);

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchComments(nextPage, false);
        }
    };

    const refreshComments = () => {
        setPage(1);
        setHasMore(true);
        fetchComments(1, true);
    };

    const addComment = async (content: string, user: any) => {
        // Create optimistic comment
        const tempId = `temp-${Date.now()}`;
        const optimisticComment: Comment = {
            _id: tempId,
            content,
            author: {
                _id: user.id || user._id,
                username: user.username,
                profilePicture: user.profilePicture
            },
            createdAt: new Date().toISOString()
        };

        // Optimistic update - Add to TOP
        setComments(prev => [optimisticComment, ...prev]);

        try {
            // Note: Backend expects 'text', frontend displays 'content'
            const res = await api.post(`/posts/comment/${postId}`, { text: content });

            // The backend returns the created comment. 
            // Often backend models use 'text' but our interface uses 'content'.
            // Ensure compatibility.
            const serverComment = res.data;

            // Normalize
            const normalizedComment = {
                ...serverComment,
                content: serverComment.content || serverComment.text,
                author: serverComment.author || serverComment.user
            };

            // Replace optimistic comment with real one
            setComments(prev => prev.map(c => c._id === tempId ? normalizedComment : c));
            return true;
        } catch (err) {
            console.error('Failed to add comment', err);
            // Revert optimistic update
            setComments(prev => prev.filter(c => c._id !== tempId));
            alert('Failed to post comment');
            return false;
        }
    };

    const deleteComment = async (commentId: string) => {
        const prevComments = [...comments];
        // Optimistic update
        setComments(prev => prev.filter(c => c._id !== commentId));

        try {
            await api.delete(`/posts/comments/delete/${commentId}`);
            return true;
        } catch (err) {
            console.error('Failed to delete comment', err);
            // Revert
            setComments(prevComments);
            alert('Failed to delete comment');
            return false;
        }
    };

    return {
        comments,
        loading,
        error,
        hasMore,
        loadMore,
        addComment,
        deleteComment,
        refreshComments
    };
};
