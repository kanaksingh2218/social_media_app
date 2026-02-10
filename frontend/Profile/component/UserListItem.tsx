"use client";
import React from 'react';
import Link from 'next/link';
import FollowButton from '@/shared/components/FollowButton';
import { getImageUrl } from '@/shared/utils/image.util';
import { removeFollower } from '@/services/follow.service';

interface UserListItemProps {
    user: {
        _id: string;
        id?: string;
        username: string;
        fullName: string;
        profilePicture?: string;
        relationship?: {
            isFriend: boolean;
            isFollowing: boolean;
            pendingRequestFromMe?: boolean;
            pendingRequestToMe?: boolean;
            requestId?: string | null;
        };
    };
    onUpdate?: () => void;
    onClose?: () => void;
    isFollowersList?: boolean;
    isOwnerView?: boolean;
    onCountChange?: (offset: number, type: 'followers' | 'following') => void;
}

export default function UserListItem({ user, onUpdate, onClose, isFollowersList, isOwnerView, onCountChange }: UserListItemProps) {
    const relationship = user.relationship;
    const [isRemoving, setIsRemoving] = React.useState(false);



    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isRemoving) return;

        if (!confirm(`Remove ${user.username} from your followers?`)) return;

        const targetId = user._id || user.id;

        setIsRemoving(true);
        if (onCountChange) onCountChange(-1, 'followers');
        try {
            await removeFollower(targetId!);
            onUpdate?.();
        } catch (err) {
            console.error('Failed to remove follower', err);
            if (onCountChange) onCountChange(1, 'followers');
            alert('Failed to remove follower');
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 p-3 hover:bg-white/5 transition-colors group rounded-xl">
            <Link
                href={`/profile/${user._id || user.id}`}
                onClick={onClose}
                className="flex items-center gap-3 flex-1 min-w-0"
            >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-[#1a1a1a] shrink-0 border border-white/5">
                    {user.profilePicture ? (
                        <img
                            src={getImageUrl(user.profilePicture)}
                            className="w-full h-full object-cover"
                            alt={user.username}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--secondary)] font-bold text-sm uppercase">
                            {user.username[0]}
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <div className="font-bold text-[14px] leading-tight truncate group-hover:underline">
                        {user.username}
                    </div>
                    <div className="text-[13px] text-[var(--secondary)] truncate font-medium">
                        {user.fullName}
                    </div>
                </div>
            </Link>

            <div className="shrink-0 flex items-center pr-1">
                {(isFollowersList && isOwnerView) ? (
                    <button
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="px-4 py-1.5 bg-[#363636] hover:bg-[#464646] text-white rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isRemoving ? '...' : 'Remove'}
                    </button>
                ) : (
                    <FollowButton
                        userId={user._id || user.id || ''}
                        onSuccess={() => onUpdate?.()}
                    />
                )}
            </div>
        </div>
    );
}
