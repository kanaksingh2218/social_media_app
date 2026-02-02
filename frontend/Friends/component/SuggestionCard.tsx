"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/shared/utils/image.util';
import api from '@/services/api.service';

export default function SuggestionCard({ user, onRemove }: { user: any, onRemove?: () => void }) {
    const [sent, setSent] = useState(user.hasPendingRequest || false);
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        setLoading(true);
        try {
            await api.post('/friends/send', { receiverId: user._id || user.id });
            setSent(true);
            if (onRemove) {
                // Delay removal for visual feedback
                setTimeout(onRemove, 1000);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Request failed';
            console.error('Friend request failed:', message);
            alert(message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex items-center justify-between py-3 px-4 hover:bg-[var(--surface)] transition-colors rounded-2xl group">
            <Link href={`/profile/${user._id || user.id}`} className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 ig-avatar-ring !p-[2px] group-hover:scale-105">
                    <div className="ig-avatar-inner border-2">
                        {user.profilePicture ? (
                            <img src={getImageUrl(user.profilePicture)} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            user.username?.[0]?.toUpperCase()
                        )}
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight tracking-tight">{user.username}</span>
                    <span className="text-[13px] text-[var(--secondary)] leading-tight font-medium">{user.fullName}</span>
                </div>
            </Link>
            <button
                onClick={handleAdd}
                disabled={loading || sent || isFollowing}
                className={`text-xs font-black px-5 py-2 rounded-full transition-all active:scale-95 ${isFollowing
                    ? 'bg-[#363636] text-white border border-transparent'
                    : sent
                        ? 'bg-[var(--border)] text-[var(--foreground)] border border-transparent'
                        : 'bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20 hover:brightness-95'
                    } disabled:opacity-50`}
            >
                {isFollowing ? 'Following' : sent ? 'Requested' : 'Follow'}
            </button>
        </div>
    );
}
