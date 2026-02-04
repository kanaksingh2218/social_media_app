import React from 'react';
import Link from 'next/link';
import FriendRequestActionButtons from './FriendRequestActionButtons';

interface FriendRequestNotificationItemProps {
    request: any;
    onActionComplete: (requestId: string) => void;
}

export default function FriendRequestNotificationItem({ request, onActionComplete }: FriendRequestNotificationItemProps) {
    const sender = request.sender;

    return (
        <div className="p-3 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors rounded-lg mb-1">
            <Link href={`/profile/${sender?.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm flex-shrink-0">
                    {sender?.profilePicture ? (
                        <img src={sender.profilePicture} alt={sender.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs opacity-60">{sender?.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold leading-tight truncate">{sender?.username}</span>
                    <span className="text-xs text-[var(--secondary)] leading-tight">sent you a request</span>
                </div>
            </Link>
            <FriendRequestActionButtons
                requestId={request._id || request.id}
                type="incoming"
                onActionComplete={(id) => onActionComplete(id)}
                className="ml-3"
            />
        </div>
    );
}
