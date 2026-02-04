"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/shared/components/Layout';
import FriendCard from '../../component/FriendCard';
import FriendRequestCard from '../../component/FriendRequestCard';
import { useAuth } from '@/context/AuthContext';
import friendService from '@/services/friend.service';

type TabType = 'friends' | 'incoming' | 'sent';

export default function FriendsListPage() {
    const [activeTab, setActiveTab] = useState<TabType>('friends');
    const [friends, setFriends] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [friendsData, incomingData, sentData] = await Promise.all([
                friendService.getFriends(),
                friendService.getIncomingRequests(),
                friendService.getSentRequests()
            ]);
            setFriends(friendsData);
            setIncomingRequests(incomingData);
            setSentRequests(sentData);
        } catch (err) {
            console.error('Failed to fetch friends data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

    // Actions
    const handleUnfriend = async (friendId: string) => {
        const previousFriends = [...friends];
        setFriends(friends.filter(f => (f._id || f.id) !== friendId));

        try {
            await friendService.unfriend(friendId);
        } catch (err) {
            console.error('Unfriend failed', err);
            setFriends(previousFriends);
            alert('Failed to remove friend');
        }
    };

    const handleRequestAction = async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
        if (action === 'accept') {
            const request = incomingRequests.find(r => (r._id || r.id) === requestId);
            setIncomingRequests(incomingRequests.filter(r => (r._id || r.id) !== requestId));
            if (request && request.sender) {
                setFriends([...friends, request.sender]);
            }
            try {
                await friendService.acceptRequest(requestId);
            } catch (err) {
                console.error('Accept failed', err);
                fetchData();
                alert('Failed to accept request');
            }
        } else if (action === 'reject') {
            setIncomingRequests(incomingRequests.filter(r => (r._id || r.id) !== requestId));
            try {
                await friendService.rejectRequest(requestId);
            } catch (err) {
                console.error('Reject failed', err);
                fetchData();
                alert('Failed to reject request');
            }
        } else if (action === 'cancel') {
            const request = sentRequests.find(r => (r._id || r.id) === requestId);
            setSentRequests(sentRequests.filter(r => (r._id || r.id) !== requestId));
            try {
                const targetUserId = request?.receiver?._id || request?.receiver?.id;
                if (targetUserId) {
                    await friendService.cancelRequest(targetUserId);
                }
            } catch (err) {
                console.error('Cancel failed', err);
                fetchData();
                alert('Failed to cancel request');
            }
        }
    };

    const SkeletonLoader = () => (
        <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="flex items-center gap-3 animate-pulse p-2">
                    <div className="w-12 h-12 rounded-full bg-[var(--surface)]" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-[var(--surface)] w-1/4 rounded" />
                        <div className="h-2 bg-[var(--surface)] w-1/3 rounded" />
                    </div>
                    <div className="w-20 h-9 bg-[var(--surface)] rounded-lg" />
                </div>
            ))}
        </div>
    );

    const renderEmptyState = () => {
        const messages = {
            friends: "You haven't added any friends yet.",
            incoming: "No pending friend requests.",
            sent: "No sent requests pending."
        };
        return (
            <div className="text-center py-20 px-4">
                <div className="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <p className="text-[var(--secondary)] font-medium">{messages[activeTab]}</p>
            </div>
        );
    };

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto py-8 px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Friends</h1>
                    <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
                        {(['friends', 'incoming', 'sent'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all relative ${activeTab === tab ? 'bg-[var(--background)] shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'incoming' && incomingRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] text-white text-[10px] rounded-full flex items-center justify-center border-2 border-[var(--background)]">
                                        {incomingRequests.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-[var(--border)] p-2">
                            {activeTab === 'friends' && (
                                <>
                                    {friends.map((friend) => (
                                        <FriendCard key={friend._id || friend.id} friend={friend} onRemove={handleUnfriend} />
                                    ))}
                                    {friends.length === 0 && renderEmptyState()}
                                </>
                            )}
                            {activeTab === 'incoming' && (
                                <>
                                    {incomingRequests.map((req) => (
                                        <FriendRequestCard key={req._id || req.id} request={req} type="incoming" onAction={handleRequestAction} />
                                    ))}
                                    {incomingRequests.length === 0 && renderEmptyState()}
                                </>
                            )}
                            {activeTab === 'sent' && (
                                <>
                                    {sentRequests.map((req) => (
                                        <FriendRequestCard key={req._id || req.id} request={req} type="sent" onAction={handleRequestAction} />
                                    ))}
                                    {sentRequests.length === 0 && renderEmptyState()}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
