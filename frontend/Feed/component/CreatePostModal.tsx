"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import { Image as ImageIcon, MapPin, Smile, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { getImageUrl } from '@/shared/utils/image.util';
import EmojiPicker from '@/shared/components/EmojiPicker';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated?: (post: any) => void;
    // New optional prop for edit mode
    postToEdit?: any;
    onPostUpdated?: (post: any) => void;
}

export default function CreatePostModal({
    isOpen,
    onClose,
    onPostCreated,
    postToEdit,
    onPostUpdated
}: CreatePostModalProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = !!postToEdit;
    const initialImages = useMemo(() => postToEdit?.images || [], [postToEdit]);

    const {
        selectedImages,
        existingImages,
        imagePreviews,
        handleImageSelect,
        addFiles,
        removeImage,
        removeExistingImage,
        clearImages
    } = useImageUpload({
        maxFiles: 10,
        initialImageUrls: initialImages
    });

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            addFiles(files);
        }
    };

    const prevIsOpenRef = useRef(isOpen);

    // Populate form data when opening in edit mode
    useEffect(() => {
        // Only run when transitioning from closed to open
        if (isOpen && !prevIsOpenRef.current) {
            if (postToEdit) {
                setContent(postToEdit.content || '');
            } else {
                setContent('');
                clearImages();
                setIsDragging(false);
            }
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, postToEdit, clearImages]);

    // Focus textarea
    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleEmojiSelect = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + emoji + content.substring(end);
        setContent(newContent);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: must have content OR images
        // For edit: must have content OR (existingImages OR selectedImages)
        const hasImages = existingImages.length > 0 || selectedImages.length > 0;
        if (!content.trim() && !hasImages) {
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);

            // Append New Images
            selectedImages.forEach((image: File) => {
                formData.append('images', image);
            });

            // Append Existing Images (only in edit mode)
            if (isEditMode) {
                existingImages.forEach((url: string) => {
                    formData.append('images', url);
                });
            }

            let res;
            if (isEditMode) {
                res = await api.put(`/posts/update/${postToEdit._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (onPostUpdated) onPostUpdated(res.data);
            } else {
                res = await api.post('/posts/create', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (onPostCreated) onPostCreated(res.data.post || res.data);
            }

            // Cleanup and close
            setContent('');
            clearImages();
            onClose();
        } catch (err) {
            console.error(isEditMode ? 'Failed to update post' : 'Failed to create post', err);
            alert(`Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-[600px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                    <h2 className="font-semibold text-lg">{isEditMode ? 'Edit Post' : 'Create new post'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[60vh] md:h-auto md:max-h-[70vh]">
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <div
                            className={`p-4 flex-1 transition-colors ${isDragging ? 'bg-[var(--primary)]/10 border-2 border-dashed border-[var(--primary)] m-2 rounded-lg' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                                    {user?.profilePicture ? (
                                        <img src={getImageUrl(user.profilePicture)} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-semibold text-sm bg-gray-800 text-white">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="font-semibold text-sm">{user?.username}</span>
                                </div>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full min-h-[120px] bg-transparent text-base focus:outline-none resize-none placeholder:text-[var(--secondary)]"
                            />

                            {/* Image Grid */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {/* Existing Images */}
                                {existingImages.map((url, index) => (
                                    <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border)] group/img">
                                        <img src={getImageUrl(url)} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {/* New Image Previews */}
                                {imagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border)] group/img">
                                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-full transition-colors"
                                title="Add photos"
                            >
                                <ImageIcon size={24} />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-full transition-colors"
                                >
                                    <Smile size={24} />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 z-50">
                                        <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!content.trim() && existingImages.length === 0 && selectedImages.length === 0)}
                            className="px-6 py-2 bg-[var(--primary)] text-white font-semibold rounded-md disabled:opacity-50 hover:bg-[var(--primary)]/90 transition-all"
                        >
                            {loading ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update' : 'Post')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
