"use client";
import React, { useState } from 'react';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';

interface FollowButtonProps {
    userId: string;
    followers?: string[];
    onSuccess: (isFollowing?: boolean) => void;
    onOptimisticUpdate?: (isFollowing: boolean) => void;
}

export default function FollowButton({ userId, followers, onSuccess, onOptimisticUpdate }: FollowButtonProps) {
    const { user: currentUser, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // ... (existing code)

    const handleAction = async () => {
        if (!currentUser) return alert('Please login to follow');
        setLoading(true);

        // Optimistic update
        const previousState = isFollowing;
        const newState = !isFollowing;
        setIsFollowing(newState);

        // Notify parent immediately
        if (onOptimisticUpdate) {
            onOptimisticUpdate(newState);
        }

        try {
            if (previousState) {
                await api.post(`/profile/unfollow/${userId}`);
            } else {
                await api.post(`/profile/follow/${userId}`);
            }
            // Refresh current user's data to update the following list
            await refreshUser();
            // Trigger a refresh in the parent component (for the modal list)
            onSuccess(newState);
        } catch (err) {
            console.error('Action failed', err);
            // Revert optimistic update on error
            setIsFollowing(previousState);
            if (onOptimisticUpdate) {
                onOptimisticUpdate(previousState);
            }
            alert('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract ID from either string or object
    const extractId = (item: any): string => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item._id || item.id || '';
    };

    // Don't show follow button for self
    if (currentUser) {
        const currentId = extractId(currentUser);
        if (currentId === userId) return null;
    }

    // Check if current user is following this user
    const checkIsFollowing = (): boolean => {
        if (!currentUser) return false;

        const currentUserId = extractId(currentUser);

        // Check in current user's following list
        if (currentUser.following && Array.isArray(currentUser.following)) {
            const isInFollowing = currentUser.following.some((followedUser: any) => {
                const followedId = extractId(followedUser);
                return followedId === userId;
            });
            if (isInFollowing) return true;
        }

        // Fallback: Check if current user is in the target user's followers list
        if (followers && Array.isArray(followers)) {
            return followers.some((follower: any) => {
                const followerId = extractId(follower);
                return followerId === currentUserId;
            });
        }

        return false;
    };

    const [isFollowing, setIsFollowing] = useState(checkIsFollowing());
    const [isHovering, setIsHovering] = useState(false);

    // Update isFollowing when currentUser changes
    React.useEffect(() => {
        setIsFollowing(checkIsFollowing());
    }, [currentUser, followers]);



    const getButtonContent = () => {
        if (loading) return '...';
        if (isFollowing) {
            return isHovering ? 'Unfollow' : 'Following';
        }
        return 'Follow';
    };

    const getButtonStyles = () => {
        if (isFollowing) {
            return isHovering
                ? 'bg-[#262626] text-red-500 border border-white/10'
                : 'bg-[#363636] text-white hover:bg-[#262626]';
        }
        return 'bg-[#0095f6] hover:bg-[#1877f2] text-white';
    };

    return (
        <button
            onClick={handleAction}
            disabled={loading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`flex-1 md:flex-none px-6 py-1.5 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 ${getButtonStyles()}`}
        >
            {getButtonContent()}
        </button>
    );
}
