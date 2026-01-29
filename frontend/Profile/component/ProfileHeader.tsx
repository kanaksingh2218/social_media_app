"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import FollowButton from './FollowButton';
import ConnectionsModal from './ConnectionsModal';

export default function ProfileHeader({
    user,
    isOwnProfile,
    postsCount = 0,
    followersCount = 0,
    followingCount = 0,
    onRefresh
}: {
    user: any,
    isOwnProfile: boolean,
    postsCount?: number,
    followersCount?: number,
    followingCount?: number,
    onRefresh: () => void
}) {
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'followers' | 'following'; title: string }>({
        isOpen: false,
        type: 'followers',
        title: 'Followers'
    });

    const openModal = (type: 'followers' | 'following') => {
        setModalConfig({
            isOpen: true,
            type,
            title: type.charAt(0).toUpperCase() + type.slice(1)
        });
    };
    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    };

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-24 px-4 py-4 md:py-12">
            {/* Top Row for Mobile: Avatar + Stats */}
            <div className="flex items-center justify-between w-full md:w-auto md:block gap-4 md:gap-0">
                {/* Avatar Section */}
                <div className="relative group shrink-0">
                    <div className="w-[77px] h-[77px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden bg-[#262626] flex items-center justify-center p-[2px] cursor-pointer">
                        <div className="w-full h-full rounded-full overflow-hidden border-[4px] border-black bg-[var(--surface)] flex items-center justify-center">
                            {user.profilePicture ? (
                                <img
                                    src={getImageUrl(user.profilePicture)}
                                    alt={user.username}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <svg aria-label="Placeholder" fill="#b0b0b0" height="40" role="img" viewBox="0 0 24 24" width="40"><path d="M12 7.002a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-6a11 11 0 1 0 11 11 11.012 11.012 0 0 0-11-11Zm6.13 17.114a8.91 8.91 0 0 1-12.26 0 1 1 0 0 1-.166-1.127 5.013 5.013 0 0 1 3.25-4.576.75.75 0 1 1 .5.3c-.6.2-2.144.823-2.6 3.012a7.481 7.481 0 0 0 10.26 0c-.456-2.189-2-2.812-2.6-3.012a.75.75 0 1 1 .5-.3 5.01 5.01 0 0 1 3.25 4.542.946.946 0 0 1-.133 1.161ZM12 14.232a3.25 3.25 0 1 1 3.25-3.25 3.25 3.25 0 0 1-3.25 3.25Z"></path></svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Stats (Only on mobile, placed next to avatar) */}
                <div className="md:hidden flex flex-1 items-center justify-around gap-2">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-[16px]">{postsCount}</span>
                        <span className="text-white text-[13px] font-normal">posts</span>
                    </div>
                    <div
                        onClick={() => openModal('followers')}
                        className="flex flex-col items-center cursor-pointer active:opacity-50"
                    >
                        <span className="font-bold text-[16px]">{followersCount}</span>
                        <span className="text-white text-[13px] font-normal">followers</span>
                    </div>
                    <div
                        onClick={() => openModal('following')}
                        className="flex flex-col items-center cursor-pointer active:opacity-50"
                    >
                        <span className="font-bold text-[16px]">{followingCount}</span>
                        <span className="text-white text-[13px] font-normal">following</span>
                    </div>
                </div>
            </div>

            {/* User Details */}
            <div className="flex-1 flex flex-col gap-4 w-full text-left">
                {/* Row 1: Username + Settings (on mobile, name is below pic) */}
                <div className="flex items-center gap-3 md:mb-2">
                    <h1 className="text-[20px] font-normal tracking-tight">{user.username}</h1>
                    {isOwnProfile && <Settings size={20} className="cursor-pointer hover:opacity-70" />}
                </div>

                {/* Row 2: Name, Bio, and Website (below username on mobile) */}
                <div className="space-y-0.5">
                    <h2 className="font-bold text-sm md:text-base tracking-tight">{user.fullName}</h2>
                    <p className="text-[14px] font-normal leading-relaxed opacity-90 whitespace-pre-wrap">{user.bio}</p>
                    {user.website && (
                        <a
                            href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#e0f1ff] text-[14px] font-bold hover:underline block truncate"
                        >
                            {user.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </div>

                {/* Row 3: Buttons (Full width on mobile) */}
                <div className="flex gap-2 w-full mt-2">
                    {isOwnProfile ? (
                        <Link href="/profile/edit" className="flex-1 px-4 py-1.5 bg-[#363636] hover:bg-[#262626] rounded-lg text-sm font-bold text-center transition-colors">Edit profile</Link>
                    ) : (
                        <>
                            <FollowButton
                                userId={user._id || user.id}
                                followers={user.followers}
                                onSuccess={onRefresh}
                            />
                            <button className="flex-1 md:flex-none px-6 py-1.5 bg-[#363636] hover:bg-[#262626] rounded-lg font-bold text-sm">Message</button>
                        </>
                    )}
                </div>

                {/* Desktop Stats (Hidden on mobile) */}
                <div className="hidden md:flex items-center gap-10 mt-4">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-base">{postsCount}</span>
                        <span className="text-white text-base font-normal">posts</span>
                    </div>
                    <div
                        onClick={() => openModal('followers')}
                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                        <span className="font-bold text-base">{followersCount}</span>
                        <span className="text-white text-base font-normal">followers</span>
                    </div>
                    <div
                        onClick={() => openModal('following')}
                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                        <span className="font-bold text-base">{followingCount}</span>
                        <span className="text-white text-base font-normal">following</span>
                    </div>
                </div>
            </div>

            <ConnectionsModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                userId={user._id || user.id}
                type={modalConfig.type}
                onUpdate={onRefresh}
            />
        </div>
    );
}
