"use client";
import React, { useState } from 'react';
import api from '@/services/api.service';

export default function CommentInput({ postId, onCommentAdded }: { postId: string, onCommentAdded: (comment: any) => void }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);
        try {
            const res = await api.post(`/posts/comment/${postId}`, { content });
            setContent('');
            onCommentAdded(res.data);
        } catch (err) {
            console.error('Failed to add comment', err);
            alert('Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--border)] pt-3 mt-2">
            <span className="text-xl opacity-60">😀</span>
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm bg-transparent focus:outline-none"
            />
            <button
                type="submit"
                disabled={loading || !content.trim()}
                className="text-[var(--primary)] font-semibold text-sm disabled:opacity-30 hover:text-blue-700 transition-colors"
            >
                {loading ? '...' : 'Post'}
            </button>
        </form>
    );
}
