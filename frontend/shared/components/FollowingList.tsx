"use client";
import React, { useEffect, useState } from 'react';
import { getFollowing } from '../../services/follow.service';
import { User } from '../../types/follow.types';
import FollowButton from './FollowButton';

interface FollowingListProps {
    userId: string;
    onClose?: () => void;
}

export default function FollowingList({ userId, onClose }: FollowingListProps) {
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFollowing();
    }, [userId]);

    const fetchFollowing = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getFollowing(userId);
            setFollowing(response.following || []);
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
                    onClick={fetchFollowing}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (following.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>Not following anyone yet</p>
            </div>
        );
    }

    return (
        <div className="max-h-[500px] overflow-y-auto">
            {following.map((user) => (
                <div
                    key={user._id || user.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar || '/default-avatar.png'}
                            alt={user.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                            </p>
                        </div>
                    </div>
                    <FollowButton
                        userId={user._id || user.id!}
                        size="small"
                        onSuccess={fetchFollowing}
                    />
                </div>
            ))}
        </div>
    );
}
