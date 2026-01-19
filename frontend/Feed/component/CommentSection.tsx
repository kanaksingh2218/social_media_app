"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api.service';
import CommentInput from './CommentInput';

export default function CommentSection({ postId }: { postId: string }) {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/posts/comments/${postId}`);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to fetch comments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    return (
        <div className="mt-2 text-sm">
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(n => (
                            <div key={n} className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-[var(--surface)] w-1/4 rounded" />
                                    <div className="h-2 bg-[var(--surface)] w-3/4 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-3 text-sm">
                                <Link href={`/profile/${comment.author?._id || comment.author?.id}`} className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold text-[10px]">
                                        {comment.author?.profilePicture ? (
                                            <img src={comment.author.profilePicture} alt={comment.author.username} className="w-full h-full object-cover" />
                                        ) : (
                                            comment.author?.username?.[0]?.toUpperCase()
                                        )}
                                    </div>
                                </Link>
                                <div className="flex flex-col">
                                    <p className="leading-tight">
                                        <Link href={`/profile/${comment.author?._id || comment.author?.id}`} className="font-semibold hover:text-[var(--secondary)] transition-colors mr-2">
                                            {comment.author?.username}
                                        </Link>
                                        <span className="text-[var(--foreground)]">{comment.content}</span>
                                    </p>
                                    <div className="flex gap-3 mt-1 text-[10px] text-[var(--secondary)] font-medium">
                                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        <button className="hover:text-[var(--foreground)]">Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <div className="py-4 text-center opacity-40 italic text-xs">
                                No comments yet. Be the first to share one!
                            </div>
                        )}
                    </>
                )}
            </div>
            <CommentInput postId={postId} onCommentAdded={(newComment: any) => setComments([newComment, ...comments])} />
        </div>
    );
}
