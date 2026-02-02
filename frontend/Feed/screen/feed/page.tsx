"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import CreatePost from '@/Feed/component/CreatePost';
import PostCard from '@/Feed/component/PostCard';

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const observerTarget = React.useRef<HTMLDivElement>(null);

    const fetchPosts = async (pageNum: number, isInitial: boolean = false) => {
        try {
            if (isInitial) setLoading(true);
            else setIsFetchingMore(true);

            const res = await api.get('/posts/feed', {
                params: { page: pageNum, limit: 10 }
            });

            const newPosts = res.data.posts || [];
            const totalPages = res.data.totalPages;

            if (isInitial) {
                setPosts(newPosts);
            } else {
                // Filter out duplicates just in case
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p._id));
                    const uniqueNewPosts = newPosts.filter((p: any) => !existingIds.has(p._id));
                    return [...prev, ...uniqueNewPosts];
                });
            }

            setHasMore(pageNum < totalPages);
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPosts(1, true);
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !isFetchingMore) {
                    setPage(prev => {
                        const nextPage = prev + 1;
                        fetchPosts(nextPage, false);
                        return nextPage;
                    });
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, isFetchingMore]);

    const handlePostCreated = (newPost: any) => {
        setPosts([newPost, ...posts]);
    };

    const handleUpdatePost = (updatedPost: any) => {
        setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handleDeletePost = (postId: string) => {
        setPosts(prev => prev.filter(p => p._id !== postId));
    };

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto pt-8 px-4">
                <div className="mb-8">
                    <CreatePost onPostCreated={handlePostCreated} />
                </div>

                {loading ? (
                    <div className="flex flex-col gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-[400px] animate-pulse bg-[var(--border)] rounded-sm" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col pb-20">
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onDelete={handleDeletePost}
                                onUpdate={handleUpdatePost}
                            />
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-20">
                                <span className="text-4xl mb-4 block">📸</span>
                                <p className="text-[var(--secondary)] font-medium">Your feed is empty. Follow some people!</p>
                            </div>
                        )}

                        {/* Intersection Observer Target */}
                        <div ref={observerTarget} className="h-10 flex items-center justify-center mt-4">
                            {isFetchingMore && (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                            )}
                            {!hasMore && posts.length > 0 && (
                                <p className="text-sm text-[var(--secondary)]">No more posts to show</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
