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
        pendingRequestFromMe: boolean;
        pendingRequestToMe: boolean;
        pendingRequestType?: 'friend' | 'follow' | null;
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
        if (relationship?.isFriend) return 'friends';
        if (relationship?.isFollowing) return 'following';
        if (relationship?.pendingRequestFromMe) return 'pending_sent';
        if (relationship?.pendingRequestToMe) return 'pending_received';
        return 'not_following';
    };

    return (
        <div className="flex items-center gap-2 w-full md:w-auto">
            {relationship?.pendingRequestToMe ? (
                /* Incoming Friend Request Actions */
                <div className="flex items-center gap-2" key="incoming-actions">
                    <button
                        onClick={() => handleFriendAction('accept')}
                        disabled={loading}
                        className="px-4 py-1.5 bg-[#0095f6] hover:bg-[#1877f2] rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleFriendAction('reject')}
                        disabled={loading}
                        className="px-4 py-1.5 bg-[#363636] hover:bg-[#262626] rounded-lg text-sm font-bold text-center transition-colors disabled:opacity-50"
                    >
                        Delete
                    </button>
                </div>
            ) : (
                /* Single Follow/Relationship Button instance */
                <FollowButton
                    key="relationship-button"
                    userId={userId}
                    initialStatus={getInitialStatus()}
                    onSuccess={onRefresh}
                />
            )}

            <button className="flex-1 md:flex-none px-6 py-1.5 bg-[#363636] hover:bg-[#262626] rounded-lg font-bold text-sm transition-colors">
                Message
            </button>
        </div>
    );
}
