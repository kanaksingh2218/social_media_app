"use client";
import React from 'react';
import Link from 'next/link';

export default function FriendCard({ friend }: { friend: any }) {
    return (
        <div className="flex items-center justify-between py-2 px-1">
            <Link href={`/profile/${friend._id || friend.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-11 h-11 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm">
                    {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={friend.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm opacity-60">{friend.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight">{friend.username}</span>
                    <span className="text-sm text-[var(--secondary)] leading-tight">{friend.fullName}</span>
                </div>
            </Link>
            <div className="flex gap-2">
                <Link
                    href={`/chat/${friend._id || friend.id}`}
                    className="text-xs font-bold px-4 py-1.5 rounded-lg bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-gray-100 transition-colors"
                >
                    Message
                </Link>
            </div>
        </div>
    );
}
