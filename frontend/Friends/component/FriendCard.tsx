"use client";
import React, { useState } from 'react';
import Link from 'next/link';

interface FriendCardProps {
    friend: any;
    onRemove?: (id: string) => void;
}

export default function FriendCard({ friend, onRemove }: FriendCardProps) {
    const [loading, setLoading] = useState(false);

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRemove && confirm(`Are you sure you want to remove ${friend.username} from your friends?`)) {
            setLoading(true);
            try {
                await onRemove(friend._id || friend.id);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex items-center justify-between py-3 px-2 hover:bg-[var(--surface-hover)] rounded-xl transition-colors">
            <Link href={`/profile/${friend.username}`} className="flex items-center gap-3 flex-1">
                <div className="relative">
                    <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm">
                        {friend.profilePicture ? (
                            <img
                                src={friend.profilePicture}
                                alt={`${friend.username}'s avatar`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <span className="text-sm opacity-60">{friend.username?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    {friend.isOnline !== undefined && (
                        <div
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[var(--background)] rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                            title={friend.isOnline ? 'Online' : 'Offline'}
                            aria-label={friend.isOnline ? 'Online' : 'Offline'}
                        />
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold leading-tight truncate">{friend.fullName || friend.username}</span>
                    <span className="text-xs text-[var(--secondary)] leading-tight truncate">@{friend.username}</span>
                </div>
            </Link>
            <div className="flex gap-2 ml-4">
                <Link
                    href={`/chat/${friend._id || friend.id}`}
                    className="text-xs font-bold px-4 py-2 rounded-lg bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors whitespace-nowrap"
                    aria-label={`Message ${friend.username}`}
                >
                    Message
                </Link>
                <button
                    onClick={handleRemove}
                    disabled={loading}
                    className="text-xs font-bold px-4 py-2 rounded-lg text-red-500 border border-transparent hover:bg-red-50 transition-colors whitespace-nowrap disabled:opacity-50"
                    aria-label={`Remove ${friend.username} from friends`}
                >
                    Remove
                </button>
            </div>
        </div>
    );
}
