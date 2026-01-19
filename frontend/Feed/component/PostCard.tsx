"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api.service';
import CommentSection from './CommentSection';

export default function PostCard({ post }: { post: any }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/like/${post._id}`);
            if (res.data.message === 'Post liked') {
                setLikeCount(likeCount + 1);
                setLiked(true);
            } else {
                setLikeCount(likeCount - 1);
                setLiked(false);
            }
        } catch (err) {
            console.error('Like failed', err);
        }
    };

    return (
        <article className="ig-card mb-4">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <Link href={`/profile/${post.author?._id || post.author?.id}`} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold text-sm">
                        {post.author?.profilePicture ? (
                            <img src={post.author.profilePicture} alt={post.author.username} className="w-full h-full object-cover" />
                        ) : (
                            post.author?.username?.[0]?.toUpperCase()
                        )}
                    </div>
                    <span className="font-semibold text-sm hover:text-[var(--secondary)] transition-colors">
                        {post.author?.username}
                    </span>
                </Link>
                <button className="text-xl font-bold pb-2 opacity-60 hover:opacity-100">...</button>
            </div>

            {/* Content / Image */}
            <div className="bg-[var(--surface)] relative aspect-square md:aspect-auto min-h-[300px] flex items-center justify-center border-y border-[var(--border)] overflow-hidden">
                {post.images && post.images.length > 0 ? (
                    <img src={post.images[0]} alt="Post content" className="w-full h-full object-cover" />
                ) : (
                    <div className="p-10 text-center italic text-[var(--secondary)]">
                        {post.content}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-3">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={handleLike} className={`text-2xl transition-transform active:scale-125 ${liked ? "text-red-500" : "hover:opacity-60"}`}>
                        {liked ? "❤️" : "♡"}
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="text-2xl hover:opacity-60">
                        💬
                    </button>
                    <button className="text-2xl hover:opacity-60">
                        ✈️
                    </button>
                </div>

                <div className="text-sm font-semibold mb-2">
                    {likeCount.toLocaleString()} likes
                </div>

                <div className="text-sm">
                    <span className="font-semibold mr-2">{post.author?.username}</span>
                    <span className="text-[var(--foreground)]">{post.content}</span>
                </div>

                {post.comments?.length > 0 && !showComments && (
                    <button
                        onClick={() => setShowComments(true)}
                        className="text-sm text-[var(--secondary)] mt-1 block"
                    >
                        View all {post.comments.length} comments
                    </button>
                )}

                <div className="text-[10px] text-[var(--secondary)] uppercase mt-2 tracking-wider">
                    {new Date(post.createdAt).toLocaleDateString()}
                </div>
            </div>

            {showComments && (
                <div className="border-t border-[var(--border)] px-3 py-2 bg-[var(--surface)]">
                    <CommentSection postId={post._id} />
                </div>
            )}
        </article>
    );
}
