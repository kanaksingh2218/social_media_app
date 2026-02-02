import React from 'react';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import { useAuth } from '@/context/AuthContext';
import { useComments } from '@/shared/hooks/useComments';

export default function CommentSection({ postId }: { postId: string }) {
    const { user } = useAuth();
    const {
        comments,
        loading,
        hasMore,
        loadMore,
        addComment,
        deleteComment
    } = useComments(postId);

    const handleAddComment = async (content: string) => {
        if (!user) return;
        await addComment(content, user);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        await deleteComment(commentId);
    };

    return (
        <div className="mt-2 text-sm">
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        currentUserId={user?.id || user?._id}
                        onDelete={handleDeleteComment}
                    />
                ))}

                {loading && (
                    <div className="space-y-3 mt-3">
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
                )}

                {!loading && hasMore && (
                    <button
                        onClick={loadMore}
                        className="w-full py-2 text-xs font-semibold text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors text-center mt-2"
                    >
                        Load more comments
                    </button>
                )}

                {comments.length === 0 && !loading && (
                    <div className="py-4 text-center opacity-40 italic text-xs">
                        No comments yet. Be the first to share one!
                    </div>
                )}
            </div>
            <CommentInput onCommentSubmit={handleAddComment} />
        </div>
    );
}
