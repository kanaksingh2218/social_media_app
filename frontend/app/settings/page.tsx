'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updatePrivacy } from '@/services/user.service';
import Layout from '@/shared/components/Layout';
import { ChevronLeft, Shield, User, LogOut, ChevronRight, Lock, Unlock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { logout } = useAuth();

    useEffect(() => {
        fetchUserSettings();
    }, []);

    const fetchUserSettings = async () => {
        try {
            setLoading(true);
            const data = await getCurrentUser();
            setUser(data);
            setIsPrivate(data.isPrivate || false);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacyToggle = async () => {
        try {
            setSaving(true);
            const data = await updatePrivacy(!isPrivate);
            setIsPrivate(data.isPrivate);

            // UPDATE localStorage so it persists
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const currentUser = JSON.parse(storedUser);
                currentUser.isPrivate = data.isPrivate;
                localStorage.setItem('user', JSON.stringify(currentUser));
            }

            console.log(`Account is now ${data.isPrivate ? 'Private' : 'Public'}`);
        } catch (error: any) {
            console.error('Privacy toggle error:', error);
            alert('Failed to update privacy settings');
            setIsPrivate(!isPrivate); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-[var(--secondary)]">Loading settings...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-2xl font-black tracking-tight">Settings</h1>
                </div>

                {/* Privacy Settings Section */}
                <div className="ig-card overflow-hidden mb-6">
                    <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Privacy</h2>
                            <p className="text-sm text-[var(--secondary)]">
                                Control who can see your content and interact with you
                            </p>
                        </div>
                    </div>

                    {/* Private Account Toggle */}
                    <div className="p-6 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold">Private Account</h3>
                                    {isPrivate ? <Lock size={14} className="text-blue-500" /> : <Unlock size={14} className="text-[var(--secondary)]" />}
                                </div>
                                <p className="text-sm text-[var(--secondary)] leading-relaxed">
                                    {isPrivate
                                        ? 'Only approved followers can see your posts, followers, and following lists.'
                                        : 'Anyone can see your posts and follow you without approval.'}
                                </p>
                            </div>

                            <button
                                onClick={handlePrivacyToggle}
                                disabled={saving}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${isPrivate ? 'bg-blue-500' : 'bg-gray-600'
                                    } ${saving ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:brightness-110'}`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isPrivate ? 'translate-x-[22px]' : 'translate-x-[4px]'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Show current pending requests if private */}
                    {isPrivate && (
                        <div className="p-6 bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer" onClick={() => router.push('/requests')}>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-blue-500 rounded-full text-white mt-0.5">
                                    <User size={14} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-blue-400">
                                        Your account is private
                                    </p>
                                    <p className="text-sm text-[var(--secondary)] mt-1">
                                        Manage incoming follow requests from your dashboard.
                                    </p>
                                    <div className="flex items-center gap-1 text-sm text-blue-400 font-bold mt-2">
                                        View Follow Requests <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Stats Snapshot */}
                    <div className="p-6 bg-[var(--surface-hover)]">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-lg font-black">{user?.followerCount || 0}</p>
                                <p className="text-xs text-[var(--secondary)] font-medium uppercase tracking-wider">Followers</p>
                            </div>
                            <div>
                                <p className="text-lg font-black">{user?.followingCount || 0}</p>
                                <p className="text-xs text-[var(--secondary)] font-medium uppercase tracking-wider">Following</p>
                            </div>
                            <div>
                                <p className="text-lg font-black">{user?.posts?.length || 0}</p>
                                <p className="text-xs text-[var(--secondary)] font-medium uppercase tracking-wider">Posts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Section */}
                <div className="ig-card overflow-hidden">
                    <div className="p-6 border-b border-[var(--border)]">
                        <h2 className="text-lg font-bold">Account</h2>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                        >
                            <span className="font-medium group-hover:pl-1 transition-all">Edit Profile</span>
                            <ChevronRight size={18} className="opacity-30" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                            <span className="font-medium group-hover:pl-1 transition-all">Change Password</span>
                            <ChevronRight size={18} className="opacity-30" />
                        </button>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors group text-red-500"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={18} />
                                <span className="font-bold">Log Out</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
