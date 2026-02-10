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
            if (!userId) {
                console.error('❌ [FRIENDS-UI] No user ID provided to FriendRequestButton');
                alert('Internal Error: User ID is missing');
                setLoading(false);
                return;
            }

            console.log(`📡 [FRIENDS-UI] Sending request to: ${userId}`);
            await friendService.sendRequest(userId);
            setStatus('pending');
            if (onStatusChange) onStatusChange('pending');
            console.log(`✅ [FRIENDS-UI] Request sent successfully`);
        } catch (err: any) {
            const serverMessage = err.response?.data?.message || err.message || 'Unknown error';
            const lowerMessage = serverMessage.toLowerCase();

            // Handle specific business logic errors gracefully - PRIORITY ORDER MATTERS
            // suppressed console.error for known business items
            if (lowerMessage.includes('already sent you a request')) {
                console.log(`ℹ️ [FRIENDS-UI] Reciprocal request exists, treating as pending for UI`);
                setStatus('pending');
                if (onStatusChange) onStatusChange('pending');
            } else if (lowerMessage.includes('already sent') || lowerMessage.includes('pending request')) {
                console.log(`ℹ️ [FRIENDS-UI] Request already exists, syncing UI`);
                setStatus('pending');
                if (onStatusChange) onStatusChange('pending');
            } else if (lowerMessage.includes('already friends') || lowerMessage.includes('friends with this user')) {
                console.log(`ℹ️ [FRIENDS-UI] Already friends, syncing UI`);
                setStatus('friends');
                if (onStatusChange) onStatusChange('friends');
            } else {
                // If it's a generic or unknown error, log it efficiently and alert
                console.error('❌ [FRIENDS-UI] Add friend failed:', err);
                alert(serverMessage || 'Failed to send friend request');
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
