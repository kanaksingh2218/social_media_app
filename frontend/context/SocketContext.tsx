'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    refreshUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch initial count
    const fetchUnreadCount = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUnreadCount(data.count);
            }
        } catch (err) {
            console.error('Failed to fetch unread count', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUnreadCount();
        }
    }, [token]);

    useEffect(() => {
        if (!token || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
            auth: { token },
            reconnection: true,
        });

        newSocket.on('connect', () => {
            console.log('socket connected');
            setIsConnected(true);
            // Join room logic is handled by backend based on token
        });

        newSocket.on('disconnect', () => {
            console.log('socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('new_notification', (data) => {
            console.log('🔔 New Notification Received:', data);
            // Increment unread count locally for instant feedback
            setUnreadCount(prev => prev + 1);
            // Optional: Show toast here
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, unreadCount, refreshUnreadCount: fetchUnreadCount }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
