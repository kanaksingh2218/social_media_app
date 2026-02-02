"use client";
import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import ProfileSkeleton from '../../component/ProfileSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, X } from 'lucide-react';
import { getImageUrl } from '@/shared/utils/image.util';

import ProfileAvatarUpload from '../../component/ProfileAvatarUpload';

export default function ProfileEditPage() {
    const { user: currentUser, setUser, refreshUser } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        username: '',
        website: ''
    });

    const [initialData, setInitialData] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const data = {
                fullName: currentUser.fullName || '',
                bio: currentUser.bio || '',
                username: currentUser.username || '',
                website: currentUser.website || ''
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
        selectedFile !== null
    ) : false;

    const handleChange = (field: string, value: string) => {
        if (field === 'bio' && value.length > 150) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    };




    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!isDirty || loading) return;

        setLoading(true);
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
            const profileRes = await api.put('/profile/update', formData);

            // 3. Update local state
            const updatedUser = { ...currentUser, ...profileRes.data, profilePicture: avatarPath };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            alert('Profile updated successfully!');
            router.push(`/profile/${updatedUser.username || updatedUser.id || updatedUser._id}`);

        } catch (err: any) {
            console.error('Update failed', err);
            alert(err.response?.data?.message || 'Update failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile photo?')) return;

        setLoading(true);
        try {
            await api.delete('/profile/remove-avatar');

            // Refresh user from server to get latest state
            await refreshUser();

            alert('Profile photo removed.');

            // Force page refresh to clear cached images
            window.location.reload();
        } catch (err: any) {
            console.error('Failed to remove avatar', err);
            alert('Failed to remove photo.');
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
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-black z-50 md:hidden">
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

                <div className="md:flex md:border md:border-[var(--border)] md:rounded md:bg-black min-h-[600px]">
                    {/* Desktop Sidebar (Mock) */}
                    <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border)] py-4">
                        <button className="w-full text-left px-6 py-3 border-l-2 border-white font-bold text-sm">Edit profile</button>
                        <button className="w-full text-left px-6 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm opacity-60">Change password</button>
                        <button className="w-full text-left px-6 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm opacity-60">Apps and websites</button>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 py-8 px-4 md:px-20 max-w-2xl">
                        <h1 className="hidden md:block text-2xl font-normal mb-8">Edit profile</h1>

                        {/* Profile Photo Section */}
                        <ProfileAvatarUpload
                            currentAvatar={currentUser?.profilePicture || ''}
                            username={currentUser?.username || ''}
                            onFileSelect={setSelectedFile}
                            onRemove={handleRemoveAvatar}
                            isUploading={loading}
                            getImageUrl={getImageUrl}
                        />

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold md:text-[16px]">Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder="Name"
                                    required
                                    className="w-full bg-black border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:border-white/40 transition-colors"
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
                                    className="w-full bg-black border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:border-white/40 transition-colors"
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
                                    className="w-full bg-black border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:border-white/40 transition-colors"
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold md:text-[16px]">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleChange('bio', e.target.value)}
                                    placeholder="Bio"
                                    className="w-full bg-black border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:border-white/40 transition-colors h-20 resize-none"
                                />
                                <div className="flex justify-between items-center text-[11px] text-[var(--secondary)] opacity-60">
                                    <span>Describe yourself</span>
                                    <span>{formData.bio.length} / 150</span>
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
