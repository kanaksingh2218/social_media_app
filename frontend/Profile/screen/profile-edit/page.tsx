"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function ProfileEditPage() {
    const { user: currentUser, setUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        username: '',
        website: ''
    });
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    useEffect(() => {
        if (currentUser && !isDirty) {
            setFormData({
                fullName: currentUser.fullName || '',
                bio: currentUser.bio || '',
                username: currentUser.username || '',
                website: currentUser.website || ''
            });
        }
    }, [currentUser, isDirty]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('avatar', file);

        setAvatarLoading(true);
        try {
            const res = await api.post('/profile/upload-avatar', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = { ...currentUser, profilePicture: res.data.profilePicture };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert('Profile photo updated!');
        } catch (err) {
            console.error('Avatar upload failed', err);
            alert('Failed to upload avatar');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        console.log('Frontend handleSubmit - sending:', formData);
        try {
            const res = await api.put('/profile/update', formData);
            console.log('Frontend handleSubmit - received:', res.data);

            const updatedUser = { ...currentUser, ...res.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsDirty(false);
            alert('Profile updated successfully!');

            // Redirect and force a fresh fetch
            router.push(`/profile/${currentUser?.id || currentUser?._id}`);
            setTimeout(() => {
                window.location.href = `/profile/${currentUser?.id || currentUser?._id}`;
            }, 500);
        } catch (err: any) {
            console.error('Update failed', err);
            alert(err.response?.data?.message || 'Update failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-[935px] mx-auto min-h-screen md:py-8">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-black z-50">
                    <button onClick={() => router.back()}><ChevronLeft size={28} /></button>
                    <h1 className="text-[16px] font-bold">Edit profile</h1>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="text-[var(--primary)] font-bold text-sm"
                    >
                        {loading ? '...' : 'Done'}
                    </button>
                </div>

                <div className="md:flex md:border md:border-[var(--border)] md:rounded md:bg-black min-h-[600px]">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border)]">
                        <div className="py-2">
                            <button className="w-full text-left px-5 py-3 border-l-2 border-white font-bold text-sm transition-all">Edit profile</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Change password</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Apps and websites</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Email notifications</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Push notifications</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Manage contacts</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Privacy and security</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Ads</button>
                            <button className="w-full text-left px-5 py-3 border-l-2 border-transparent hover:bg-white/5 text-sm transition-all text-white/60 hover:text-white">Supervision</button>
                        </div>
                        <div className="mt-auto p-5 border-t border-[var(--border)]">
                            <button className="text-[var(--primary)] font-bold text-sm">Switch to professional account</button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 py-8 px-4 md:px-20">
                        {/* Profile Photo Row */}
                        <div className="flex items-center gap-6 mb-8 mt-4">
                            <div className="relative w-10 h-10 md:w-14 md:h-14 shrink-0">
                                <div className="w-full h-full rounded-full overflow-hidden bg-[#262626]">
                                    {currentUser?.profilePicture ? (
                                        <img
                                            src={getImageUrl(currentUser.profilePicture)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[var(--secondary)] font-bold text-lg uppercase">
                                            {currentUser?.username?.[0]}
                                        </div>
                                    )}
                                </div>
                                {avatarLoading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[16px] font-bold leading-tight">{currentUser?.username}</span>
                                <label className="text-[var(--primary)] text-sm font-bold cursor-pointer hover:text-white transition-colors mt-0.5">
                                    Change profile photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={avatarLoading} />
                                </label>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-5 max-w-[400px] md:max-w-none">
                            {/* Name Field */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start md:items-center">
                                <label className="w-full md:w-32 text-left md:text-right font-bold text-[16px] shrink-0">Name</label>
                                <div className="flex-1 w-full flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                        className="w-full border border-[var(--border)] bg-black rounded p-2 text-[16px] focus:outline-none focus:border-white/40 transition-colors"
                                    />
                                    <p className="text-[12px] text-[var(--secondary)] leading-tight">Help people discover your account by using the name you&apos;re known by: either your full name, nickname, or business name.</p>
                                </div>
                            </div>

                            {/* Username Field */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start md:items-center">
                                <label className="w-full md:w-32 text-left md:text-right font-bold text-[16px] shrink-0">Username</label>
                                <div className="flex-1 w-full flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => handleChange('username', e.target.value)}
                                        className="w-full border border-[var(--border)] bg-black rounded p-2 text-[16px] focus:outline-none focus:border-white/40 transition-colors"
                                    />
                                    <p className="text-[12px] text-[var(--secondary)] leading-tight">In most cases, you&apos;ll be able to change your username back to {formData.username} for another 14 days.</p>
                                </div>
                            </div>

                            {/* Website Field */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start md:items-center">
                                <label className="w-full md:w-32 text-left md:text-right font-bold text-[16px] shrink-0">Website</label>
                                <div className="flex-1 w-full flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => handleChange('website', e.target.value)}
                                        placeholder="Website"
                                        className="w-full border border-[var(--border)] bg-black rounded p-2 text-[16px] focus:outline-none focus:border-white/40 transition-colors"
                                    />
                                    <p className="text-[12px] text-[var(--secondary)] leading-tight">Adding links to your bio helps people know more about you.</p>
                                </div>
                            </div>

                            {/* Bio Field */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start">
                                <label className="w-full md:w-32 text-left md:text-right font-bold text-[16px] shrink-0 md:mt-1">Bio</label>
                                <div className="flex-1 w-full flex flex-col gap-2">
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => handleChange('bio', e.target.value)}
                                        className="w-full border border-[var(--border)] bg-black rounded p-2 text-[16px] focus:outline-none focus:border-white/40 transition-colors h-20 resize-none"
                                    />
                                    <p className="text-[12px] text-[var(--secondary)] font-normal text-right">{formData.bio.length} / 150</p>
                                </div>
                            </div>

                            {/* Personal Info Link */}
                            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start mt-4">
                                <div className="hidden md:block w-32 shrink-0"></div>
                                <div className="flex-1">
                                    <h3 className="text-[14px] font-bold text-[var(--secondary)] mb-1">Personal information</h3>
                                    <p className="text-[12px] text-[var(--secondary)] leading-tight mb-4">Provide your personal information, even if the account is used for a business, a pet or something else. This won&apos;t be a part of your public profile.</p>
                                    <button className="text-[var(--primary)] font-bold text-sm hover:text-white transition-colors">Personal information settings</button>
                                </div>
                            </div>

                            {/* Submit Button (Desktop Only) */}
                            <div className="hidden md:flex flex-col md:flex-row gap-2 md:gap-8 items-start mt-8">
                                <div className="w-32 shrink-0"></div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-[var(--primary)] text-white rounded font-bold text-sm disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 md:hidden border-t border-[var(--border)] pt-6">
                            <button className="text-[var(--primary)] font-bold text-sm">Switch to professional account</button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
