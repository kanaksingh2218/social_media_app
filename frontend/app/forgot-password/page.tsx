"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const data = await forgotPassword(email);
            setMessage(data.message || 'If an account exists, a reset link has been sent.');
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="w-full max-w-sm border border-[var(--border)] bg-[var(--surface)] p-8 rounded-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-serif mb-2">Instagram</h1>
                    <p className="font-bold text-[var(--secondary)]">Trouble logging in?</p>
                    <p className="text-sm text-[var(--secondary)] mt-2">
                        Enter your email and we'll send you a link to get back into your account.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center">
                        <p className="text-green-500 mb-4">{message}</p>
                        <Link href="/" className="text-[var(--primary)] font-bold text-sm">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[var(--background)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--secondary)]"
                            required
                        />

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="bg-[var(--primary)] text-white font-bold py-1.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-70 text-sm"
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Login Link'}
                        </button>

                        {status === 'error' && (
                            <p className="text-red-500 text-xs text-center">{message}</p>
                        )}

                        <div className="flex items-center gap-4 my-4">
                            <div className="h-[1px] bg-[var(--border)] flex-1"></div>
                            <span className="text-xs text-[var(--secondary)] font-bold uppercase">OR</span>
                            <div className="h-[1px] bg-[var(--border)] flex-1"></div>
                        </div>

                        <div className="text-center">
                            <Link href="/auth/signup" className="text-xs font-bold text-[var(--foreground)] hover:text-[var(--secondary)]">
                                Create New Account
                            </Link>
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-[var(--border)] pt-4">
                    <Link href="/" className="text-xs font-bold text-[var(--foreground)] hover:text-[var(--secondary)]">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
