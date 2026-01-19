"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import SuggestionCard from '@/Friends/component/SuggestionCard';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                try {
                    const res = await api.get(`/search?query=${query}`);
                    setResults(res.data);
                } catch (err) {
                    console.error('Search failed', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-6">Search</h1>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by username or name..."
                            className="ig-input pl-12 h-12 text-base"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-11 h-11 rounded-full bg-[var(--surface)]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-[var(--surface)] w-1/4 rounded" />
                                        <div className="h-2 bg-[var(--surface)] w-1/3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {results.map((user) => (
                                <SuggestionCard key={user._id} user={user} />
                            ))}
                            {query && results.length === 0 && !loading && (
                                <div className="text-center py-20">
                                    <p className="text-[var(--secondary)] font-medium">No results found for "{query}"</p>
                                </div>
                            )}
                            {!query && !loading && (
                                <div className="text-center py-20">
                                    <p className="text-[var(--secondary)] font-medium">Try searching for people you know.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
