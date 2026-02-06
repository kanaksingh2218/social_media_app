"use client";
import React from 'react';
import { Grid, PlaySquare, Bookmark, User } from 'lucide-react';

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    const tabs = [
        { id: 'posts', label: 'Posts', icon: Grid, disabled: false },
        { id: 'reels', label: 'Reels', icon: PlaySquare, disabled: false },
        { id: 'saved', label: 'Saved', icon: Bookmark, disabled: false },
        { id: 'tagged', label: 'Tagged', icon: User, disabled: false },
    ];

    return (
        <div className="border-t border-[var(--border)] mt-4">
            <div className="flex justify-center gap-12 md:gap-16 text-[12px] font-bold uppercase tracking-widest px-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            disabled={tab.disabled}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-1.5 py-4 -mt-[1px] transition-all relative
                                ${isActive
                                    ? 'text-white border-t border-white'
                                    : 'text-[var(--secondary)] opacity-60 hover:opacity-100'
                                }
                                ${tab.disabled ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}
                            `}
                        >
                            <Icon size={12} className="md:w-3 md:h-3" strokeWidth={isActive ? 3 : 2} />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
