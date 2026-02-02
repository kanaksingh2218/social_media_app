"use client";
import { X } from 'lucide-react';
import PostCard from '@/Feed/component/PostCard';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
    onDelete?: (postId: string) => void;
    onUpdate?: (updatedPost: any) => void;
}

export default function PostDetailModal({ isOpen, onClose, post, onDelete, onUpdate }: PostDetailModalProps) {
    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Close handle for outside click */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-[var(--background)] rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 hide-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                    <X size={20} />
                </button>

                <PostCard
                    post={post}
                    onDelete={(id) => {
                        if (onDelete) onDelete(id);
                        onClose();
                    }}
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
}
