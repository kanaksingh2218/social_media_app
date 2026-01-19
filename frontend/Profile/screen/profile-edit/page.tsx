"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfileEditPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        bio: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                fullName: currentUser.fullName || '',
                bio: currentUser.bio || ''
            });
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/profile/update', formData);
            alert('Profile updated successfully!');
            router.push(`/profile/${currentUser?.id || currentUser?._id}`);
        } catch (err) {
            console.error('Update failed', err);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-[600px] mx-auto py-12 px-4">
                <div className="bg-white border border-[var(--border)] rounded-sm p-10 shadow-sm">
                    <h1 className="text-2xl font-light mb-8 text-center md:text-left">Edit Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <label className="md:w-32 text-sm font-semibold md:text-right">Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Full Name"
                                className="flex-1 ig-input h-9 text-sm"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <label className="md:w-32 text-sm font-semibold md:text-right mt-2">Bio</label>
                            <div className="flex-1">
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Bio"
                                    className="w-full ig-input py-2 text-sm min-h-[100px] resize-none"
                                />
                                <p className="text-[12px] text-[var(--secondary)] mt-2">
                                    Tell your friends a little something about yourself.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start md:ml-36">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--primary)] text-white px-6 py-1.5 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
