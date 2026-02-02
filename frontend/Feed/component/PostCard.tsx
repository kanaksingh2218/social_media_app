"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import { Heart, MessageCircle, Send, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import CommentSection from './CommentSection';
import { usePostLike } from '@/shared/hooks/usePostLike';
import CreatePostModal from './CreatePostModal';
import { getImageUrl } from '@/shared/utils/image.util';

export default function PostCard({ post, onDelete, onUpdate }: { post: any, onDelete?: (id: string) => void, onUpdate?: (post: any) => void }) {
    const { user: currentUser } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { liked, likeCount, toggleLike } = usePostLike({
        postId: post._id,
        initialLiked: post.likes?.includes(currentUser?.id),
        initialCount: post.likes?.length || 0
    });

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (post.images && currentImageIndex < post.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/delete/${post._id}`);
            if (onDelete) onDelete(post._id);
            setShowMenu(false);
        } catch (err: any) {
            console.error('Delete failed:', err);
            alert('Failed to delete post: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 84600)}d`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(url);
        setShowMenu(false);
        alert('Link copied to clipboard!');
    };

    return (
        <article className="border-b border-[var(--border)] pb-8 mb-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <Link href={`/profile/${post.author?._id || post.author?.id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 ig-avatar-ring group-hover:scale-105">
                        <div className="ig-avatar-inner border-2">
                            {post.author?.profilePicture ? (
                                <img src={getImageUrl(post.author.profilePicture)} alt={post.author.username} className="w-full h-full object-cover" />
                            ) : (
                                post.author?.username?.[0]?.toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm tracking-tight hover:text-[var(--secondary)] transition-colors">
                            {post.author?.username || "user"}
                        </span>
                        <span className="text-[var(--secondary)] text-sm">•</span>
                        <span className="text-[var(--secondary)] text-xs font-medium">
                            {formatRelativeTime(post.createdAt)}
                        </span>
                    </div>
                </Link>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 opacity-60 hover:opacity-100 transition-all"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex flex-col">
                                <button className="px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors border-b border-[var(--border)]">Go to post</button>
                                <button onClick={handleCopyLink} className="px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors border-b border-[var(--border)]">Copy link</button>
                                {currentUser?.id === (post.author?._id || post.author?.id) && (
                                    <>
                                        <button
                                            onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                                            className="px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors border-b border-[var(--border)]"
                                        >
                                            Edit
                                        </button>
                                        <button onClick={handleDelete} className="px-4 py-3 text-sm text-left text-red-500 hover:bg-red-500/10 transition-colors">Delete</button>
                                    </>
                                )}
                                <button onClick={() => setShowMenu(false)} className="px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content / Image */}
            <div className={`bg-[#000] relative w-full flex items-center justify-center overflow-hidden ${post.images && post.images.length > 0 ? "aspect-square" : "min-h-[200px]"}`}>
                {post.images && post.images.length > 0 ? (
                    <>
                        <img
                            src={getImageUrl(post.images[currentImageIndex])}
                            alt={`Post content ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                        />

                        {/* Carousel Controls */}
                        {post.images.length > 1 && (
                            <>
                                {currentImageIndex > 0 && (
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}

                                {currentImageIndex < post.images.length - 1 && (
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                )}

                                {/* Dots Indicator */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/30 backdrop-blur-sm rounded-full">
                                    {post.images.map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`rounded-full transition-all ${idx === currentImageIndex
                                                ? "w-2 h-2 bg-white"
                                                : "w-1.5 h-1.5 bg-white/50"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="p-12 text-center italic text-lg font-light text-white/80 leading-relaxed max-w-[80%]">
                        "{post.content}"
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-5">
                        <button onClick={toggleLike} className={`transition-all active:scale-150 ${liked ? "text-red-500" : "hover:text-[var(--secondary)]"}`}>
                            <Heart size={28} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
                        </button>
                        <button onClick={() => setShowComments(!showComments)} className="hover:text-[var(--secondary)] transition-all active:scale-125">
                            <MessageCircle size={28} />
                        </button>
                        <button className="hover:text-[var(--secondary)] transition-all active:scale-125">
                            <Send size={28} />
                        </button>
                    </div>
                    <button className="hover:text-[var(--primary)] transition-all">
                        <svg aria-label="Save" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Save</title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                    </button>
                </div>

                <div className="text-sm font-bold mb-2 tracking-tight">
                    {likeCount.toLocaleString()} likes
                </div>

                <div className="text-sm leading-relaxed">
                    <span className="font-bold mr-2">{post.author?.username}</span>
                    <span className="text-[var(--foreground)] opacity-90">{post.content}</span>
                </div>

                {post.comments?.length > 0 && !showComments && (
                    <button
                        onClick={() => setShowComments(true)}
                        className="text-sm text-[var(--secondary)] mt-2 hover:underline transition-all"
                    >
                        View all {post.comments.length} comments
                    </button>
                )}

                <div className="text-[10px] text-[var(--secondary)] font-bold uppercase mt-3 tracking-widest opacity-60">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            {showComments && (
                <div className="border-t border-[var(--border)] px-4 py-4 bg-[var(--surface)] animate-in fade-in slide-in-from-top-2 duration-300">
                    <CommentSection postId={post._id} />
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <CreatePostModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    postToEdit={post}
                    onPostUpdated={onUpdate}
                />
            )}
        </article>
    );
}
