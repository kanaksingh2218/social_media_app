'use client';
import { useEffect, useState } from 'react';
import { getPendingRequests, acceptRequest, rejectRequest } from '@/services/follow.service';
import Layout from '@/shared/components/Layout';
import { getImageUrl } from '@/shared/utils/image.util';
import Link from 'next/link';
import { User, AlertCircle, RefreshCw } from 'lucide-react';

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

export default function RequestsPage() {
    const [requests, setRequests] = useState<FollowRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🖼️ RequestsPage Mounted');
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            console.log('🔄 Starting to fetch requests in component...');
            setLoading(true);
            setError(null);

            const data = await getPendingRequests();

            console.log('✅ Fetched requests in component:', data);

            // Handle different possible response formats
            const requestsArray = Array.isArray(data) ? data : (data.requests || []);
            console.log('📋 Parsed requests array:', requestsArray.length, 'items');

            setRequests(requestsArray);
        } catch (err: any) {
            console.error('❌ Component fetch error:', err);
            setError(err.message || 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            console.log('✅ Accepting request:', requestId);
            await acceptRequest(requestId);
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err: any) {
            console.error('❌ Accept error:', err);
            alert('Failed to accept request: ' + err.message);
        }
    };

    const handleDecline = async (requestId: string) => {
        try {
            console.log('❌ Declining request:', requestId);
            await rejectRequest(requestId);
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err: any) {
            console.error('❌ Decline error:', err);
            alert('Failed to decline request: ' + err.message);
        }
    };

    console.log('🎨 Rendering - Loading:', loading, 'Requests:', requests.length, 'Error:', error);

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Follow Requests</h1>
                    {!loading && !error && (
                        <span className="text-sm font-medium text-[var(--secondary)]">
                            {requests.length} pending
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="flex items-center justify-between p-4 ig-card animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-[var(--surface-hover)]" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-[var(--surface-hover)] rounded" />
                                        <div className="h-3 w-32 bg-[var(--surface-hover)] rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 ig-card border-red-500/20 bg-red-500/5">
                        <div className="mb-4 flex justify-center">
                            <AlertCircle size={40} className="text-red-500 opacity-80" />
                        </div>
                        <h2 className="text-lg font-bold mb-2 text-red-500">Something went wrong</h2>
                        <p className="text-[var(--secondary)] text-sm mb-6 max-w-[280px] mx-auto">
                            {error}
                        </p>
                        <button
                            onClick={fetchRequests}
                            className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 mx-auto hover:brightness-110"
                        >
                            <RefreshCw size={18} />
                            Retry
                        </button>
                    </div>
                ) : requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request._id} className="flex items-center justify-between p-4 border rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all shadow-sm group">
                                <Link
                                    href={`/profile/${request.from?._id}`}
                                    className="flex items-center gap-4 flex-1"
                                >
                                    <div className="w-12 h-12 rounded-full ig-avatar-ring p-[2px]">
                                        <div className="ig-avatar-inner border-[2px]">
                                            {request.from?.profilePicture ? (
                                                <img
                                                    src={getImageUrl(request.from.profilePicture)}
                                                    alt={request.from.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={20} className="text-[var(--secondary)]" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm md:text-base leading-tight hover:underline">
                                            {request.from?.username}
                                        </p>
                                        <p className="text-xs md:text-sm text-[var(--secondary)] font-normal">
                                            {request.from?.fullName}
                                        </p>
                                    </div>
                                </Link>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleAccept(request._id)}
                                        className="bg-[var(--primary)] text-white px-5 py-1.5 rounded-lg text-sm font-bold hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDecline(request._id)}
                                        className="bg-[var(--button-secondary)] text-white border border-[var(--border)] px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-[var(--button-secondary-hover)] active:scale-95 transition-all"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 ig-card border-dashed">
                        <div className="mb-4 flex justify-center">
                            <div className="p-4 bg-[var(--surface-hover)] rounded-full">
                                <User size={40} className="text-[var(--secondary)] opacity-50" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-1">No follow requests</h2>
                        <p className="text-[var(--secondary)] text-sm max-w-[280px] mx-auto">
                            When someone sends you a follow request, it will appear here.
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
