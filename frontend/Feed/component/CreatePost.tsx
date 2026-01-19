"use client";
import { useState, useRef } from 'react';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import EmojiPicker from '@/shared/components/EmojiPicker';

export default function CreatePost({ onPostCreated }: { onPostCreated?: (post: any) => void }) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length + selectedImages.length > 10) {
            alert('Maximum 10 images allowed per post');
            return;
        }

        // Validate file sizes (5MB max per image)
        const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert('Some images are too large. Maximum size is 5MB per image.');
            return;
        }

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
        setSelectedImages([...selectedImages, ...files]);
    };

    const removeImage = (index: number) => {
        // Revoke the preview URL to free memory
        URL.revokeObjectURL(imagePreviews[index]);

        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    const handleEmojiSelect = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + emoji + content.substring(end);
        setContent(newContent);

        // Set cursor position after emoji
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && selectedImages.length === 0) {
            alert('Please add some content or images');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            const res = await api.post('/posts/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Clear form
            setContent('');
            setSelectedImages([]);
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
            setImagePreviews([]);

            if (onPostCreated) onPostCreated(res.data.post || res.data);
        } catch (err) {
            console.error('Failed to create post', err);
            alert('Failed to post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ig-card p-4 mb-6">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        user?.username?.[0]?.toUpperCase()
                    )}
                </div>
                <form onSubmit={handleSubmit} className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full p-2 text-sm focus:outline-none resize-none bg-transparent"
                        rows={2}
                    />

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 my-3">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
                                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--border)]">
                        <div className="flex gap-4 text-xl opacity-60 relative">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            {/* Image upload button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="hover:opacity-100 transition-opacity"
                                title="Add photos"
                            >
                                🖼️
                            </button>

                            {/* Location button - placeholder for future */}
                            <button
                                type="button"
                                className="hover:opacity-100 transition-opacity"
                                title="Add location (coming soon)"
                                onClick={() => alert('Location feature coming soon!')}
                            >
                                📍
                            </button>

                            {/* Emoji picker button */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="hover:opacity-100 transition-opacity"
                                    title="Add emoji"
                                >
                                    😀
                                </button>
                                {showEmojiPicker && (
                                    <EmojiPicker
                                        onEmojiSelect={handleEmojiSelect}
                                        onClose={() => setShowEmojiPicker(false)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedImages.length > 0 && (
                                <span className="text-xs text-[var(--secondary)]">
                                    {selectedImages.length}/10 images
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={loading || (!content.trim() && selectedImages.length === 0)}
                                className="text-[var(--primary)] font-semibold text-sm disabled:opacity-30 hover:opacity-80 transition-opacity"
                            >
                                {loading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
