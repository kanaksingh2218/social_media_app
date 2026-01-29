"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import CreatePost from '@/Feed/component/CreatePost';
import PostCard from '@/Feed/component/PostCard';

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts/feed');
            setPosts(res.data);
        } catch (err) {
            console.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto pt-8 px-4">
                <div className="mb-8">
                    <CreatePost onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
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
                                onDelete={(id) => setPosts(posts.filter(p => p._id !== id))}
                            />
                        ))}
                        {posts.length === 0 && (
                            <div className="text-center py-20">
                                <span className="text-4xl mb-4 block">📸</span>
                                <p className="text-[var(--secondary)] font-medium">Your feed is empty. Follow some people!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
