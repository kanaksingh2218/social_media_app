"use client";
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const SuggestionItem = ({ username, image, subtext }: { username: string, image: string, subtext: string }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-800">
                <img src={image} alt={username} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold hover:underline cursor-pointer">{username}</span>
                <span className="text-xs text-[var(--secondary)]">{subtext}</span>
            </div>
        </div>
        <button className="text-xs font-semibold text-[var(--primary)] hover:text-white transition-colors">Follow</button>
    </div>
);

export default function SuggestionsSidebar() {
    const { user } = useAuth();

    const suggestions = [
        { id: 1, username: 'Heenaa Mhatre', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', subtext: 'Followed by _mhatrencha' },
        { id: 2, username: 'Farukh(FM)', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100', subtext: 'Followed by drx_shona_4_+' },
        { id: 3, username: 'Nolan Haghian', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', subtext: 'Followed by iampriti_jha' },
        { id: 4, username: 'Pratibha Vilas Patil', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', subtext: 'Followed by dr. m_r_u_n_a_' },
    ];

    if (!user) return null;

    return (
        <aside className="hidden lg:block w-[320px] pt-4 px-4">
            {/* User Profile Summary */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-800">
                        <img src={user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={user.fullName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user.username || user.fullName.toLowerCase().replace(' ', '_')}</span>
                        <span className="text-sm text-[var(--secondary)]">{user.fullName}</span>
                    </div>
                </div>
                <button className="text-xs font-semibold text-[var(--primary)] hover:text-white transition-colors">Switch</button>
            </div>

            {/* Suggestions Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--secondary)]">Suggested for you</span>
                <button className="text-xs font-semibold hover:opacity-70">See All</button>
            </div>

            {/* Suggestions List */}
            <div className="flex flex-col">
                {suggestions.map(item => (
                    <SuggestionItem key={item.id} {...item} />
                ))}
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-xs text-[var(--secondary)] leading-relaxed">
                <p className="hover:underline cursor-pointer inline">About</p> ·
                <p className="hover:underline cursor-pointer inline"> Help</p> ·
                <p className="hover:underline cursor-pointer inline"> Press</p> ·
                <p className="hover:underline cursor-pointer inline"> API</p> ·
                <p className="hover:underline cursor-pointer inline"> Jobs</p> ·
                <p className="hover:underline cursor-pointer inline"> Privacy</p> ·
                <p className="hover:underline cursor-pointer inline"> Terms</p> ·
                <p className="hover:underline cursor-pointer inline"> Locations</p> ·
                <p className="hover:underline cursor-pointer inline"> Language</p> ·
                <p className="hover:underline cursor-pointer inline"> Meta Verified</p>

                <p className="mt-4 uppercase">© 2026 Instagram from Meta</p>
            </div>
        </aside>
    );
}
