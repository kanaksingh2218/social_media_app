"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api.service';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const initialized = React.useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // Fetch latest user data
                    if (parsedUser.id || parsedUser._id) {
                        try {
                            const userId = parsedUser._id || parsedUser.id;
                            const res = await api.get(`/profile/${userId}`);
                            localStorage.setItem('user', JSON.stringify(res.data));
                            setUser(res.data);
                        } catch (refreshError: any) {
                            if (refreshError.response?.status !== 429) {
                                console.error('Failed to refresh user on load', refreshError);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse stored user', e);
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (credentials: any) => {
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const forgotPassword = async (email: string) => {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (token: string, password: any) => {
        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const refreshUser = async () => {
        if (!user) return;
        try {
            const userId = user._id || user.id;
            const res = await api.get(`/profile/${userId}`);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return res.data;
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser, forgotPassword, resetPassword, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
