"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import SuggestionCard from '@/Friends/component/SuggestionCard';
import PostGrid from '@/Profile/component/PostGrid';
import { getImageUrl } from '@/shared/utils/image.util';
import { Search, X, Clock } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ type: 'users' | 'posts', data: any[] }>({ type: 'users', data: [] });
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/search/history');
            setRecentSearches(res.data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        }
    };

    const addToHistory = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        // Optimistic update
        if (!recentSearches.includes(searchQuery)) {
            setRecentSearches(prev => [searchQuery, ...prev]);
        }
        try {
            await api.post('/search/history', { query: searchQuery });
        } catch (error) {
            console.error('Failed to add to history', error);
        }
    };

    const clearHistory = async () => {
        if (!confirm('Clear search history?')) return;
        setRecentSearches([]);
        try {
            await api.delete('/search/history');
        } catch (error) {
            console.error('Failed to clear history', error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                try {
                    const res = await api.get(`/search?query=${query}`);
                    if (res.data && res.data.type) {
                        setResults(res.data);
                    } else {
                        setResults({ type: 'users', data: res.data || [] });
                    }

                    if (res.data.data?.length > 0 || (Array.isArray(res.data) && res.data.length > 0)) {
                        addToHistory(query.trim());
                    }
                } catch (err) {
                    console.error('Search failed', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults({ type: 'users', data: [] });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <Layout>
            <div className="max-w-[1000px] mx-auto py-12">
                <div className="max-w-[600px] mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black mb-8 tracking-tighter">Search</h1>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--secondary)] group-focus-within:text-[var(--primary)] transition-all duration-300">
                                <Search size={22} strokeWidth={2.5} />
                            </span>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search users or #hashtags"
                                className="ig-input pl-14 h-14 text-lg font-medium shadow-sm hover:shadow-md focus:shadow-lg transition-all"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--surface-hover)] rounded-full text-[var(--secondary)]"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 min-h-[400px]">
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
                        ) : query ? (
                            <div className="space-y-1">
                                {results.type === 'posts' ? (
                                    <div className="mt-4">
                                        <p className="mb-4 text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Posts matching "{query}"</p>
                                        <PostGrid posts={results.data} getImageUrl={getImageUrl} />
                                    </div>
                                ) : (
                                    <>
                                        {results.data.map((user) => (
                                            <SuggestionCard key={user._id || user.id} user={user} />
                                        ))}
                                    </>
                                )}

                                {results.data.length === 0 && !loading && (
                                    <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                                        <div className="w-20 h-20 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Search size={32} className="text-[var(--secondary)]" />
                                        </div>
                                        <p className="text-[var(--secondary)] font-bold text-lg">No results found</p>
                                        <p className="text-[var(--secondary)] opacity-60 text-sm mt-1">Try a different term.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-4">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <p className="text-[var(--foreground)] font-bold text-base">Recent</p>
                                    {recentSearches.length > 0 && (
                                        <button onClick={clearHistory} className="text-[var(--primary)] text-sm font-semibold hover:opacity-80">
                                            Clear all
                                        </button>
                                    )}
                                </div>
                                {recentSearches.length > 0 ? (
                                    <div className="space-y-0">
                                        {recentSearches.map((term, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setQuery(term)}
                                                className="w-full flex items-center justify-between py-3 px-4 hover:bg-[var(--surface)] rounded-xl transition-colors group text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--foreground)]">
                                                        <Clock size={20} />
                                                    </div>
                                                    <span className="font-medium">{term}</span>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={16} className="text-[var(--secondary)]" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 opacity-40">
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
