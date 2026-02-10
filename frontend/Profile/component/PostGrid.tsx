"use client";
import React from 'react';
import { Camera, Heart, MessageCircle, Layers } from 'lucide-react';

interface PostGridProps {
    posts: any[];
    getImageUrl: (path: string | null | undefined) => string | undefined;
    onPostClick?: (post: any) => void;
    loading?: boolean;
}

export default function PostGrid({ posts, getImageUrl, onPostClick, loading }: PostGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-[1px] md:gap-[4px] lg:gap-[28px] pb-20">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-square bg-[#1a1a1a] animate-pulse" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 md:py-32 px-4">
                <div className="w-16 h-16 md:w-24 md:h-24 border-2 border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                    <Camera size={32} className="md:w-11 md:h-11 text-[var(--foreground)]" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">No Posts Yet</h2>
                <p className="text-[var(--secondary)] text-sm md:text-base">When you share photos, they will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-[1px] md:gap-[4px] lg:gap-[28px] pb-20">
            {posts.map((post) => (
                <div
                    key={post._id}
                    className="relative aspect-square group bg-[#121212] overflow-hidden cursor-pointer"
                    onClick={() => onPostClick && onPostClick(post)}
                >
                    {post.images && post.images.length > 0 ? (
                        <>
                            <img
                                src={getImageUrl(post.images[0])}
                                alt="Post"
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {post.images.length > 1 && (
                                <div className="absolute top-2 right-2 text-white/90 drop-shadow-md">
                                    <Layers size={18} fill="currentColor" strokeWidth={0} className="scale-x-[-1]" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-[10px] md:text-sm text-center font-serif italic text-[var(--secondary)] bg-[#1a1a1a]">
                            <span className="line-clamp-4">"{post.content}"</span>
                        </div>
                    )}

                    {/* Hover Stats Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-7 text-white">
                        <div className="flex items-center gap-1 md:gap-2">
                            <Heart size={20} fill="white" className="md:w-6 md:h-6" strokeWidth={0} />
                            <span className="text-sm md:text-lg font-bold">{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <MessageCircle size={20} fill="white" className="md:w-6 md:h-6" strokeWidth={0} />
                            <span className="text-sm md:text-lg font-bold">{post.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
