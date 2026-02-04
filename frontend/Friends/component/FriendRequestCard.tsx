"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { formatRelativeTime } from '@/shared/utils/date.util';
import FriendRequestActionButtons from '@/shared/components/FriendRequestActionButtons';

interface FriendRequestCardProps {
    request: any;
    type: 'incoming' | 'sent';
    onAction: (id: string, action: 'accept' | 'reject' | 'cancel') => Promise<void>;
}

export default function FriendRequestCard({ request, type, onAction }: FriendRequestCardProps) {
    const user = type === 'incoming' ? request.sender : request.receiver;

    // For 'sent', the service.cancelRequest expects userId. For 'incoming', accept/reject expects requestId.
    const actionId = type === 'sent' ? (user._id || user.id) : (request._id || request.id);

    return (
        <div className="flex items-center justify-between py-3 px-2 hover:bg-[var(--surface-hover)] rounded-xl transition-colors group">
            <Link href={`/profile/${user?.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm flex-shrink-0">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm opacity-60">{user?.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold leading-tight truncate">{user?.fullName || user?.username}</span>
                    <div className="flex items-center gap-2 text-xs text-[var(--secondary)]">
                        <span className="truncate">
                            {type === 'incoming' ? 'Sent request' : 'Request pending'}
                        </span>
                        {request.createdAt && (
                            <>
                                <span className="text-[10px]">•</span>
                                <span>{formatRelativeTime(request.createdAt)}</span>
                            </>
                        )}
                    </div>
                </div>
            </Link>

            <FriendRequestActionButtons
                requestId={actionId}
                type={type}
                className="ml-4"
                onActionComplete={(id, action) => onAction(request._id || request.id, action)}
            />
        </div>
    );
}
