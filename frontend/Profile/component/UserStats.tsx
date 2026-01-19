"use client";
import React from 'react';

export default function UserStats({ followersCount, followingCount, friendsCount }: { followersCount: number, followingCount: number, friendsCount: number }) {
    return (
        <div className="flex justify-around md:justify-start gap-10 py-3 md:border-none border-y border-[var(--border)]">
            <div className="flex flex-col md:flex-row items-center gap-1">
                <span className="font-bold text-base">{followersCount}</span>
                <span className="text-[var(--secondary)] md:text-[var(--foreground)] text-sm">followers</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1">
                <span className="font-bold text-base">{followingCount}</span>
                <span className="text-[var(--secondary)] md:text-[var(--foreground)] text-sm">following</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1">
                <span className="font-bold text-base">{friendsCount}</span>
                <span className="text-[var(--secondary)] md:text-[var(--foreground)] text-sm">friends</span>
            </div>
        </div>
    );
}
