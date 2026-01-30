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
        { id: 'reels', label: 'Reels', icon: PlaySquare, disabled: true },
        { id: 'saved', label: 'Saved', icon: Bookmark, disabled: true },
        { id: 'tagged', label: 'Tagged', icon: User, disabled: true },
    ];

    return (
        <div className="border-t border-[var(--border)] mt-2">
            <div className="flex justify-center gap-8 md:gap-16 text-[12px] font-bold uppercase tracking-widest px-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            disabled={tab.disabled}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 py-3 md:py-4 -mt-[1px] transition-all relative
                                ${isActive
                                    ? 'text-white after:absolute after:top-0 after:left-0 after:right-0 after:h-[1px] after:bg-white'
                                    : 'text-[var(--secondary)] opacity-50'
                                }
                                ${tab.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <Icon size={14} className="md:w-3 md:h-3" strokeWidth={isActive ? 3 : 2} />
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
