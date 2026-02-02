import React, { useState, useRef } from 'react';
import api from '@/services/api.service';
import EmojiPicker from '@/shared/components/EmojiPicker';
import { Smile } from 'lucide-react';

export default function CommentInput({ onCommentSubmit }: { onCommentSubmit: (content: string) => Promise<void> }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await onCommentSubmit(content);
            setContent('');
            setShowEmojiPicker(false);
        } finally {
            setLoading(false);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const newContent = content.substring(0, start) + emoji + content.substring(end);
        setContent(newContent);

        // Set cursor position after emoji
        setTimeout(() => {
            input.selectionStart = input.selectionEnd = start + emoji.length;
            input.focus();
        }, 0);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--border)] pt-3 mt-2 relative">
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 opacity-60 hover:opacity-100 transition-all text-xl"
                    title="Add emoji"
                >
                    <Smile size={20} />
                </button>
                {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-0 z-50">
                        <EmojiPicker
                            onEmojiSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
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
