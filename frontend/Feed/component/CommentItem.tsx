import React from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

interface CommentItemProps {
    comment: any;
    currentUserId?: string;
    onDelete: (id: string, isAuthor: boolean) => void;
}

export default function CommentItem({ comment, currentUserId, onDelete }: CommentItemProps) {
    const isAuthor = currentUserId === (comment.author?._id || comment.author?.id);
    // Note: To check if current user is post author, we'd need that prop passed down too.
    // For now, let's assume the parent handles the permission logic or we just check comment author.
    // The previous code checked: (user?.id === comment.author?._id || user?.id === comment.author?.id)

    return (
        <div className="flex gap-3 text-sm group animate-in fade-in slide-in-from-top-1 duration-200">
            <Link href={`/profile/${comment.author?._id || comment.author?.id}`} className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold text-[10px]">
                    {comment.author?.profilePicture ? (
                        <img src={comment.author.profilePicture} alt={comment.author.username} className="w-full h-full object-cover" />
                    ) : (
                        comment.author?.username?.[0]?.toUpperCase()
                    )}
                </div>
            </Link>
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                    <p className="leading-tight">
                        <Link href={`/profile/${comment.author?._id || comment.author?.id}`} className="font-semibold hover:text-[var(--secondary)] transition-colors mr-2">
                            {comment.author?.username}
                        </Link>
                        <span className="text-[var(--foreground)]">{comment.content}</span>
                    </p>
                    {isAuthor && (
                        <button
                            onClick={() => onDelete(comment._id, isAuthor)}
                            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all p-1 text-[var(--danger)]"
                            title="Delete comment"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
                <div className="flex gap-3 mt-1 text-[10px] text-[var(--secondary)] font-medium">
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <button className="hover:text-[var(--foreground)]">Reply</button>
                </div>
            </div>
        </div>
    );
}
