"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import friendService from '@/services/friend.service';
import SuggestionCard from './SuggestionCard';

export default function FriendSuggestions({ className }: { className?: string }) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const data = await friendService.getSuggestions();
                setSuggestions(data);
            } catch (err) {
                console.error('Failed to fetch suggestions', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    if (loading) {
        return (
            <div className={`flex flex-col gap-4 ${className}`}>
                <div className="flex justify-between items-end px-2 mb-2">
                    <div className="h-4 w-32 bg-[var(--surface)] rounded animate-pulse" />
                    <div className="h-3 w-16 bg-[var(--surface)] rounded animate-pulse" />
                </div>
                {[1, 2, 3].map(n => (
                    <div key={n} className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-[var(--surface)] animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-[var(--surface)] w-3/4 rounded animate-pulse" />
                            <div className="h-2 bg-[var(--surface)] w-1/2 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (suggestions.length === 0) return null;

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex justify-between items-center px-4 mb-4">
                <span className="font-bold text-[var(--secondary)] text-sm">Suggested for you</span>
                <Link href="/explore/people" className="text-xs font-semibold hover:text-[var(--secondary)]">See All</Link>
            </div>

            <div className="flex flex-col gap-1">
                {suggestions.map(user => (
                    <SuggestionCard key={user._id || user.id} user={user} />
                ))}
            </div>
        </div>
    );
}
