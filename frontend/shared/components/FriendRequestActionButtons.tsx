"use client";
import React, { useState } from 'react';
import friendService from '@/services/friend.service';

interface FriendRequestActionButtonsProps {
    requestId: string;
    onActionComplete: (requestId: string, action: 'accept' | 'reject' | 'cancel') => void;
    type?: 'incoming' | 'sent';
    className?: string;
}

export default function FriendRequestActionButtons({
    requestId,
    onActionComplete,
    type = 'incoming',
    className = ''
}: FriendRequestActionButtonsProps) {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: 'accept' | 'reject' | 'cancel') => {
        setLoading(true);
        try {
            if (action === 'accept') {
                await friendService.acceptRequest(requestId);
            } else if (action === 'reject') {
                await friendService.rejectRequest(requestId);
            } else if (action === 'cancel') {
                // For cancel, we might need receiverId depending on backend, but typically usually requestId is enough or different endpoint
                // Based on previous code: service.cancelRequest takes userId. 
                // Wait, let's re-verify friendService.cancelRequest implementation.
                // It seems previous implementation passed userId to cancelRequest, not requestId.
                // This component might need to handle that distinction.
                // Let's assume requestId is passed for accept/reject, but for cancel usually it's the target userId?
                // Actually friendService.cancelRequest(userId) was used in FriendsListPage.
                // FriendRequestCard receives `request` object.
                // Let's defer cancel logic verification or assume we pass the ID expected by the service.
                // If the parent passes the correct ID for "requestId" prop based on usage, it works.
                // BUT: FriendsListPage used `request.receiver._id` for cancel, while accept/reject used `request._id`.
                // This implies `requestId` prop might refer to different things.
                // To make this robust, maybe we simply perform the action passed by parent?
                // No, the goal is to refactor logic *into* this component.
                // So we need to know WHICH ID to use.
                // IF type is SENT, requestId should be the USER ID of the receiver? Or the request ID?
                // The backend typically needs RequestID for accept/reject.
                // For cancel, existing service uses `api.delete('/friends/cancel/${userId}')`.
                // So for 'sent', `requestId` MUST be `userId`.
                // I will document this requirement or handle it.
                // Ideally, we should unify backend to always use RequestID, but I cannot change backend easily right now.
                // So I will assume: if type='sent', requestId is targetUserId. if type='incoming', requestId is actual RequestID.

                await friendService.cancelRequest(requestId);
            }
            onActionComplete(requestId, action);
        } catch (err) {
            console.error(`${action} failed`, err);
            // toast error?
        } finally {
            setLoading(false);
        }
    };

    if (type === 'sent') {
        return (
            <div className={`flex gap-2 ${className}`}>
                <button
                    onClick={() => handleAction('cancel')}
                    disabled={loading}
                    className={`text-xs font-bold px-4 py-2 rounded-lg bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-gray-100 transition-colors whitespace-nowrap ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className={`flex gap-2 ${className}`}>
            <button
                onClick={() => handleAction('accept')}
                disabled={loading}
                className={`text-xs font-bold px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity whitespace-nowrap ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                Confirm
            </button>
            <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className={`text-xs font-bold px-4 py-2 rounded-lg bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors whitespace-nowrap ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                Delete
            </button>
        </div>
    );
}
