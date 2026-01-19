"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import ProfileHeader from '../../component/ProfileHeader';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

export default function ProfileViewPage() {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    api.get(`/profile/${userId}`),
                    api.get(`/posts/user/${userId}`)
                ]);
                setUser(profileRes.data);
                setPosts(postsRes.data);
            } catch (err) {
                console.error('Failed to fetch profile data');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchProfileData();
    }, [userId]);

    if (loading) return (
        <Layout>
            <div className="animate-pulse">
                <div className="h-40 bg-[var(--surface)] rounded-lg mb-8" />
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="aspect-square bg-[var(--surface)]" />
                    ))}
                </div>
            </div>
        </Layout>
    );

    if (!user) return (
        <Layout>
            <div className="text-center py-20">
                <h2 className="text-xl font-bold">User not found</h2>
                <p className="text-[var(--secondary)]">The link you followed may be broken, or the account may have been removed.</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="mb-10 lg:mb-14">
                <ProfileHeader user={user} isOwnProfile={currentUser?.id === user._id} />
            </div>

            <div className="border-t border-[var(--border)] pt-4">
                <div className="flex justify-center gap-12 mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--secondary)]">
                    <span className="border-t border-[var(--foreground)] pt-3 -mt-[17px] text-[var(--foreground)]">Posts</span>
                    <span className="pt-3 -mt-[17px] cursor-not-allowed opacity-40">Reels</span>
                    <span className="pt-3 -mt-[17px] cursor-not-allowed opacity-40">Tagged</span>
                </div>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {posts.map((post) => (
                            <div key={post._id} className="relative aspect-square group bg-[var(--surface)] overflow-hidden cursor-pointer border border-[var(--border)]">
                                {post.images && post.images.length > 0 ? (
                                    <img
                                        src={post.images[0]}
                                        alt="Post"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-2 text-[10px] md:text-sm text-center italic text-[var(--secondary)]">
                                        {post.content}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                    <span className="flex items-center gap-1">❤️ {post.likes?.length || 0}</span>
                                    <span className="flex items-center gap-1">💬 {post.comments?.length || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-2 border-[var(--foreground)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📸</span>
                        </div>
                        <h2 className="text-2xl font-bold">No Posts Yet</h2>
                    </div>
                )}
            </div>
        </Layout>
    );
}
