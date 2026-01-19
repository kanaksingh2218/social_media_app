"use client";
import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api.service';
import Layout from '@/shared/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import EmojiPicker from '@/shared/components/EmojiPicker';
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

export default function ChatPage() {
    const { contactId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [contact, setContact] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            socket.emit('join', user.id || user._id);
        }
    }, [user]);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await api.get(`/profile/${contactId}`);
                setContact(res.data);
            } catch (err) {
                console.error('Failed to fetch contact', err);
            }
        };
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/chat/${contactId}`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            } finally {
                setLoading(false);
            }
        };
        if (contactId) {
            fetchContact();
            fetchMessages();
        }
    }, [contactId]);

    useEffect(() => {
        socket.on('receive_message', (data) => {
            if (data.sender === contactId) {
                setMessages((prev) => [...prev, data]);
            }
        });
        return () => {
            socket.off('receive_message');
        };
    }, [contactId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleEmojiSelect = (emoji: string) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const newContent = content.substring(0, start) + emoji + content.substring(end);
        setContent(newContent);

        // Set cursor position after emoji
        setTimeout(() => {
            input.selectionStart = input.selectionEnd = start + emoji.length;
            input.focus();
        }, 0);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        const tempContent = content;
        setContent('');
        try {
            const res = await api.post('/chat', { receiverId: contactId, content: tempContent });
            const newMessage = res.data;
            setMessages((prev) => [...prev, newMessage]);
            socket.emit('send_message', newMessage);
        } catch (err) {
            console.error('Send failed', err);
            alert('Failed to send message');
            setContent(tempContent);
        }
    };

    return (
        <Layout>
            <div className="max-w-[935px] mx-auto bg-[var(--background)] border border-[var(--border)] h-[calc(100vh-100px)] flex flex-col md:my-4 rounded overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="md:hidden text-2xl">←</button>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {contact?.profilePicture ? (
                                <img src={contact.profilePicture} alt={contact.username} className="w-full h-full object-cover" />
                            ) : (
                                contact?.username?.[0]?.toUpperCase()
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{contact?.username || 'Loading...'}</span>
                            <span className="text-[10px] text-green-500 font-medium">Active now</span>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xl opacity-70">
                        <button title="Call (coming soon)" onClick={() => alert('Call feature coming soon!')}>📞</button>
                        <button title="Video call (coming soon)" onClick={() => alert('Video call feature coming soon!')}>📹</button>
                        <button title="Info (coming soon)" onClick={() => alert('Info feature coming soon!')}>ℹ️</button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 pb-10 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                                    <div className="w-24 h-24 rounded-full border-2 border-[var(--border)] mb-4 flex items-center justify-center text-4xl">👤</div>
                                    <h3 className="text-xl font-semibold mb-1">{contact?.fullName}</h3>
                                    <p className="text-sm">{contact?.username} · Instagram</p>
                                    <button className="mt-4 bg-[var(--surface)] border border-[var(--border)] px-4 py-1.5 rounded-lg font-semibold text-sm">View Profile</button>
                                </div>
                            )}
                            {messages.map((m, i) => {
                                const isMe = m.sender === (user?.id || user?._id);
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[14px] leading-tight ${isMe
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]'
                                            }`}>
                                            <p>{m.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 bg-[var(--background)]">
                    <form onSubmit={handleSend} className="relative flex items-center bg-[var(--background)] border border-[var(--border)] rounded-full px-4 py-2">
                        {/* Emoji button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="text-xl mr-3 opacity-60 hover:opacity-100 transition-opacity"
                                title="Add emoji"
                            >
                                😀
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-2">
                                    <EmojiPicker
                                        onEmojiSelect={handleEmojiSelect}
                                        onClose={() => setShowEmojiPicker(false)}
                                    />
                                </div>
                            )}
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Message..."
                            className="flex-1 bg-transparent py-1 text-sm focus:outline-none"
                        />
                        {content.trim() ? (
                            <button type="submit" className="text-[var(--primary)] font-semibold text-sm hover:opacity-80 transition-opacity ml-2">
                                Send
                            </button>
                        ) : (
                            <div className="flex gap-3 ml-2 opacity-60 text-xl">
                                <button
                                    type="button"
                                    title="Image upload (coming soon)"
                                    onClick={() => alert('Image upload in chat coming soon!')}
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    🖼️
                                </button>
                                <button
                                    type="button"
                                    title="Send heart"
                                    onClick={() => {
                                        setContent('❤️');
                                        setTimeout(() => {
                                            const form = document.querySelector('form');
                                            form?.requestSubmit();
                                        }, 0);
                                    }}
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    ❤️
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </Layout>
    );
}
