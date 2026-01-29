"use client";
import { useState, useRef } from 'react';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import EmojiPicker from '@/shared/components/EmojiPicker';
import { Image as ImageIcon, MapPin, Smile, X } from 'lucide-react';

export default function CreatePost({ onPostCreated }: { onPostCreated?: (post: any) => void }) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    };

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

        setImagePreviews(imagePreviews.filter((_: string, i: number) => i !== index));
        setSelectedImages(selectedImages.filter((_: File, i: number) => i !== index));
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
            selectedImages.forEach((image: File) => {
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
            imagePreviews.forEach((url: string) => URL.revokeObjectURL(url));
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
        <div className="bg-black border border-[var(--border)] p-4 rounded-sm mb-4">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                    {user?.profilePicture ? (
                        <img src={getImageUrl(user.profilePicture)} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-semibold text-sm bg-gray-800 text-white">
                            {user?.username?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full pt-2 text-sm focus:outline-none resize-none bg-transparent placeholder:text-[var(--secondary)] leading-tight"
                        rows={2}
                    />

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 my-3">
                            {imagePreviews.map((preview: string, index: number) => (
                                <div key={index} className="relative aspect-square rounded-sm overflow-hidden bg-gray-900 border border-[var(--border)] group/img">
                                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover/img:opacity-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-[var(--border)]">
                        <div className="flex gap-1">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-[var(--primary)] hover:opacity-70 transition-all"
                                title="Add photos"
                            >
                                <ImageIcon size={20} />
                            </button>

                            <button
                                type="button"
                                className="p-2 text-gray-400 hover:opacity-70 transition-all"
                                title="Add location"
                                onClick={() => alert('Location feature coming soon!')}
                            >
                                <MapPin size={20} />
                            </button>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 text-gray-400 hover:opacity-70 transition-all"
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
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={loading || (!content.trim() && selectedImages.length === 0)}
                                className="text-sm font-semibold text-[var(--primary)] hover:text-white transition-colors disabled:opacity-50"
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
