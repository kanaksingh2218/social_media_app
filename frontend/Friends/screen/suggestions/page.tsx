"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import SuggestionCard from '../../component/SuggestionCard';

export default function SuggestionsPage() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await api.get('/friends/suggestions');
                setSuggestions(res.data);
            } catch (err) {
                console.error('Failed to fetch suggestions', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto py-8 px-4">
                <h1 className="text-xl font-bold mb-6">Suggested for you</h1>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className="flex items-center gap-3 animate-pulse">
                                <div className="w-11 h-11 rounded-full bg-[var(--surface)]" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-[var(--surface)] w-1/4 rounded" />
                                    <div className="h-2 bg-[var(--surface)] w-1/3 rounded" />
                                </div>
                                <div className="w-20 h-8 bg-[var(--surface)] rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {suggestions.map((user) => (
                            <SuggestionCard key={user._id} user={user} />
                        ))}
                        {suggestions.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-[var(--secondary)] font-medium">No suggestions at the moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
