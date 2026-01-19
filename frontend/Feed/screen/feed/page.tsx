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
            <div className="max-w-[470px] mx-auto flex flex-col gap-4">
                <div className="mb-6">
                    <CreatePost onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
                </div>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="ig-card h-[400px] animate-pulse bg-[var(--surface)]" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 pb-20">
                        {posts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                        {posts.length === 0 && (
                            <div className="text-center py-20 px-4">
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
