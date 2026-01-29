"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import SuggestionCard from '@/Friends/component/SuggestionCard';

import { Search } from 'lucide-react';

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
            <div className="max-w-[1000px] mx-auto py-12">
                <div className="max-w-[600px] mx-auto px-4">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black mb-8 tracking-tighter">Search</h1>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--secondary)] group-focus-within:text-[var(--primary)] transition-all duration-300">
                                <Search size={22} strokeWidth={2.5} />
                            </span>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search"
                                className="ig-input pl-14 h-14 text-lg font-medium shadow-sm hover:shadow-md focus:shadow-lg transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        {loading ? (
                            <div className="flex flex-col gap-4 px-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="flex items-center gap-4 animate-pulse">
                                        <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)]" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-[var(--surface)] w-1/3 rounded-full" />
                                            <div className="h-3 bg-[var(--surface)] w-1/2 rounded-full opacity-60" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {results.map((user) => (
                                    <SuggestionCard key={user._id} user={user} />
                                ))}
                                {query && results.length === 0 && !loading && (
                                    <div className="text-center py-32 animate-in fade-in zoom-in duration-500">
                                        <div className="w-20 h-20 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Search size={32} className="text-[var(--secondary)]" />
                                        </div>
                                        <p className="text-[var(--secondary)] font-bold text-lg">No results found</p>
                                        <p className="text-[var(--secondary)] opacity-60 text-sm mt-1">Try a different username or name.</p>
                                    </div>
                                )}
                                {!query && !loading && (
                                    <div className="text-center py-32 opacity-40">
                                        <p className="text-[var(--secondary)] font-black text-xl tracking-tighter uppercase">Recent searches</p>
                                        <p className="text-sm font-medium mt-2">No recent searches.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
