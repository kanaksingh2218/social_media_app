'use client';

import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '@/services/api.service';

interface CreateStoryModalProps {
    onClose: () => void;
    onSuccess: (story: any) => void;
}

export default function CreateStoryModal({ onClose, onSuccess }: CreateStoryModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/stories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess(res.data);
            onClose();
        } catch (error) {
            console.error('Failed to create story:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#262626] rounded-xl w-full max-w-md overflow-hidden relative border border-[#363636]">
                <button onClick={onClose} className="absolute top-4 right-4 text-white z-10 p-1 hover:bg-white/10 rounded-full">
                    <X size={24} />
                </button>

                <div className="p-4 border-b border-[#363636] text-center font-bold">
                    Add to Story
                </div>

                <div className="p-4 flex flex-col items-center gap-6 min-h-[300px] justify-center">
                    {preview ? (
                        <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer flex flex-col items-center gap-4 p-8 border-2 border-dashed border-[#555] rounded-xl hover:border-[#777] hover:bg-[#333] transition-all w-full">
                            <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center">
                                <ImageIcon size={32} />
                            </div>
                            <span className="font-semibold text-lg">Select Photo</span>
                            <span className="text-sm text-gray-400">Upload a photo to your story</span>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    {preview && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-70 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? 'Sharing...' : 'Share to Story'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
