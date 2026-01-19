"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import FriendCard from '../../component/FriendCard';
import { useAuth } from '@/context/AuthContext';

export default function FriendsListPage() {
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await api.get('/friends/list');
                setFriends(res.data);
            } catch (err) {
                console.error('Failed to fetch friends', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchFriends();
    }, [user]);

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto py-8 px-4">
                <h1 className="text-xl font-bold mb-6">Friends</h1>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className="flex items-center gap-3 animate-pulse">
                                <div className="w-11 h-11 rounded-full bg-[var(--surface)]" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-[var(--surface)] w-1/4 rounded" />
                                    <div className="h-2 bg-[var(--surface)] w-1/3 rounded" />
                                </div>
                                <div className="w-20 h-8 bg-[var(--surface)] rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {friends.map((friend) => (
                            <FriendCard key={friend._id} friend={friend} />
                        ))}
                        {friends.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-[var(--secondary)] font-medium">You haven't added any friends yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
