"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        try {
            const token = Array.isArray(params.token) ? params.token[0] : params.token;
            await resetPassword(token, password);
            setStatus('success');
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Invalid or expired token. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="w-full max-w-sm border border-[var(--border)] bg-[var(--surface)] p-8 rounded-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-serif mb-2">Instagram</h1>
                    <p className="font-bold text-[var(--foreground)] text-lg">Create New Password</p>
                    <p className="text-sm text-[var(--secondary)] mt-2">
                        Your new password must be different from previous used passwords.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center">
                        <p className="text-green-500 mb-4 font-bold">Password Reset Successfully!</p>
                        <p className="text-sm text-[var(--secondary)]">Redirecting to login...</p>
                        <Link href="/" className="text-[var(--primary)] font-bold text-sm mt-4 block">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[var(--background)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--secondary)]"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-[var(--background)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--secondary)]"
                            required
                        />

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="bg-[var(--primary)] text-white font-bold py-1.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-70 text-sm mt-2"
                        >
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>

                        {status === 'error' && (
                            <p className="text-red-500 text-xs text-center">{message}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
