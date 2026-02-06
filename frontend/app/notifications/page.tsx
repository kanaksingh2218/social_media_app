'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import { getImageUrl } from '@/shared/utils/image.util';
import { Heart, UserPlus, Check, X, ShieldAlert } from 'lucide-react';

interface FollowRequest {
    _id: string;
    from: {
        _id: string;
        username: string;
        profilePicture: string;
        fullName: string;
    };
    createdAt: string;
}

interface Notification {
    _id: string;
    type: 'like' | 'comment' | 'follow' | 'friend_request';
    from: {
        _id: string;
        username: string;
        profilePicture: string;
    };
    post?: {
        _id: string;
        image?: string;
        content?: string;
    };
    message: string;
    createdAt: string;
    read: boolean;
}

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');
    const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [requestsRes, notificationsRes] = await Promise.all([
                api.get('/users/follow-requests'),
                api.get('/notifications')
            ]);

            setFollowRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
            setNotifications(notificationsRes.data || []);

            // Mark notifications as read
            if (notificationsRes.data?.length > 0) {
                await api.put('/notifications/read');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAccept = async (requestId: string) => {
        try {
            await api.post(`/users/follow-requests/${requestId}/accept`);
            setFollowRequests(prev => prev.filter(r => r._id !== requestId));
            // Trigger a refresh/update for notifications could be here
        } catch (error: any) {
            console.error('Accept error:', error);
            alert('Failed to accept request');
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await api.delete(`/users/follow-requests/${requestId}`);
            setFollowRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error: any) {
            console.error('Reject error:', error);
            alert('Failed to reject request');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-[600px] mx-auto py-8 px-4">
                    <h1 className="text-2xl font-black mb-8">Notifications</h1>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className="flex items-center gap-3 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-[var(--surface)]" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-[var(--surface)] w-3/4 rounded" />
                                    <div className="h-2 bg-[var(--surface)] w-1/4 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto min-h-screen border-x border-[var(--border)]">
                <h1 className="text-2xl font-black p-6">Notifications</h1>

                {/* Tabs */}
                <div className="flex border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-10">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-4 font-bold text-sm transition-all relative ${activeTab === 'all'
                            ? 'text-[var(--foreground)]'
                            : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        All
                        {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-4 font-bold text-sm transition-all relative flex items-center justify-center gap-2 ${activeTab === 'requests'
                            ? 'text-[var(--foreground)]'
                            : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        Requests
                        {followRequests.length > 0 && (
                            <span className="bg-[var(--primary)] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                                {followRequests.length}
                            </span>
                        )}
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)]" />}
                    </button>
                </div>

                {/* Content */}
                <div className="pb-20">
                    {activeTab === 'requests' ? (
                        <div className="divide-y divide-[var(--border)]">
                            {followRequests.length === 0 ? (
                                <div className="text-center py-20">
                                    <UserPlus size={48} className="mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-bold">Follow Requests</h3>
                                    <p className="text-[var(--secondary)]">When people ask to follow you, they'll appear here.</p>
                                </div>
                            ) : (
                                followRequests.map((request) => (
                                    <div key={request._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <Link href={`/profile/${request.from._id}`} className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--border)]">
                                                <img
                                                    src={getImageUrl(request.from.profilePicture) || '/default-avatar.png'}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{request.from.username}</p>
                                                <p className="text-sm text-[var(--secondary)]">{request.from.fullName}</p>
                                            </div>
                                        </Link>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(request._id)}
                                                className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                className="bg-white/10 text-[var(--foreground)] px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {/* Follow Requests Shortcut */}
                            {followRequests.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <UserPlus size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Follow Requests</p>
                                            <p className="text-sm text-blue-500 font-medium">
                                                {followRequests[0].from.username} {followRequests.length > 1 ? `+ ${followRequests.length - 1} others` : 'sent a request'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                                </button>
                            )}

                            {/* Notifications */}
                            {notifications.length === 0 && followRequests.length === 0 ? (
                                <div className="text-center py-20">
                                    <Heart size={48} className="mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-bold">No Activity Yet</h3>
                                    <p className="text-[var(--secondary)]">When someone likes or comments on your posts, you'll see it here.</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div key={notification._id} className={`p-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${!notification.read ? 'bg-blue-500/5' : ''}`}>
                                        <Link href={`/profile/${notification.from._id}`}>
                                            <div className="w-11 h-11 rounded-full overflow-hidden border border-[var(--border)]">
                                                <img
                                                    src={getImageUrl(notification.from.profilePicture) || '/default-avatar.png'}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </Link>
                                        <div className="flex-1">
                                            <p className="text-sm leading-tight">
                                                <Link href={`/profile/${notification.from._id}`} className="font-bold hover:opacity-70 transition-opacity">
                                                    {notification.from.username}
                                                </Link>
                                                {' '}{notification.message}
                                                <span className="text-[var(--secondary)] ml-2 text-xs">{getTimeAgo(notification.createdAt)}</span>
                                            </p>
                                        </div>
                                        {notification.post && (
                                            <Link href={`/post/${notification.post._id}`}>
                                                <div className="w-10 h-10 rounded-sm overflow-hidden border border-[var(--border)]">
                                                    {notification.post.image ? (
                                                        <img
                                                            src={getImageUrl(notification.post.image)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-[var(--surface)] flex items-center justify-center">
                                                            <Check size={14} className="opacity-20" />
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function getTimeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
}
