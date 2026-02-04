"use client";
import React, { useEffect, useState } from 'react';
import { getPendingRequests, acceptRequest, rejectRequest } from '../../services/follow.service';
import { Relationship } from '../../types/follow.types';

interface PendingRequestsProps {
    onUpdate?: () => void;
}

export default function PendingRequests({ onUpdate }: PendingRequestsProps) {
    const [requests, setRequests] = useState<Relationship[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getPendingRequests();
            setRequests(response.requests || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        if (processingIds.has(requestId)) return;

        setProcessingIds(prev => new Set(prev).add(requestId));

        // Optimistic update
        setRequests(prev => prev.filter(r => r._id !== requestId));

        try {
            await acceptRequest(requestId);
            onUpdate?.();
        } catch (err: any) {
            // Rollback on error
            await fetchRequests();
            alert(err.message);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(requestId);
                return next;
            });
        }
    };

    const handleReject = async (requestId: string) => {
        if (processingIds.has(requestId)) return;

        setProcessingIds(prev => new Set(prev).add(requestId));

        // Optimistic update
        setRequests(prev => prev.filter(r => r._id !== requestId));

        try {
            await rejectRequest(requestId);
            onUpdate?.();
        } catch (err: any) {
            // Rollback on error
            await fetchRequests();
            alert(err.message);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(requestId);
                return next;
            });
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
                    onClick={fetchRequests}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No pending requests</p>
            </div>
        );
    }

    return (
        <div className="max-h-[500px] overflow-y-auto">
            {requests.map((request) => {
                const sender = (request as any).sender; // Populated sender
                const isProcessing = processingIds.has(request._id);

                return (
                    <div
                        key={request._id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={sender?.avatar || '/default-avatar.png'}
                                alt={sender?.fullName || 'User'}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {sender?.fullName || 'Unknown User'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    @{sender?.username || 'unknown'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAccept(request._id)}
                                disabled={isProcessing}
                                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleReject(request._id)}
                                disabled={isProcessing}
                                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
