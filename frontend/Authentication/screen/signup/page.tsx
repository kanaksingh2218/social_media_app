"use client";
import { useState } from 'react';
import api from '@/services/api.service';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/signup', formData);
            // Auto login after signup
            await login({ email: formData.email, password: formData.password });
            router.push('/feed');
        } catch (err) {
            console.error('Signup failed', err);
            alert('Signup failed. Username or email might already be taken.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 font-sans">
            <div className="w-full max-w-[380px] flex flex-col gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] p-10 flex flex-col items-center rounded-3xl shadow-sm">
                    <h1 className="text-5xl font-black mb-6 tracking-tighter bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent italic">Instagram</h1>
                    <p className="text-[var(--secondary)] font-bold text-center mb-8 leading-tight opacity-80">
                        Sign up to see photos and videos from your friends.
                    </p>

                    <button type="button" className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-6">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.597 1.325-1.326V1.326C24 .597 23.403 0 22.675 0z" /></svg>
                        Log in with Facebook
                    </button>

                    <div className="flex items-center gap-4 mb-6 w-full">
                        <div className="h-px bg-[var(--border)] flex-1" />
                        <span className="text-[11px] font-black text-[var(--secondary)] uppercase tracking-widest">or</span>
                        <div className="h-px bg-[var(--border)] flex-1" />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="ig-input"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="ig-input"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="ig-input"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="ig-input"
                            required
                        />

                        <p className="text-[11px] text-[var(--secondary)] text-center my-6 leading-normal">
                            People who use our service may have uploaded your contact information to Instagram. <Link href="#" className="font-bold text-[#00376b] dark:text-blue-400">Learn More</Link>
                        </p>

                        <button type="submit" className="btn-primary py-3">
                            Sign Up
                        </button>
                    </form>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] p-8 text-center rounded-3xl shadow-sm">
                    <p className="text-sm font-medium">
                        Have an account? <Link href="/" className="text-[var(--primary)] font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
