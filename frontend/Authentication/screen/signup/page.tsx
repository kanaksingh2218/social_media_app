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
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] p-4">
            <div className="w-full max-w-[350px] flex flex-col gap-3">
                <div className="bg-[var(--background)] border border-[var(--border)] p-8 flex flex-col items-center">
                    <h1 className="text-4xl font-bold italic tracking-tighter mb-4">Instagram</h1>
                    <p className="text-[var(--secondary)] font-semibold text-center mb-6 leading-tight">
                        Sign up to see photos and videos from your friends.
                    </p>

                    <button type="button" className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
                        <span className="text-xl">📘</span> Log in with Facebook
                    </button>

                    <div className="flex items-center gap-4 mb-4 w-full">
                        <div className="h-px bg-[var(--border)] flex-1" />
                        <span className="text-[13px] font-semibold text-[var(--secondary)] uppercase">or</span>
                        <div className="h-px bg-[var(--border)] flex-1" />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="Email"
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

                        <p className="text-[12px] text-[var(--secondary)] text-center my-4">
                            People who use our service may have uploaded your contact information to Instagram. <Link href="#" className="font-semibold text-[var(--primary)]">Learn More</Link>
                        </p>

                        <button type="submit" className="btn-primary">
                            Sign Up
                        </button>
                    </form>
                </div>

                <div className="bg-[var(--background)] border border-[var(--border)] p-6 text-center">
                    <p className="text-sm">
                        Have an account? <Link href="/" className="text-[var(--primary)] font-semibold">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
