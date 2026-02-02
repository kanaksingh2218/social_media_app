"use client";
import React, { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { highlightService } from '@/services/highlight.service';
import { getImageUrl } from '@/shared/utils/image.util';

interface HighlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    posts: any[];
    userId: string;
    onSuccess: () => void;
    editHighlight?: any;
}

export default function HighlightModal({ isOpen, onClose, posts, userId, onSuccess, editHighlight }: HighlightModalProps) {
    const [step, setStep] = useState(1); // 1: Select Posts, 2: Name Highlight
    const [selectedPosts, setSelectedPosts] = useState<string[]>(editHighlight?.posts.map((p: any) => p._id) || []);
    const [title, setTitle] = useState(editHighlight?.title || '');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const togglePost = (postId: string) => {
        setSelectedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    const handleNext = () => {
        if (selectedPosts.length > 0) setStep(2);
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;
        setLoading(true);
        console.log('Saving highlight:', { title, selectedPosts });
        try {
            if (editHighlight) {
                await highlightService.updateHighlight(editHighlight._id, { title, posts: selectedPosts });
            } else {
                const res = await highlightService.createHighlight({ title, posts: selectedPosts });
                console.log('Highlight created:', res);
            }
            alert('Highlight saved successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Highlight save failed', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
            alert(`Failed to save highlight: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative bg-[#262626] w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        {step === 2 && (
                            <button onClick={() => setStep(1)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <h2 className="font-bold">{step === 1 ? 'New Highlight' : 'Title'}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {step === 1 ? (
                    <>
                        <div className="grid grid-cols-3 gap-1 h-[400px] overflow-y-auto p-1">
                            {posts.map(post => (
                                <div
                                    key={post._id}
                                    onClick={() => togglePost(post._id)}
                                    className="relative aspect-square cursor-pointer active:scale-95 transition-transform"
                                >
                                    <img
                                        src={getImageUrl(post.images[0])}
                                        className={`w-full h-full object-cover transition-opacity ${selectedPosts.includes(post._id) ? 'opacity-50' : 'opacity-100'}`}
                                        alt=""
                                    />
                                    {selectedPosts.includes(post._id) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-6 rounded-full bg-[var(--primary)] border-2 border-white flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleNext}
                                disabled={selectedPosts.length === 0}
                                className="w-full py-2 bg-[var(--primary)] text-white rounded-lg font-bold disabled:opacity-50 hover:brightness-110"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-6 space-y-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-[#1a1a1a] overflow-hidden border border-white/10">
                                {selectedPosts.length > 0 && (
                                    <img
                                        src={getImageUrl(posts.find(p => p._id === selectedPosts[0])?.images[0])}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Highlight Name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 p-2 text-center text-lg focus:outline-none focus:border-[var(--primary)] transition-colors"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !title.trim()}
                            className="w-full py-2 bg-[var(--primary)] text-white rounded-lg font-bold disabled:opacity-50 hover:brightness-110"
                        >
                            {loading ? 'Saving...' : 'Done'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
