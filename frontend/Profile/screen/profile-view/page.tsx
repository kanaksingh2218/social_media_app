"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import ProfileHeader from '../../component/ProfileHeader';
import HighlightModal from '../../component/HighlightModal';
import ProfileTabs from '../../component/ProfileTabs';
import PostGrid from '../../component/PostGrid';
import ProfileSkeleton from '../../component/ProfileSkeleton';
import PostDetailModal from '../../component/PostDetailModal';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

import { Plus, PlaySquare, Bookmark, User as UserIcon } from 'lucide-react';
import { getImageUrl } from '@/shared/utils/image.util';

export default function ProfileViewPage() {
    const { userIdOrUsername } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [highlights, setHighlights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [fetchError, setFetchError] = useState<any>(null);
    const lastFetchedId = React.useRef<string | null>(null);

    const fetchProfileData = async () => {
        if (!userIdOrUsername) {
            console.warn('fetchProfileData called without userIdOrUsername');
            return;
        }

        // Guard against multiple simultaneous fetches for the same user
        if (loading && lastFetchedId.current === userIdOrUsername) return;
        lastFetchedId.current = userIdOrUsername as string;

        setLoading(true);
        setFetchError(null);
        try {
            console.log(`[DEBUG] Fetching profile for: ${userIdOrUsername}`);
            // Fetch profile - critical
            const profileRes = await api.get(`/profile/${userIdOrUsername}`);
            setUser(profileRes.data);

            // Fetch posts and highlights in parallel
            const [postsRes, highlightsRes] = await Promise.allSettled([
                api.get(`/posts/user/${userIdOrUsername}`),
                api.get(`/highlights/user/${userIdOrUsername}`)
            ]);

            if (postsRes.status === 'fulfilled') setPosts(postsRes.value.data);
            if (highlightsRes.status === 'fulfilled') setHighlights(highlightsRes.value.data);

        } catch (err: any) {
            const errorInfo = {
                message: err.message || 'Unknown error',
                status: err.response?.status,
                data: err.response?.data,
                url: err.config?.url,
                stack: err.stack,
                code: err.code
            };
            console.error('Profile fetch failed detailed:', errorInfo);
            setFetchError(errorInfo);
            setUser(null);
            // Reset lastFetchedId on error to allow retry
            lastFetchedId.current = null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userIdOrUsername) fetchProfileData();
    }, [userIdOrUsername]);

    if (loading) return (
        <Layout>
            <ProfileSkeleton />
        </Layout>
    );

    if (!user && !loading) return (
        <Layout>
            <div className="text-center py-20 px-4">
                <h2 className="text-2xl font-black tracking-tight mb-2">User not found</h2>
                <p className="text-[var(--secondary)] font-medium max-w-xs mx-auto mb-4">
                    The link you followed may be broken, or the account may have been removed.
                </p>
                <div className="text-xs opacity-50 font-mono space-y-2 mt-10 text-left bg-[#1a1a1a] p-4 rounded-lg max-w-lg mx-auto overflow-auto">
                    <div>Searching for: <span className="text-white">{userIdOrUsername}</span></div>
                    {/* @ts-ignore */}
                    {fetchError && (
                        <>
                            {/* @ts-ignore */}
                            <div className="text-red-400">Error: {fetchError.message}</div>
                            {/* @ts-ignore */}
                            {fetchError.data?.message && <div className="text-red-400">Server Message: {fetchError.data.message}</div>}
                            {/* @ts-ignore */}
                            {fetchError.data?.stack && <pre className="text-[10px] mt-2 opacity-30">{fetchError.data.stack}</pre>}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );

    const currentId = currentUser?.id || currentUser?._id;
    const profileId = user?.id || user?._id;
    const isOwnProfile = !!(currentId && profileId && currentId.toString() === profileId.toString());

    return (
        <Layout>
            <div className="max-w-[935px] mx-auto pb-10">
                {/* Header Section */}
                <ProfileHeader
                    user={user}
                    isOwnProfile={isOwnProfile}
                    postsCount={posts.length}
                    followersCount={user.followers?.length || 0}
                    followingCount={user.following?.length || 0}
                    onRefresh={fetchProfileData}
                />

                {/* Highlights Section */}
                <div className="flex items-center gap-4 md:gap-12 px-4 md:px-12 py-4 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
                    {highlights.map(highlight => (
                        <div key={highlight._id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer active:scale-95 transition-transform">
                            <div className="w-14 h-14 md:w-[77px] md:h-[77px] rounded-full border border-[var(--border)] p-[3px] bg-black">
                                <div className="w-full h-full rounded-full bg-[#1a1a1a] overflow-hidden border border-white/10">
                                    <img
                                        src={getImageUrl(highlight.coverImage || highlight.posts[0]?.images[0])}
                                        className="w-full h-full object-cover"
                                        alt={highlight.title}
                                    />
                                </div>
                            </div>
                            <span className="text-[11px] md:text-[12px] font-medium truncate w-14 md:w-20 text-center opacity-90">{highlight.title}</span>
                        </div>
                    ))}

                    {isOwnProfile && (
                        <div
                            onClick={() => setIsHighlightModalOpen(true)}
                            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="w-14 h-14 md:w-[77px] md:h-[77px] rounded-full border border-[var(--border)] p-[3px] bg-black">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-white/20 group-hover:bg-white/5 transition-colors">
                                    <Plus size={28} className="opacity-40" strokeWidth={1} />
                                </div>
                            </div>
                            <span className="text-[11px] md:text-[12px] font-medium">New</span>
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

                {/* Tabs & Post Grid */}
                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="mt-0 px-[1px] md:px-0">
                    {activeTab === 'posts' && (
                        <PostGrid
                            posts={posts}
                            getImageUrl={getImageUrl}
                            onPostClick={(post) => setSelectedPost(post)}
                        />
                    )}
                    {activeTab === 'reels' && (
                        <div className="text-center py-20 opacity-50">
                            <PlaySquare size={48} className="mx-auto mb-4" strokeWidth={1} />
                            <h2 className="text-2xl font-bold">No Reels Yet</h2>
                        </div>
                    )}
                    {activeTab === 'saved' && (
                        <div className="text-center py-20 opacity-50">
                            <Bookmark size={48} className="mx-auto mb-4" strokeWidth={1} />
                            <h2 className="text-2xl font-bold">No Saved Posts</h2>
                        </div>
                    )}
                    {activeTab === 'tagged' && (
                        <div className="text-center py-20 opacity-50">
                            <UserIcon size={48} className="mx-auto mb-4" strokeWidth={1} />
                            <h2 className="text-2xl font-bold">No Tagged Posts</h2>
                        </div>
                    )}
                </div>

                {/* Post Detail Modal */}
                <PostDetailModal
                    isOpen={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                    post={selectedPost}
                    onDelete={(postId) => {
                        setPosts(prev => prev.filter(p => p._id !== postId));
                        // Update cache/parent if needed, specifically profile counts might need refresh
                        // For now we just remove from local state
                        fetchProfileData(); // Refresh to update counts
                    }}
                    onUpdate={(updatedPost) => {
                        setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
                        setSelectedPost(updatedPost);
                    }}
                />
            </div>
        </Layout>
    );
}
