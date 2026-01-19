"use client";
import React from 'react';
import Link from 'next/link';

export default function NotificationItem({ notification }: { notification: any }) {
    const getMessage = () => {
        switch (notification.type) {
            case 'like': return 'liked your post.';
            case 'comment': return 'commented on your post.';
            case 'friend_request': return 'sent you a friend request.';
            case 'follow': return 'started following you.';
            default: return 'sent you a notification.';
        }
    };

    return (
        <div className={`p-4 flex items-center justify-between hover:bg-[var(--surface)] transition-colors ${!notification.read ? 'bg-[var(--surface)]' : ''}`}>
            <Link href={`/profile/${notification.sender?._id || notification.sender?.id}`} className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm flex-shrink-0">
                    {notification.sender?.profilePicture ? (
                        <img src={notification.sender.profilePicture} alt={notification.sender.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm opacity-60">{notification.sender?.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="flex flex-col">
                    <p className="text-sm leading-tight text-[var(--foreground)]">
                        <span className="font-bold">{notification.sender?.username}</span> {getMessage()}
                        <span className="text-[var(--secondary)] ml-2 text-xs">{new Date(notification.createdAt).toLocaleDateString()}</span>
                    </p>
                </div>
            </Link>
            {!notification.read && <div className="w-2 h-2 bg-[var(--primary)] rounded-full ml-4" />}
        </div>
    );
}
