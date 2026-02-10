"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/shared/utils/image.util';
import FriendRequestButton from '@/shared/components/FriendRequestButton';

export default function SuggestionCard({ user, onRemove }: { user: any, onRemove?: () => void }) {

    return (
        <div className="flex items-center justify-between py-3 px-4 hover:bg-[var(--surface)] transition-colors rounded-2xl group">
            <Link href={`/profile/${user._id || user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 ig-avatar-ring !p-[2px] flex-shrink-0">
                    <div className="ig-avatar-inner border-2">
                        {user.profilePicture ? (
                            <img src={getImageUrl(user.profilePicture)} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[var(--surface-hover)] flex items-center justify-center text-xs font-bold text-[var(--secondary)]">
                                {user.username?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold leading-tight tracking-tight truncate">{user.username}</span>
                    <span className="text-xs text-[var(--secondary)] leading-tight truncate">{user.fullName}</span>
                    {user.mutualFriendsCount > 0 && (
                        <span className="text-[10px] text-[var(--secondary)] mt-0.5 truncate">
                            {user.mutualFriendsCount} mutual friend{user.mutualFriendsCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </Link>
            <FriendRequestButton
                userId={user._id || user.id}
                initialStatus={user.requestStatus || (user.relationship?.isFriend ? 'friends' : user.relationship?.pendingRequestFromMe ? 'pending' : 'none')}
                className="ml-2"
            />
        </div>
    );
}
