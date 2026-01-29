"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api.service';
import FollowButton from './FollowButton';

interface ConnectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    userId: string;
    type: 'followers' | 'following';
    onUpdate?: () => void;
}

import { useAuth } from '@/context/AuthContext';

export default function ConnectionsModal({ isOpen, onClose, title, userId, type, onUpdate }: ConnectionsModalProps) {
    const { user: currentUser } = useAuth();
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            fetchList();
        } else {
            // Clear list when closed to prevent flicker when reopening for a different user/type
            setList([]);
            setLoading(true);
        }
    }, [isOpen, userId, type]);

    const fetchList = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const res = await api.get(`/profile/${type}/${userId}`);
            setList(res.data);
        } catch (err) {
            console.error(`Failed to fetch ${type}`, err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    };

    const isOwnProfile = currentUser && (currentUser._id === userId || currentUser.id === userId);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-[#262626] w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="w-8" /> {/* Spacer */}
                    <h2 className="font-bold text-[16px]">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List Container */}
                <div className="h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col gap-4 p-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-11 h-11 rounded-full bg-white/5" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-white/5 rounded w-1/2" />
                                        <div className="h-2 bg-white/5 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : list.length > 0 ? (
                        <div className="p-2">
                            {list.map((item) => (
                                <Link
                                    key={item._id}
                                    href={`/profile/${item._id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                                >
                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-[#1a1a1a]">
                                        {item.profilePicture ? (
                                            <img
                                                src={getImageUrl(item.profilePicture)}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--secondary)] font-bold text-sm uppercase">
                                                {item.username[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate group-hover:underline">{item.username}</div>
                                        <div className="text-[13px] text-[var(--secondary)] truncate">{item.fullName}</div>
                                    </div>
                                    <div onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}>
                                        <FollowButton
                                            userId={item._id || item.id}
                                            onOptimisticUpdate={(isNowFollowing) => {
                                                // Truly Instant Optimistic Update:
                                                if (type === 'following' && isOwnProfile && isNowFollowing === false) {
                                                    setList(prev => prev.filter(u => (u._id || u.id) !== (item._id || item.id)));
                                                }
                                                // Notify parent to refresh counts immediately (optimistically)
                                                if (onUpdate) onUpdate();
                                            }}
                                            onSuccess={() => {
                                                // Background sync only if we didn't remove it (or to be safe)
                                                // If we removed it, we don't want to re-fetch immediately potentially stale data 
                                                // BUT if we don't fetch, we might miss other updates.
                                                // Given the user report, let's just NOT fetch if we are in 'following' list and it was an unfollow.
                                                // The onOptimisticUpdate handled the UI.
                                                if (type === 'following' && isOwnProfile) {
                                                    return;
                                                }
                                                fetchList(true);
                                                // Ensure final consistent state
                                                if (onUpdate) onUpdate();
                                            }}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center px-8">
                            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mb-4">
                                <X size={32} className="opacity-20" />
                            </div>
                            <h3 className="font-bold text-lg">No {type} yet</h3>
                            <p className="text-[var(--secondary)] text-sm">When people {type === 'followers' ? 'follow' : 'followed'} this account, they'll appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
