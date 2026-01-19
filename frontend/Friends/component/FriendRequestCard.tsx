"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api.service';

export default function FriendRequestCard({ request, onAction }: { request: any, onAction: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: 'accept' | 'reject') => {
        setLoading(true);
        try {
            await api.put(`/friends/${action}/${request._id}`);
            onAction();
        } catch (err) {
            console.error(`${action} failed`, err);
            alert(`${action} failed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between py-2 px-1">
            <Link href={`/profile/${request.sender?._id || request.sender?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-11 h-11 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm">
                    {request.sender?.profilePicture ? (
                        <img src={request.sender.profilePicture} alt={request.sender.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm opacity-60">{request.sender?.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight">{request.sender?.username}</span>
                    <span className="text-sm text-[var(--secondary)] leading-tight">Sent you a request</span>
                </div>
            </Link>
            <div className="flex gap-2">
                <button
                    onClick={() => handleAction('accept')}
                    disabled={loading}
                    className="text-xs font-bold px-4 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    Accept
                </button>
                <button
                    onClick={() => handleAction('reject')}
                    disabled={loading}
                    className="text-xs font-bold px-4 py-1.5 rounded-lg bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
