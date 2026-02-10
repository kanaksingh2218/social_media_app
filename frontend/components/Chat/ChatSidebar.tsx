import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface ChatSidebarProps {
    conversations: any[];
    selectedId: string | null;
    onSelect: (c: any) => void;
}

export default function ChatSidebar({ conversations, selectedId, onSelect }: ChatSidebarProps) {
    const { user } = useAuth();
    const currentUserId = user?.id || user?._id;

    return (
        <div className="w-full flex flex-col h-full">
            <div className="p-5 border-b border-[#262626] font-bold text-xl flex justify-between items-center">
                <span>{user?.username}</span>
                <svg aria-label="New Message" className="cursor-pointer" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12.202 3.203H5.202a3 3 0 0 0-3 3V18.8a3 3 0 0 0 3 3h13.598a3 3 0 0 0 3-3V11.8a1 1 0 0 0-2 0V18.8a1 1 0 0 1-1 1H5.202a1 1 0 0 1-1-1V6.203a1 1 0 0 1 1-1h7a1 1 0 0 0 0-2Z"></path><path d="M22.542 2.725a1.485 1.485 0 0 0-2.099 0L12.05 11.119l-.531 3.183 3.183-.531 8.394-8.391a1.485 1.485 0 0 0 0-2.099l-1.054-1054Z"></path></svg>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar">
                    {/* Active bubbles (placeholder) */}
                    <div className="flex flex-col items-center gap-1 min-w-[70px]">
                        <div className="w-16 h-16 rounded-full bg-gray-700"></div>
                        <span className="text-xs text-gray-400">Note</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="px-4 py-2 flex justify-between">
                        <span className="font-bold">Messages</span>
                        <span className="text-gray-400 text-sm">Requests</span>
                    </div>
                    {conversations.map(conv => {
                        const otherUser = conv.participants.find((p: any) => p._id !== currentUserId);
                        const isUnread = conv.unreadCounts?.[currentUserId] > 0;

                        return (
                            <div
                                key={conv._id}
                                onClick={() => onSelect(conv)}
                                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#121212] transition-colors ${selectedId === conv._id ? 'bg-[#262626]' : ''}`}
                            >
                                <img src={otherUser?.profilePicture || "/default-avatar.png"} className="w-14 h-14 rounded-full object-cover" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="font-medium truncate">{otherUser?.username}</div>
                                    <div className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'text-gray-400'}`}>
                                        {conv.lastMessage?.text || (conv.lastMessage?.image ? 'Sent a photo' : 'Start a conversation')}
                                    </div>
                                </div>
                                {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
