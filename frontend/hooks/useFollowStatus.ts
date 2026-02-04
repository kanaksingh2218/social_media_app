import { useState, useEffect, useCallback } from 'react';
import { FollowStatus } from '../types/follow.types';
import * as followService from '../services/follow.service';

interface UseFollowStatusReturn {
    status: FollowStatus;
    loading: boolean;
    error: string | null;
    follow: () => Promise<void>;
    unfollow: () => Promise<void>;
    refresh: () => Promise<void>;
}

export const useFollowStatus = (userId: string, initialStatus?: FollowStatus): UseFollowStatusReturn => {
    const [status, setStatus] = useState<FollowStatus>(initialStatus || 'loading');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial status
    const refresh = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await followService.getFollowStatus(userId);
            setStatus(response.status);
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Follow action with optimistic update
    const follow = useCallback(async () => {
        if (loading) return;

        const previousStatus = status;

        try {
            // Optimistic update
            setStatus('loading');
            setLoading(true);
            setError(null);

            const response = await followService.followUser(userId);

            // Update based on response
            if (response.isPending) {
                setStatus('pending_sent');
            } else if (response.isFriend) {
                setStatus('friends');
            } else {
                setStatus('following');
            }
        } catch (err: any) {
            // Rollback on error
            setStatus(previousStatus);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, status, loading]);

    // Unfollow action with optimistic update
    const unfollow = useCallback(async () => {
        if (loading) return;

        const previousStatus = status;

        try {
            // Optimistic update
            setStatus('loading');
            setLoading(true);
            setError(null);

            await followService.unfollowUser(userId);
            setStatus('not_following');
        } catch (err: any) {
            // Rollback on error
            setStatus(previousStatus);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, status, loading]);

    // Fetch status on mount if not provided
    useEffect(() => {
        if (!initialStatus) {
            refresh();
        }
    }, [initialStatus, refresh]);

    return {
        status,
        loading,
        error,
        follow,
        unfollow,
        refresh
    };
};
