"use client";
import React, { useEffect, useState } from 'react';
import { getFollowers } from '../../services/follow.service';
import { User } from '../../types/follow.types';
import FollowButton from './FollowButton';

interface FollowersListProps {
    userId: string;
    onClose?: () => void;
}

export default function FollowersList({ userId, onClose }: FollowersListProps) {
    const [followers, setFollowers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFollowers();
    }, [userId]);

    const fetchFollowers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getFollowers(userId);
            setFollowers(response.followers || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchFollowers}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (followers.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No followers yet</p>
            </div>
        );
    }

    return (
        <div className="max-h-[500px] overflow-y-auto">
            {followers.map((follower) => (
                <div
                    key={follower._id || follower.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <img
                            src={follower.avatar || '/default-avatar.png'}
                            alt={follower.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {follower.fullName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                @{follower.username}
                            </p>
                        </div>
                    </div>
                    <FollowButton
                        userId={follower._id || follower.id!}
                        size="small"
                        onSuccess={fetchFollowers}
                    />
                </div>
            ))}
        </div>
    );
}
