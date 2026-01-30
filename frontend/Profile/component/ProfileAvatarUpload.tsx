"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Loader2, X, RefreshCcw } from 'lucide-react';

interface ProfileAvatarUploadProps {
    currentAvatar: string;
    username: string;
    onFileSelect: (file: File | null) => void;
    isUploading: boolean;
    getImageUrl: (path: string) => string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProfileAvatarUpload({
    currentAvatar,
    username,
    onFileSelect,
    isUploading,
    getImageUrl
}: ProfileAvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initial state cleanup if currentAvatar changes from backend
    useEffect(() => {
        if (!isUploading) {
            // If upload finished, we should probably clear the local preview 
            // once the parent component updates the currentAvatar prop
            // setPreviewUrl(null);
        }
    }, [currentAvatar, isUploading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);

        if (!file) return;

        // Validation
        if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
            setError('Please select a valid image (JPG, PNG)');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        onFileSelect(file);
    };

    const handleRevert = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError(null);
        onFileSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const triggerInput = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="flex items-center gap-5 mb-8">
            <div
                className={`relative group cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}
                onClick={triggerInput}
            >
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden bg-[#262626] border border-[var(--border)] relative">
                    {/* Avatar Image */}
                    {(previewUrl || currentAvatar) ? (
                        <img
                            src={previewUrl || getImageUrl(currentAvatar)}
                            alt={username}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-40' : 'group-hover:opacity-70'}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold uppercase bg-gradient-to-br from-[#1a1a1a] to-[#262626]">
                            {username?.[0]}
                        </div>
                    )}

                    {/* Loader Overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                    )}

                    {/* Hover Camera Icon */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'hidden' : ''}`}>
                        <Camera size={24} className="text-white" />
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="font-bold text-[16px] leading-tight">{username}</span>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={triggerInput}
                        disabled={isUploading}
                        className="text-[var(--primary)] text-sm font-bold hover:text-white transition-colors disabled:opacity-50"
                    >
                        Change profile photo
                    </button>

                    {previewUrl && !isUploading && (
                        <button
                            type="button"
                            onClick={handleRevert}
                            className="flex items-center gap-1 text-[var(--secondary)] text-sm font-medium hover:text-red-400 transition-colors"
                        >
                            <RefreshCcw size={12} />
                            <span>Remove</span>
                        </button>
                    )}
                </div>

                {error && (
                    <span className="text-red-500 text-[12px] font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
}
