"use client";
import React from 'react';
import Link from 'next/link';
import FollowButton from './FollowButton';
import UserStats from './UserStats';

export default function ProfileHeader({ user, isOwnProfile }: { user: any, isOwnProfile: boolean }) {
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 px-4">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
                {user.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--secondary)] font-bold text-4xl md:text-6xl">
                        {user.username?.[0]?.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-6">
                    <h1 className="text-xl font-normal">{user.username}</h1>
                    <div className="flex gap-2">
                        {isOwnProfile ? (
                            <Link href="/profile/edit" className="bg-[var(--surface)] border border-[var(--border)] px-4 py-1.5 rounded-lg font-semibold text-sm hover:opacity-80 transition-opacity">Edit Profile</Link>
                        ) : (
                            <FollowButton userId={user._id || user.id} />
                        )}
                        <button className="bg-[var(--surface)] border border-[var(--border)] px-4 py-1.5 rounded-lg font-semibold text-sm hover:opacity-80 transition-opacity">Message</button>
                    </div>
                </div>

                <div className="hidden md:block mb-6">
                    <UserStats
                        followersCount={user.followers?.length || 0}
                        followingCount={user.following?.length || 0}
                        friendsCount={user.friends?.length || 0}
                    />
                </div>

                <div className="text-center md:text-left">
                    <h2 className="font-semibold text-sm mb-1">{user.fullName}</h2>
                    <p className="text-sm whitespace-pre-wrap">{user.bio || 'Digital Creator\nSocial Media App Clone'}</p>
                </div>
            </div>
        </div>
    );
}
