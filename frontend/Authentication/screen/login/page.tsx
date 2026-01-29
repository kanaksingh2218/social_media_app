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
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 font-sans">
            <div className="w-full max-w-[380px] flex flex-col gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] p-10 flex flex-col items-center rounded-3xl shadow-sm">
                    <h1 className="text-5xl font-black mb-12 tracking-tighter bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent italic">Instagram</h1>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email address"
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
                        <button type="submit" className="btn-primary mt-4 py-3">
                            Log In
                        </button>

                        <div className="flex items-center gap-4 my-6 w-full">
                            <div className="h-px bg-[var(--border)] flex-1" />
                            <span className="text-[11px] font-black text-[var(--secondary)] uppercase tracking-widest">or</span>
                            <div className="h-px bg-[var(--border)] flex-1" />
                        </div>

                        <button type="button" className="text-[14px] font-bold text-[#385185] dark:text-blue-400 flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.597 1.325-1.326V1.326C24 .597 23.403 0 22.675 0z" /></svg>
                            Log in with Facebook
                        </button>
                        <div className="flex justify-center mb-6">
                            <Link href="/forgot-password" className="text-xs font-semibold text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] p-8 text-center rounded-3xl shadow-sm">
                    <p className="text-sm font-medium">
                        Don't have an account? <Link href="/signup" className="text-[var(--primary)] font-bold hover:underline">Sign up</Link>
                    </p>
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm font-semibold mb-6 opacity-60">Get the app.</p>
                    <div className="flex justify-center gap-3">
                        <button className="flex-1 bg-black text-white h-12 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all border border-white/10">
                            <span className="text-lg font-bold">App Store</span>
                        </button>
                        <button className="flex-1 bg-black text-white h-12 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all border border-white/10">
                            <span className="text-lg font-bold">Google Play</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
