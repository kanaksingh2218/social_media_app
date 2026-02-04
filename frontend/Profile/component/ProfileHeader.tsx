"use client";
import React, { useState, useEffect } from 'react';
import UserStats from './UserStats';
import ActionButtons from './ActionButtons';
import ConnectionsModal from './ConnectionsModal';
import { getImageUrl } from '@/shared/utils/image.util';

export default function ProfileHeader({
    user,
    isOwnProfile,
    postsCount = 0,
    followersCount: initialFollowersCount = 0,
    followingCount: initialFollowingCount = 0,
    onRefresh
}: {
    user: any,
    isOwnProfile: boolean,
    postsCount?: number,
    followersCount?: number,
    followingCount?: number,
    onRefresh: () => void
}) {
    const [followersCount, setFollowersCount] = useState(initialFollowersCount);
    const [followingCount, setFollowingCount] = useState(initialFollowingCount);
    const isLoading = !user || Object.keys(user).length === 0;

    useEffect(() => {
        setFollowersCount(initialFollowersCount);
        setFollowingCount(initialFollowingCount);
    }, [initialFollowersCount, initialFollowingCount]);

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

    const imageUrl = getImageUrl(user.profilePicture);

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-24 px-4 py-6 md:py-10">
            {/* Avatar Section */}
            <div className="relative group shrink-0">
                <div className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[3px] rounded-full">
                    <div className="w-[77px] h-[77px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-2 border-black bg-[var(--surface)] flex items-center justify-center">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#262626]">
                                <svg aria-label="Placeholder" fill="#b0b0b0" height="40" role="img" viewBox="0 0 24 24" width="40"><path d="M12 7.002a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-6a11 11 0 1 0 11 11 11.012 11.012 0 0 0-11-11Zm6.13 17.114a8.91 8.91 0 0 1-12.26 0 1 1 0 0 1-.166-1.127 5.013 5.013 0 0 1 3.25-4.576.75.75 0 1 1 .5.3c-.6.2-2.144.823-2.6 3.012a7.481 7.481 0 0 0 10.26 0c-.456-2.189-2-2.812-2.6-3.012a.75.75 0 1 1 .5-.3 5.01 5.01 0 0 1 3.25 4.542.946.946 0 0 1-.133 1.161ZM12 14.232a3.25 3.25 0 1 1 3.25-3.25 3.25 3.25 0 0 1-3.25 3.25Z"></path></svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full">
                {/* User Identification & Actions */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h1 className="text-[20px] font-normal leading-tight">{user.username}</h1>
                    <div className="flex items-center gap-2">
                        <ActionButtons
                            isOwnProfile={isOwnProfile}
                            userId={user.id || user._id}
                            followers={user.followers || []}
                            onRefresh={onRefresh}
                            onCountChange={(offset) => setFollowersCount(prev => prev + offset)}
                            relationship={user.relationship}
                        />
                    </div>
                </div>

                {/* Stats row (Desktop) */}
                <UserStats
                    postsCount={postsCount}
                    followersCount={followersCount}
                    followingCount={followingCount}
                    onFollowersClick={() => openModal('followers')}
                    onFollowingClick={() => openModal('following')}
                    isLoading={isLoading}
                    className="hidden md:flex"
                />

                {/* User Bio */}
                <div className="text-[14px]">
                    <h2 className="font-bold mb-0.5">{user.fullName}</h2>
                    <p className="whitespace-pre-wrap leading-relaxed opacity-90">{user.bio || ""}</p>
                    {user.website && (
                        <a
                            href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#e0f1ff] font-bold hover:underline block truncate mt-1"
                        >
                            {user.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </div>

                {/* Stats row (Mobile) - Positioned below bio for standard IG layout */}
                <UserStats
                    postsCount={postsCount}
                    followersCount={followersCount}
                    followingCount={followingCount}
                    onFollowersClick={() => openModal('followers')}
                    onFollowingClick={() => openModal('following')}
                    isLoading={isLoading}
                    className="flex md:hidden mt-4"
                />
            </div>

            <ConnectionsModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                userId={user._id || user.id}
                type={modalConfig.type}
                onUpdate={onRefresh}
                onCountChange={(offset, type) => {
                    if (type === 'followers') setFollowersCount(prev => prev + offset);
                    if (type === 'following') setFollowingCount(prev => prev + offset);
                }}
            />
        </div>
    );
}
