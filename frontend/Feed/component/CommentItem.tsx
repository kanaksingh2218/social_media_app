import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import api from '@/services/api.service';

interface CommentItemProps {
    comment: any;
    currentUserId?: string;
    onDelete: (id: string, isAuthor: boolean) => void;
    onReply: (id: string, username: string) => void;
    postId: string;
}

export default function CommentItem({ comment, currentUserId, onDelete, onReply, postId }: CommentItemProps) {
    const isAuthor = currentUserId === (comment.author?._id || comment.author?.id);
    const [replies, setReplies] = useState<any[]>([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const handleToggleReplies = async () => {
        if (showReplies) {
            setShowReplies(false);
            return;
        }

        if (replies.length > 0) {
            setShowReplies(true);
            return;
        }

        setLoadingReplies(true);
        try {
            const res = await api.get(`/posts/comments/replies/${comment._id}`);
            setReplies(res.data);
            setShowReplies(true);
        } catch (err) {
            console.error('Failed to load replies', err);
        } finally {
            setLoadingReplies(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex gap-3 text-sm group">
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
                    <div className="flex gap-3 mt-1 text-[10px] text-[var(--secondary)] font-medium items-center">
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        {comment.replyCount > 0 && (
                            <span>{comment.replyCount} repl{comment.replyCount !== 1 ? 'y' : 'ies'}</span>
                        )}
                        <button onClick={() => onReply(comment._id, comment.author?.username)} className="hover:text-[var(--foreground)]">Reply</button>
                    </div>

                    {/* View Replies Button */}
                    {comment.replyCount > 0 && (
                        <button
                            onClick={handleToggleReplies}
                            className="flex items-center gap-2 mt-2 text-xs text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors w-fit"
                        >
                            <div className="w-6 h-[1px] bg-[var(--border)]"></div>
                            {loadingReplies ? 'Loading...' : showReplies ? 'Hide replies' : `View ${comment.replyCount} repl${comment.replyCount > 1 ? 'ies' : 'y'}`}
                        </button>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {showReplies && (
                <div className="pl-11 space-y-3">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            currentUserId={currentUserId}
                            onDelete={onDelete}
                            onReply={onReply}
                            postId={postId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
