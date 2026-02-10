'use client';
import React, { useState } from 'react';
import api from '@/services/api.service';
import { Lock, Loader2 } from 'lucide-react';

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords don't match" });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters" });
            return;
        }

        setLoading(true);
        try {
            await api.put('/users/me/password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: 'success', text: "Password updated successfully" });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Current Password</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="password"
                        className="w-full bg-[#121212] border border-[#363636] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-blue-500 outline-none"
                        value={formData.currentPassword}
                        onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">New Password</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="password"
                        className="w-full bg-[#121212] border border-[#363636] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-blue-500 outline-none"
                        value={formData.newPassword}
                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Confirm New Password</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="password"
                        className="w-full bg-[#121212] border border-[#363636] rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-blue-500 outline-none"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Change Password'}
            </button>
        </form>
    );
}
