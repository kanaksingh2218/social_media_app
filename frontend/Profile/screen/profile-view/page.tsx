"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import ProfileHeader from '../../component/ProfileHeader';
import HighlightModal from '../../component/HighlightModal';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

import { Heart, MessageCircle, Camera, Grid, PlaySquare, Bookmark, User, Plus } from 'lucide-react';

export default function ProfileViewPage() {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [highlights, setHighlights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    };

    const fetchProfileData = async () => {
        try {
            // Fetch profile - critical
            try {
                const profileRes = await api.get(`/profile/${userId}`);
                setUser(profileRes.data);
            } catch (err: any) {
                console.error('Profile fetch failed:', err.response?.data || err.message);
                // If profile fails, we can't show much, but let's keep going for debugging
            }

            // Fetch posts - non-blocking but important
            try {
                const postsRes = await api.get(`/posts/user/${userId}`);
                setPosts(postsRes.data);
            } catch (err: any) {
                console.error('Posts fetch failed:', err.response?.data || err.message);
            }

            // Fetch highlights - new feature, likely culprit
            try {
                const highlightsRes = await api.get(`/highlights/user/${userId}`);
                setHighlights(highlightsRes.data);
            } catch (err: any) {
                console.error('Highlights fetch failed:', err.response?.data || err.message);
                setHighlights([]); // Fallback to empty
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchProfileData();
    }, [userId]);

    if (loading) return (
        <Layout>
            <div className="animate-pulse px-4">
                <div className="h-48 bg-[#121212] rounded-full w-48 mb-8 mx-auto md:mx-0" />
                <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <div key={n} className="aspect-square bg-[#121212]" />
                    ))}
                </div>
            </div>
        </Layout>
    );

    if (!user) return (
        <Layout>
            <div className="text-center py-20 px-4">
                <h2 className="text-xl font-bold">User not found</h2>
                <p className="text-[var(--secondary)]">The link you followed may be broken, or the account may have been removed.</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-[935px] mx-auto">
                {/* Header Section */}
                <div className="px-0 md:px-4">
                    <ProfileHeader
                        user={user}
                        isOwnProfile={currentUser?.id === (user.id || user._id)}
                        postsCount={posts.length}
                        followersCount={user.followers?.length || 0}
                        followingCount={user.following?.length || 0}
                        onRefresh={fetchProfileData}
                    />
                </div>

                {/* Highlights Section */}
                <div className="flex items-center gap-4 md:gap-12 px-4 md:px-12 py-4 md:py-6 overflow-x-auto no-scrollbar mb-2 md:mb-4 scroll-smooth">
                    {highlights.map(highlight => (
                        <div key={highlight._id} className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer transition-transform active:scale-95">
                            <div className="w-14 h-14 md:w-[77px] md:h-[77px] rounded-full border border-[var(--border)] p-[3px] bg-black">
                                <div className="w-full h-full rounded-full bg-[#1a1a1a] overflow-hidden">
                                    <img
                                        src={getImageUrl(highlight.coverImage || highlight.posts[0]?.images[0])}
                                        className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                                        alt={highlight.title}
                                    />
                                </div>
                            </div>
                            <span className="text-[11px] md:text-[12px] font-medium tracking-tight truncate w-14 md:w-20 text-center">{highlight.title}</span>
                        </div>
                    ))}

                    {currentUser?.id === (user.id || user._id) && (
                        <div
                            onClick={() => setIsHighlightModalOpen(true)}
                            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer transition-transform active:scale-95"
                        >
                            <div className="w-14 h-14 md:w-[77px] md:h-[77px] rounded-full border border-[var(--border)] p-[3px] bg-black">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-white/10 group-hover:bg-white/5">
                                    <Plus size={28} className="opacity-40 group-hover:opacity-60 transition-opacity" strokeWidth={1} />
                                </div>
                            </div>
                            <span className="text-[11px] md:text-[12px] font-medium tracking-tight">New</span>
                        </div>
                    )}
                </div>

                <HighlightModal
                    isOpen={isHighlightModalOpen}
                    onClose={() => setIsHighlightModalOpen(false)}
                    userId={currentUser?.id}
                    posts={posts.filter(p => p.images && p.images.length > 0)}
                    onSuccess={fetchProfileData}
                />

                {/* Tabs Section */}
                <div className="border-t border-[var(--border)] mt-2">
                    <div className="flex justify-center gap-8 md:gap-16 text-[12px] font-bold uppercase tracking-widest px-4">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex items-center gap-2 py-3 md:py-4 -mt-[1px] transition-all ${activeTab === 'posts' ? 'border-t border-white text-white' : 'text-[var(--secondary)] opacity-50'}`}
                        >
                            <Grid size={14} className="md:w-3 md:h-3" />
                            <span className="hidden md:inline">Posts</span>
                        </button>
                        <button
                            className="flex items-center gap-2 py-3 md:py-4 -mt-[1px] text-[var(--secondary)] opacity-50 cursor-not-allowed"
                        >
                            <PlaySquare size={14} className="md:w-3 md:h-3" />
                            <span className="hidden md:inline">Reels</span>
                        </button>
                        <button
                            className="flex items-center gap-2 py-3 md:py-4 -mt-[1px] text-[var(--secondary)] opacity-50 cursor-not-allowed"
                        >
                            <Bookmark size={14} className="md:w-3 md:h-3" />
                            <span className="hidden md:inline">Saved</span>
                        </button>
                        <button
                            className="flex items-center gap-2 py-3 md:py-4 -mt-[1px] text-[var(--secondary)] opacity-50 cursor-not-allowed"
                        >
                            <User size={14} className="md:w-3 md:h-3" />
                            <span className="hidden md:inline">Tagged</span>
                        </button>
                    </div>

                    {/* Posts Grid */}
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-[1px] md:gap-[28px] pb-20">
                            {posts.map((post) => (
                                <div key={post._id} className="relative aspect-square group bg-[#121212] overflow-hidden cursor-pointer">
                                    {post.images && post.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(post.images[0])}
                                            alt="Post"
                                            className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-2 md:p-6 text-[10px] md:text-lg text-center font-light italic text-[var(--secondary)]">
                                            "{post.content.slice(0, 30)}..."
                                        </div>
                                    )}
                                    {/* Hover Stats - Desktop Only */}
                                    <div className="hidden md:flex absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-6 text-white font-bold">
                                        <div className="flex items-center gap-1.5">
                                            <Heart size={20} fill="white" />
                                            <span>{post.likes?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MessageCircle size={20} fill="white" />
                                            <span>{post.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 md:py-32 px-4">
                            <div className="w-16 h-16 md:w-24 md:h-24 border-2 border-[var(--foreground)] rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                                <Camera size={32} className="md:w-11 md:h-11" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-2">No Posts Yet</h2>
                            <p className="text-[var(--secondary)] font-medium opacity-60 text-sm md:text-base">When you share photos, they will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
