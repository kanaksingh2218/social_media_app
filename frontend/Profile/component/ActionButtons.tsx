"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import FollowButton from '@/shared/components/FollowButton';
import { FollowStatus } from '@/types/follow.types';
import api from '@/services/api.service';

interface ActionButtonsProps {
    isOwnProfile: boolean;
    userId: string;
    followers: any[];
    onRefresh: () => void;
    onSettingsClick?: () => void;
    onCountChange?: (offset: number) => void;
    relationship?: {
        isFriend: boolean;
        isFollowing: boolean;
        followsMe: boolean;
        pendingFollowRequestFromMe: boolean;
        pendingFollowRequestToMe: boolean;
        pendingFriendRequestFromMe: boolean;
        pendingFriendRequestToMe: boolean;
        requestId: string | null;
    };
}

export default function ActionButtons({
    isOwnProfile,
    userId,
    followers,
    onRefresh,
    onSettingsClick,
    onCountChange,
    relationship
}: ActionButtonsProps) {
    const [loading, setLoading] = useState(false);

    const handleFriendAction = async (action: 'accept' | 'reject') => {
        if (!relationship?.requestId) return;
        setLoading(true);
        try {
            await api.put(`/friends/${action}/${relationship.requestId}`);
            onRefresh();
        } catch (err: any) {
            console.error(`${action} failed:`, err);
            alert(err.response?.data?.message || `${action} failed`);
        } finally {
            setLoading(false);
        }
    };

    // If it's the current user's own profile, show Edit/Settings
    if (isOwnProfile) {
        return (
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Link
                    href="/profile/edit"
                    className="flex-1 md:flex-none px-6 py-1.5 bg-[#363636] hover:bg-[#262626] rounded-lg text-sm font-bold text-center transition-colors"
                >
                    Edit profile
                </Link>
                <button
                    onClick={onSettingsClick}
                    className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                    <Settings size={20} className="cursor-pointer" />
                </button>
            </div>
        );
    }


    // Derived FollowStatus for FollowButton
    const getInitialStatus = (): FollowStatus => {
        if (relationship?.isFollowing) return 'following';
        // Only check FOLLOW request status, not friend requests
        if (relationship?.pendingFollowRequestFromMe) return 'requested';
        if (relationship?.pendingFollowRequestToMe) return 'pending_acceptance';
        return 'none';
    };

    return (
        <div className="flex items-center gap-2 w-full md:w-auto">
            <FollowButton
                key="follow-button"
                userId={userId}
                initialStatus={getInitialStatus()}
                followsMe={relationship?.followsMe}
                onSuccess={onRefresh}
            />

            <button className="flex-1 md:flex-none px-6 py-1.5 bg-[#363636] hover:bg-[#262626] rounded-lg font-bold text-sm transition-colors">
                Message
            </button>
        </div>
    );
}
