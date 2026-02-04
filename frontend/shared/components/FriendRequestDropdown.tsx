"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import friendService from '@/services/friend.service';
import FriendRequestNotificationItem from './FriendRequestNotificationItem';

interface FriendRequestDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestsChange: (count: number) => void;
}

export default function FriendRequestDropdown({ isOpen, onClose, onRequestsChange }: FriendRequestDropdownProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await friendService.getIncomingRequests();
            setRequests(data);
            onRequestsChange(data.length);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch initially to set badge count
        fetchRequests();
    }, []);

    useEffect(() => {
        // Fetch when opened
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleActionComplete = (requestId: string) => {
        const updated = requests.filter(r => (r._id || r.id) !== requestId);
        setRequests(updated);
        onRequestsChange(updated.length);
        if (updated.length === 0) {
            setTimeout(onClose, 1000); // Close after delay if empty
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay for mobile */}
            <div className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

            <div
                ref={dropdownRef}
                className={`
                    fixed md:absolute z-50 bg-[var(--background)] border-[var(--border)] overflow-hidden text-[var(--foreground)] shadow-2xl transition-all duration-300
                    
                    /* Mobile: Bottom Sheet */
                    bottom-0 left-0 right-0 rounded-t-2xl border-t md:border
                    ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:opacity-0 md:pointer-events-none'}
                    
                    /* Desktop: Dropdown */
                    md:top-full md:bottom-auto md:left-auto md:right-0 md:mt-3 md:w-[360px] md:rounded-xl md:translate-y-0
                    ${isOpen ? 'md:opacity-100 md:scale-100' : 'md:opacity-0 md:scale-95 md:pointer-events-none'}
                `}
            >
                {/* Mobile Handle */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-[var(--border)] rounded-full" />
                </div>

                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
                    <h3 className="font-bold text-[16px]">Friend Requests</h3>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="md:hidden text-sm font-semibold">Done</button>
                        <Link href="/friends" className="text-xs text-[var(--primary)] font-semibold hover:opacity-80 flex items-center">See all</Link>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[var(--border)]">
                    {loading ? (
                        <div className="flex flex-col gap-3 p-2">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-[var(--surface)]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-[var(--surface)] w-3/4 rounded" />
                                        <div className="h-2 bg-[var(--surface)] w-1/2 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : requests.length > 0 ? (
                        requests.map(req => (
                            <FriendRequestNotificationItem
                                key={req._id || req.id}
                                request={req}
                                onActionComplete={handleActionComplete}
                            />
                        ))
                    ) : (
                        <div className="py-12 text-center text-[var(--secondary)]">
                            <div className="mb-2">
                                <svg className="w-10 h-10 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <p className="text-sm">No pending requests</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

