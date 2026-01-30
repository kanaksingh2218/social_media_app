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
    onCountChange?: (offset: number, type: 'followers' | 'following') => void;
}

import { useAuth } from '@/context/AuthContext';
import { Search } from 'lucide-react';
import UserListItem from './UserListItem';

export default function ConnectionsModal({ isOpen, onClose, title, userId, type, onUpdate, onCountChange }: ConnectionsModalProps) {
    const { user: currentUser } = useAuth();
    const [list, setList] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            fetchList();
        } else {
            setList([]);
            setSearchQuery('');
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

    const filteredList = list.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isOwnProfile = currentUser && (currentUser._id === userId || currentUser.id === userId);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-[#262626] w-full max-w-[400px] h-[500px] flex flex-col rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-[#262626] border-b border-white/10">
                    <div className="flex items-center justify-between p-4">
                        <div className="w-8" />
                        <h2 className="font-bold text-[16px]">{title}</h2>
                        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-4 pb-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search"
                                className="w-full bg-[#363636] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-0 placeholder:text-[var(--secondary)] placeholder:font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col gap-4 p-4">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div key={n} className="flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/5" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-3 bg-white/5 rounded w-1/3" />
                                            <div className="h-2 bg-white/5 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-8 bg-white/5 rounded-lg w-20" />
                                </div>
                            ))}
                        </div>
                    ) : filteredList.length > 0 ? (
                        <div className="p-1">
                            {filteredList.map((item) => (
                                <UserListItem
                                    key={item._id || item.id}
                                    user={item}
                                    onClose={onClose}
                                    isFollowersList={type === 'followers'}
                                    isOwnerView={isOwnProfile}
                                    onCountChange={onCountChange}
                                    onUpdate={() => {
                                        // Handle list removal for 'following' if it's user's own profile
                                        if ((type === 'following' || type === 'followers') && isOwnProfile) {
                                            setList(prev => prev.filter(u => (u._id || u.id) !== (item._id || item.id)));
                                        }
                                        onUpdate?.();
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                            {searchQuery ? (
                                <>
                                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4 text-[var(--secondary)]">
                                        <Search size={32} opacity={0.3} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">No results found</h3>
                                    <p className="text-[var(--secondary)] text-sm">We couldn&apos;t find any users matching &quot;{searchQuery}&quot;</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4 text-[var(--secondary)]">
                                        <X size={32} opacity={0.3} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">No {type} yet</h3>
                                    <p className="text-[var(--secondary)] text-sm">When people {type === 'followers' ? 'follow' : 'followed'} this account, they&apos;ll appear here.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
