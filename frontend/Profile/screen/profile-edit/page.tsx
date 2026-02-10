"use client";
import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import ProfileSkeleton from '../../component/ProfileSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, X, Lock, Globe } from 'lucide-react';
import { getImageUrl } from '@/shared/utils/image.util';

import ProfileAvatarUpload from '../../component/ProfileAvatarUpload';

export default function ProfileEditPage() {
    const { user: currentUser, setUser, refreshUser } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        username: '',
        website: '',
        isPrivate: false
    });

    const [initialData, setInitialData] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            const data = {
                fullName: currentUser.fullName || '',
                bio: currentUser.bio || '',
                username: currentUser.username || '',
                website: currentUser.website || '',
                isPrivate: currentUser.isPrivate || false
            };
            setFormData(data);
            setInitialData(data);
            setDataLoading(false);
        }
    }, [currentUser]);

    const isDirty = initialData ? (
        formData.fullName !== initialData.fullName ||
        formData.bio !== initialData.bio ||
        formData.website !== initialData.website ||
        formData.username !== initialData.username ||
        formData.isPrivate !== initialData.isPrivate ||
        selectedFile !== null
    ) : false;

    const handleChange = (field: string, value: string | boolean) => {
        if (field === 'bio' && typeof value === 'string' && value.length > 150) return;
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!isDirty || loading) return;

        // Basic frontend validation
        if (!formData.username.trim()) {
            setError('Username cannot be empty');
            return;
        }

        if (formData.website && !formData.website.match(/^(http|https):\/\/[^ "]+$/) && !formData.website.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)) {
            // Very loose URL check for UX, backend is stricter
            // Allow domain.com style input by prepending https:// before sending if needed, 
            // but for now let backend handle normalization if implemented there, or just error.
            // Actually, let's fix the input if it's missing protocol
            if (!formData.website.startsWith('http')) {
                // We'll auto-fix it in the payload
            }
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Upload avatar if selected
            let avatarPath = currentUser?.profilePicture;
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('avatar', selectedFile);
                const avatarRes = await api.post('/profile/upload-avatar', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                avatarPath = avatarRes.data.profilePicture;
            }

            // 2. Update profile details
            const payload = {
                ...formData,
                website: formData.website && !formData.website.startsWith('http') ? `https://${formData.website}` : formData.website
            };

            const profileRes = await api.put('/profile/update', payload);

            // 3. Update local state
            const updatedUser = {
                ...currentUser,
                ...profileRes.data,
                profilePicture: avatarPath || (profileRes.data.profilePicture || currentUser?.profilePicture)
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist update

            alert('Profile updated successfully!');
            router.push(`/profile/${updatedUser.username || updatedUser.id || updatedUser._id}`);

        } catch (err: any) {
            console.error('Update failed', err);
            setError(err.response?.data?.message || 'Update failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile photo?')) return;

        setLoading(true);
        try {
            await api.delete('/profile/remove-avatar');
            await refreshUser();
            alert('Profile photo removed.');
            window.location.reload();
        } catch (err: any) {
            console.error('Failed to remove avatar', err);
            setError('Failed to remove photo.');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return (
        <Layout>
            <div className="max-w-[935px] mx-auto py-10 px-4">
                <div className="h-10 bg-[#1a1a1a] rounded w-48 mb-10 animate-pulse" />
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-12 bg-[#1a1a1a] rounded w-full animate-pulse" />
                    ))}
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-[935px] mx-auto min-h-screen md:py-8">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-50 md:hidden">
                    <button onClick={() => router.back()} className="p-1 -ml-2">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-[16px] font-bold">Edit profile</h1>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={!isDirty || loading}
                        className={`font-bold text-sm ${(!isDirty || loading) ? 'opacity-30' : 'text-[var(--primary)]'}`}
                    >
                        {loading ? '...' : 'Done'}
                    </button>
                </div>

                <div className="md:flex md:border md:border-[var(--border)] md:rounded md:bg-[var(--background)] min-h-[600px]">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border)] py-4">
                        <button className="w-full text-left px-6 py-3 border-l-2 border-[var(--foreground)] font-bold text-sm bg-[var(--surface-hover)]">Edit profile</button>
                        <button className="w-full text-left px-6 py-3 border-l-2 border-transparent hover:bg-[var(--surface-hover)] text-sm opacity-60">Change password</button>
                        <button className="w-full text-left px-6 py-3 border-l-2 border-transparent hover:bg-[var(--surface-hover)] text-sm opacity-60">Apps and websites</button>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 py-8 px-4 md:px-20 max-w-2xl">
                        <h1 className="hidden md:block text-2xl font-normal mb-8">Edit profile</h1>

                        <ProfileAvatarUpload
                            currentAvatar={currentUser?.profilePicture || ''}
                            username={currentUser?.username || ''}
                            onFileSelect={setSelectedFile}
                            onRemove={handleRemoveAvatar}
                            isUploading={loading}
                            getImageUrl={getImageUrl}
                        />

                        {error && (
                            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold md:text-[16px]">Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder="Name"
                                    className="ig-input w-full"
                                />
                                <p className="text-[12px] text-[var(--secondary)] leading-tight opacity-70">
                                    Help people discover your account by using the name you&apos;re known by: either your full name, nickname, or business name.
                                </p>
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold md:text-[16px]">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                                    placeholder="Username"
                                    className="ig-input w-full"
                                />
                                <p className="text-[12px] text-[var(--secondary)] leading-tight opacity-70">
                                    In most cases, you&apos;ll be able to change your username back for another 14 days.
                                </p>
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold md:text-[16px]">Website</label>
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    placeholder="Website"
                                    className="ig-input w-full"
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold md:text-[16px]">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleChange('bio', e.target.value)}
                                    placeholder="Bio"
                                    className="ig-input w-full h-20 resize-none py-2"
                                />
                                <div className="flex justify-between items-center text-[11px] text-[var(--secondary)] opacity-60">
                                    <span>Describe yourself</span>
                                    <span>{formData.bio.length} / 150</span>
                                </div>
                            </div>

                            {/* Private Account Toggle */}
                            <div className="pt-4 border-t border-[var(--border)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-[16px] mb-1 flex items-center gap-2">
                                            <Lock size={16} /> Private Account
                                        </h3>
                                        <p className="text-xs text-[var(--secondary)] max-w-[80%]">
                                            When your account is private, only people you approve can see your photos and videos. Your existing followers won&apos;t be affected.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPrivate}
                                            onChange={(e) => handleChange('isPrivate', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Desktop Submit */}
                            <div className="hidden md:block pt-4">
                                <button
                                    type="submit"
                                    disabled={!isDirty || loading}
                                    className={`px-8 py-2 bg-[var(--primary)] text-white font-bold rounded-lg transition-all active:scale-95 disabled:opacity-30
                                        ${(!isDirty || loading) ? 'cursor-not-allowed' : 'hover:brightness-110'}
                                    `}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
