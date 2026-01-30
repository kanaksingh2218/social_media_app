"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';

interface FollowButtonProps {
    userId: string;
    followers?: any[];
    onSuccess: () => void;
    onOptimisticUpdate?: (isNowFollowing: boolean) => void;
    onCountChange?: (offset: number) => void;
}

export default function FollowButton({
    userId,
    followers = [],
    onSuccess,
    onOptimisticUpdate,
    onCountChange
}: FollowButtonProps) {
    const { user: currentUser, refreshUser } = useAuth();

    // Helper to check if following
    const checkIsFollowing = (followerList: any[], currentUserId: string) => {
        if (!currentUserId) return false;
        return followerList.some(f => {
            const id = typeof f === 'string' ? f : (f._id || f.id);
            return id === currentUserId;
        });
    };

    const currentUserId = currentUser?.id || currentUser?._id;

    // Fallback to checking currentUser.following if followers list is not provided
    const getInitialFollowingState = () => {
        if (followers.length > 0) return checkIsFollowing(followers, currentUserId);
        if (currentUser?.following) return checkIsFollowing(currentUser.following, userId);
        return false;
    };

    const [isFollowing, setIsFollowing] = useState(getInitialFollowingState());
    const [loading, setLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        setIsFollowing(getInitialFollowingState());
    }, [followers, currentUserId, currentUser?.following, userId]);

    const handleAction = async () => {
        if (!currentUser) return alert('Please login to follow');

        // Optimistic update
        const previousState = isFollowing;
        const newState = !previousState;

        setIsFollowing(newState);
        if (onOptimisticUpdate) onOptimisticUpdate(newState);
        if (onCountChange) onCountChange(newState ? 1 : -1);

        setLoading(true);
        try {
            if (previousState) {
                await api.post(`/profile/unfollow/${userId}`);
            } else {
                await api.post(`/profile/follow/${userId}`);
            }
            // Background refresh to ensure consistency
            refreshUser();
            onSuccess();
        } catch (err: any) {
            console.error('Follow action failed:', err);
            // Revert optimistic update
            setIsFollowing(previousState);
            if (onOptimisticUpdate) onOptimisticUpdate(previousState);
            // Revert count: if we added 1, subtract 1. If we subtracted, add back.
            if (onCountChange) onCountChange(newState ? -1 : 1);

            const message = err.response?.data?.message || 'Failed to update follow status';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    // Don't show for own profile
    if (currentUserId === userId) return null;

    const getButtonStyles = () => {
        if (isFollowing) {
            return isHovering
                ? 'bg-[#ed4956] text-white border-transparent' // Destructive unfollow hover
                : 'bg-[#363636] text-white border border-transparent hover:bg-[#262626]';
        }
        return 'bg-[#0095f6] hover:bg-[#1877f2] text-white border-transparent';
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleAction();
            }}
            disabled={loading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`flex-1 md:flex-none px-6 py-1.5 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 min-w-[100px] flex items-center justify-center gap-2 ${getButtonStyles()}`}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <span>
                    {isFollowing ? (isHovering ? 'Unfollow' : 'Following') : 'Follow'}
                </span>
            )}
        </button>
    );
}
