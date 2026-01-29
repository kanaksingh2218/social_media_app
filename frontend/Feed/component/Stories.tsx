"use client";
import React from 'react';

const StoryItem = ({ username, image, isSeen }: { username: string, image: string, isSeen?: boolean }) => (
    <div className="flex flex-col items-center gap-1 min-w-[74px] cursor-pointer">
        <div className={`w-16 h-16 rounded-full p-[2px] ${isSeen ? 'bg-gray-700' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'}`}>
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black">
                <img src={image || "/default-avatar.png"} alt={username} className="w-full h-full object-cover" />
            </div>
        </div>
        <span className="text-xs text-center overflow-hidden text-ellipsis w-full px-1">{username}</span>
    </div>
);

export default function Stories() {
    // Dummy stories for UI demonstration
    const dummyStories = [
        { id: 1, username: '_misttuu_', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
        { id: 2, username: '___hey.kh...', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
        { id: 3, username: '_snehaa05_', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
        { id: 4, username: 'mohanshri...', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        { id: 5, username: 'shilpa2921...', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        { id: 6, username: 'mayur_gh...', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
        { id: 7, username: 'rahul_23', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isSeen: true },
    ];

    return (
        <div className="bg-black py-4 flex gap-4 overflow-x-auto no-scrollbar max-w-full">
            {dummyStories.map(story => (
                <StoryItem key={story.id} {...story} />
            ))}
        </div>
    );
}
