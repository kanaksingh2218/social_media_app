"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            router.push('/feed');
        } catch (err) {
            console.error('Login failed', err);
            alert('Invalid credentials');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] p-4">
            <div className="w-full max-w-[350px] flex flex-col gap-3">
                <div className="bg-[var(--background)] border border-[var(--border)] p-8 flex flex-col items-center">
                    <h1 className="text-4xl font-bold italic tracking-tighter mb-10">Instagram</h1>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="ig-input"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="ig-input"
                            required
                        />
                        <button type="submit" className="btn-primary mt-2">
                            Log In
                        </button>

                        <div className="flex items-center gap-4 my-4 w-full">
                            <div className="h-px bg-[var(--border)] flex-1" />
                            <span className="text-[13px] font-semibold text-[var(--secondary)] uppercase">or</span>
                            <div className="h-px bg-[var(--border)] flex-1" />
                        </div>

                        <button type="button" className="text-[14px] font-semibold text-[var(--primary)] flex items-center justify-center gap-2 mb-4">
                            <span className="text-xl">📘</span> Log in with Facebook
                        </button>

                        <button type="button" className="text-[12px] text-[var(--primary)]">
                            Forgot password?
                        </button>
                    </form>
                </div>

                <div className="bg-[var(--background)] border border-[var(--border)] p-6 text-center">
                    <p className="text-sm">
                        Don't have an account? <Link href="/signup" className="text-[var(--primary)] font-semibold">Sign up</Link>
                    </p>
                </div>

                <div className="text-center mt-2">
                    <p className="text-sm mb-4">Get the app.</p>
                    <div className="flex justify-center gap-2">
                        <div className="w-32 h-10 bg-[var(--app-button-bg)] rounded flex items-center justify-center text-[var(--app-button-text)] text-[10px] font-bold">App Store</div>
                        <div className="w-32 h-10 bg-[var(--app-button-bg)] rounded flex items-center justify-center text-[var(--app-button-text)] text-[10px] font-bold">Google Play</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
