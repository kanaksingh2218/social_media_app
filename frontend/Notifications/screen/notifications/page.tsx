"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import NotificationItem from '@/shared/components/NotificationItem';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            // Mark as read after 2 seconds
            setTimeout(async () => {
                try {
                    await api.put('/notifications/read');
                } catch (e) {
                    console.error('Failed to mark notifications as read', e);
                }
            }, 2000);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6 px-4">Notifications</h1>

                {loading ? (
                    <div className="flex flex-col gap-4 px-4">
                        {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className="flex items-center gap-3 animate-pulse">
                                <div className="w-11 h-11 rounded-full bg-[var(--surface)]" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-[var(--surface)] w-3/4 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((n) => (
                            <NotificationItem key={n._id} notification={n} />
                        ))}
                        {notifications.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-[var(--secondary)] font-medium">No notifications yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
