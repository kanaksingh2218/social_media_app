"use client";
import React from 'react';

interface UserStatsProps {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    onFollowersClick: () => void;
    onFollowingClick: () => void;
    onPostsClick?: () => void;
    isLoading?: boolean;
    className?: string;
}

export default function UserStats({
    postsCount,
    followersCount,
    followingCount,
    onFollowersClick,
    onFollowingClick,
    onPostsClick,
    isLoading = false,
    className = ""
}: UserStatsProps) {
    if (isLoading) {
        return (
            <div className={`flex items-center justify-around md:justify-start md:gap-10 w-full ${className}`}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col md:flex-row items-center gap-1">
                        <div className="w-8 h-5 bg-[#262626] animate-pulse rounded" />
                        <div className="w-16 h-4 bg-[#262626] animate-pulse rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const StatItem = ({ count, label, onClick, isClickable }: { count: number, label: string, onClick?: () => void, isClickable?: boolean }) => {
        const content = (
            <div className="flex flex-col md:flex-row items-center gap-1.5 group">
                <span className="font-bold text-[16px] md:text-base leading-none">
                    {count ?? "—"}
                </span>
                <span className="text-[14px] md:text-base font-normal text-[#a8a8a8] group-hover:text-white transition-colors capitalize">
                    {label}
                </span>
            </div>
        );

        if (isClickable) {
            return (
                <button
                    onClick={onClick}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-opacity active:opacity-50"
                    aria-label={`${count} ${label}`}
                >
                    {content}
                </button>
            );
        }

        return <div aria-label={`${count} ${label}`}>{content}</div>;
    };

    return (
        <div className={`flex items-center justify-around md:justify-start md:gap-10 w-full border-t border-b border-[#262626] md:border-none py-3 md:py-0 ${className}`}>
            <StatItem
                count={postsCount}
                label="posts"
                onClick={onPostsClick}
                isClickable={!!onPostsClick}
            />
            <StatItem
                count={followersCount}
                label="followers"
                onClick={onFollowersClick}
                isClickable={true}
            />
            <StatItem
                count={followingCount}
                label="following"
                onClick={onFollowingClick}
                isClickable={true}
            />
        </div>
    );
}
