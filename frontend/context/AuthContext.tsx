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
            if (token) {
                try {
                    // Verify token and get latest user data from backend
                    const res = await api.get('/auth/me');
                    if (res.data.success) {
                        setUser(res.data.user);
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                    }
                } catch (error: any) {
                    console.error('Auth initialization failed:', error);
                    if (error.response?.status === 401) {
                        logout();
                    }
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
        } catch (error: any) {
            if (error.response?.status === 401) {
                logout();
            }
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
