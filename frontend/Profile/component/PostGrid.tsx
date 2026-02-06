"use client";
import React from 'react';
import { Camera, Heart, MessageCircle } from 'lucide-react';

interface PostGridProps {
    posts: any[];
    getImageUrl: (path: string | null | undefined) => string | undefined;
    onPostClick?: (post: any) => void;
}

export default function PostGrid({ posts, getImageUrl, onPostClick }: PostGridProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-20 md:py-32 px-4">
                <div className="w-16 h-16 md:w-24 md:h-24 border-2 border-[var(--foreground)] rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                    <Camera size={32} className="md:w-11 md:h-11" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-2">No Posts Yet</h2>
                <p className="text-[var(--secondary)] font-medium opacity-60 text-sm md:text-base">When you share photos, they will appear here.</p>
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
                        <img
                            src={getImageUrl(post.images[0])}
                            alt="Post"
                            loading="lazy"
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-[10px] md:text-sm text-center font-light italic text-[var(--secondary)]">
                            "{post.content?.slice(0, 30)}..."
                        </div>
                    )}

                    {/* Hover Stats Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-7 text-white">
                        <div className="flex items-center gap-1 md:gap-2">
                            <Heart size={18} fill="white" className="md:w-5 md:h-5" />
                            <span className="text-sm md:text-lg font-bold">{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <MessageCircle size={18} fill="white" className="md:w-5 md:h-5" />
                            <span className="text-sm md:text-lg font-bold">{post.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
