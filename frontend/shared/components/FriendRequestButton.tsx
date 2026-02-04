"use client";
import React, { useState } from 'react';
import friendService from '@/services/friend.service';

interface FriendRequestButtonProps {
    userId: string;
    initialStatus?: 'none' | 'pending' | 'accepted' | 'rejected' | 'friends';
    className?: string;
    onStatusChange?: (status: string) => void;
}

export default function FriendRequestButton({
    userId,
    initialStatus = 'none',
    className = '',
    onStatusChange
}: FriendRequestButtonProps) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleAddFriend = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation if inside a Link
        e.stopPropagation();

        setLoading(true);
        try {
            await friendService.sendRequest(userId);
            setStatus('pending');
            if (onStatusChange) onStatusChange('pending');
        } catch (err: any) {
            console.error('Add friend failed:', err);
            const message = (err.response?.data?.message || 'Failed to send request').toLowerCase();

            // If already requested, update state to 'pending'
            if (message.includes('already sent') || message.includes('pending request')) {
                setStatus('pending');
                if (onStatusChange) onStatusChange('pending');
            } else if (message.includes('already friends')) {
                setStatus('friends');
                if (onStatusChange) onStatusChange('friends');
            } else {
                alert(err.response?.data?.message || 'Failed to send request');
            }
        } finally {
            setLoading(false);
        }
    };

    if (status === 'friends' || status === 'accepted') {
        return (
            <button
                disabled
                className={`text-xs font-bold px-4 py-1.5 rounded-lg border border-[var(--border)] text-[var(--secondary)] bg-transparent ${className}`}
            >
                Friends
            </button>
        );
    }

    if (status === 'pending') {
        return (
            <button
                disabled
                className={`text-xs font-bold px-4 py-1.5 rounded-lg border border-[var(--border)] text-[var(--secondary)] bg-[var(--surface)] ${className}`}
            >
                Requested
            </button>
        );
    }

    return (
        <button
            onClick={handleAddFriend}
            disabled={loading}
            className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95 bg-[var(--primary)] text-white hover:brightness-110 disabled:opacity-70 disabled:pointer-events-none ${className}`}
        >
            {loading ? 'Sending...' : 'Add Friend'}
        </button>
    );
}
