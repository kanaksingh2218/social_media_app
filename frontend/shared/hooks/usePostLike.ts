import { useState, useCallback } from 'react';
import api from '@/services/api.service';

interface UsePostLikeProps {
    postId: string;
    initialLiked?: boolean;
    initialCount?: number;
    userId?: string; // Optional: to check if user is in likes array if initialLiked not provided
}

export const usePostLike = ({
    postId,
    initialLiked = false,
    initialCount = 0
}: UsePostLikeProps) => {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialCount);
    const [isLiking, setIsLiking] = useState(false);

    const toggleLike = useCallback(async () => {
        if (isLiking) return;

        const previousLiked = liked;
        const previousCount = likeCount;

        // Optimistic update
        setLiked(!previousLiked);
        setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);
        setIsLiking(true);

        try {
            // Determine endpoint based on *intended* state (which is !previousLiked)
            // If it was liked, we want to unlike. If it wasn't, we want to like.
            if (previousLiked) {
                await api.delete(`/posts/like/${postId}`);
            } else {
                await api.post(`/posts/like/${postId}`);
            }
        } catch (err) {
            console.error('Like toggle failed', err);
            // Revert state on error
            setLiked(previousLiked);
            setLikeCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    }, [liked, likeCount, postId, isLiking]);

    return {
        liked,
        likeCount,
        toggleLike,
        isLiking
    };
};
