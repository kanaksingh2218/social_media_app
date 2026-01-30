"use client";
import React from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import FollowButton from './FollowButton';

interface ActionButtonsProps {
    isOwnProfile: boolean;
    userId: string;
    followers: string[];
    onRefresh: () => void;
    onSettingsClick?: () => void;
    onCountChange?: (offset: number) => void;
}

export default function ActionButtons({
    isOwnProfile,
    userId,
    followers,
    onRefresh,
    onSettingsClick,
    onCountChange
}: ActionButtonsProps) {
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

    return (
        <div className="flex items-center gap-2 w-full md:w-auto">
            <FollowButton
                userId={userId}
                followers={followers}
                onSuccess={onRefresh}
                onCountChange={onCountChange}
            />
            <button className="flex-1 md:flex-none px-6 py-1.5 bg-[#363636] hover:bg-[#262626] rounded-lg font-bold text-sm transition-colors">
                Message
            </button>
        </div>
    );
}
