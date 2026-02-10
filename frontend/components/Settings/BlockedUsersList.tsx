'use client';
import React, { useEffect, useState } from 'react';
import api from '@/services/api.service';
import { Loader2, UserX } from 'lucide-react';

export default function BlockedUsersList() {
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlocked = async () => {
        try {
            const res = await api.get('/block');
            setBlockedUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocked();
    }, []);

    const handleUnblock = async (userId: string) => {
        try {
            await api.delete(`/block/${userId}`);
            setBlockedUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            alert('Failed to unblock');
        }
    };

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;

    if (blockedUsers.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <UserX size={48} className="mx-auto mb-3 opacity-50" />
                <p>You haven't blocked anyone.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-[var(--border)]">
            {blockedUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <img src={user.profilePicture || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-semibold">{user.username}</span>
                    </div>
                    <button
                        onClick={() => handleUnblock(user._id)}
                        className="text-xs font-bold px-3 py-1.5 border border-gray-600 rounded-lg hover:bg-white/10"
                    >
                        Unblock
                    </button>
                </div>
            ))}
        </div>
    );
}
