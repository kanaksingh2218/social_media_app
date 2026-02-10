import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Info } from 'lucide-react';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

interface MessageThreadProps {
    conversation: any;
    onBack?: () => void;
}

export default function MessageThread({ conversation, onBack }: MessageThreadProps) {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Derived states
    const otherUser = conversation.participants.find((p: any) => p._id !== (user?.id || user?._id));

    // Fetch messages
    useEffect(() => {
        if (!conversation._id) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/${conversation._id}/messages`);
                setMessages(res.data);
                // Mark as read
                await api.put(`/chat/${conversation._id}/read`);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [conversation._id]);

    // Handle initial scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', (data: any) => {
            if (data.conversationId === conversation._id) {
                setMessages(prev => [...prev, data.message]);
                // Optimistically mark as read locally or call API again
            }
        });

        return () => {
            socket.off('new_message');
        };
    }, [socket, conversation._id]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        setSending(true);
        try {
            const res = await api.post('/chat/message', {
                conversationId: conversation._id,
                text: inputText
            });
            setMessages(prev => [...prev, res.data]);
            setInputText('');
        } catch (err) {
            console.error('Failed to send', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="px-5 py-3 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden pr-2">
                        <ArrowLeft size={24} />
                    </button>
                    <img src={otherUser?.profilePicture || "/default-avatar.png"} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-semibold">{otherUser?.username}</span>
                </div>
                <Info size={24} />
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {messages.map((msg, idx) => {
                    const isOwn = msg.sender === (user?.id || user?._id);
                    return (
                        <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2 rounded-2xl break-words ${isOwn ? 'bg-[#3797f0] text-white' : 'bg-[#262626] text-white'}`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="p-4 bg-black">
                <form onSubmit={handleSend} className="flex items-center bg-[#262626] rounded-full px-4 py-2 border border-[#363636]">
                    <button type="button" className="p-2 text-white/80 hover:text-white mr-2">
                        <ImageIcon size={24} />
                    </button>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                    />
                    {inputText && (
                        <button type="button" onClick={handleSend} disabled={sending} className="text-[#0095f6] font-semibold ml-2 hover:text-white transition-colors">
                            Send
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
