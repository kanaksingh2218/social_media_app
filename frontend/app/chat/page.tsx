'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api.service';
import ChatSidebar from '@/components/Chat/ChatSidebar';
import MessageThread from '@/components/Chat/MessageThread';

export default function ChatPage() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);

    // Fetch conversations on load
    useEffect(() => {
        const fetchConvos = async () => {
            try {
                const res = await api.get('/chat/conversations');
                setConversations(res.data);
            } catch (err) {
                console.error('Failed to load conversations', err);
            }
        };
        fetchConvos();
    }, []);

    // Listen for real-time messages to update conversation list (last message)
    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', (data: any) => {
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c._id === data.conversationId) {
                        return {
                            ...c,
                            lastMessage: data.message,
                            updatedAt: new Date().toISOString(),
                            unreadCounts: { ...c.unreadCounts, [user?.id || '']: (c.unreadCounts?.[user?.id || ''] || 0) + 1 }
                        };
                    }
                    return c;
                });
                return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            });
        });

        return () => {
            socket.off('new_message');
        };
    }, [socket, user]);

    return (
        <div className="flex h-[calc(100vh-60px)] md:h-screen w-full bg-black text-white">
            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] border-r border-[#262626]`}>
                <ChatSidebar
                    conversations={conversations}
                    selectedId={selectedConversation?._id}
                    onSelect={(c) => setSelectedConversation(c)}
                />
            </div>
            <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 bg-black`}>
                {selectedConversation ? (
                    <MessageThread
                        conversation={selectedConversation}
                        onBack={() => setSelectedConversation(null)}
                    />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center w-full h-full text-center p-4">
                        <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center mb-4">
                            <svg aria-label="Direct" fill="currentColor" height="48" viewBox="0 0 24 24" width="48"><path d="M12.003 2.001a9.999 9.999 0 1 0 5.617 18.271l3.52 1.353a.999.999 0 0 0 1.28-1.28l-1.353-3.52a9.999 9.999 0 0 0-9.064-14.824Z"></path></svg>
                        </div>
                        <h2 className="text-xl font-medium">Your Messages</h2>
                        <p className="text-gray-400 text-sm mt-2">Send private photos and messages to a friend.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
