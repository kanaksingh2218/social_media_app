"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api.service';

export default function SuggestionCard({ user }: { user: any }) {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        setLoading(true);
        try {
            await api.post('/friends/send', { receiverId: user._id || user.id });
            setSent(true);
        } catch (err) {
            console.error('Request failed', err);
            alert('Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between py-2 px-1">
            <Link href={`/profile/${user._id || user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-11 h-11 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm opacity-60">{user.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight">{user.username}</span>
                    <span className="text-sm text-[var(--secondary)] leading-tight">{user.fullName}</span>
                </div>
            </Link>
            <button
                onClick={handleAdd}
                disabled={loading || sent}
                className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-colors ${sent
                    ? 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]'
                    : 'bg-[var(--primary)] text-white hover:opacity-90'
                    } disabled:opacity-50`}
            >
                {sent ? 'Requested' : 'Follow'}
            </button>
        </div>
    );
}
