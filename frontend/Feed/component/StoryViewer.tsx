'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/services/api.service';

interface Story {
    _id: string;
    image: string;
    createdAt: string;
    user: { _id: string; username: string; profilePicture: string };
}

interface StoryGroup {
    user: { _id: string; username: string; profilePicture: string };
    stories: Story[];
    hasUnseen: boolean;
}

interface StoryViewerProps {
    groups: StoryGroup[];
    initialGroupIndex: number;
    onClose: () => void;
    onViewStory: (storyId: string) => void;
}

export default function StoryViewer({ groups, initialGroupIndex, onClose, onViewStory }: StoryViewerProps) {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentGroup = groups[currentGroupIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];

    useEffect(() => {
        // Reset story index when group changes unless it's the initial load logic which might be handled differently
        // For simplicity, always start at 0 (or first unseen) when switching groups could be an improvement
        setCurrentStoryIndex(0);
    }, [currentGroupIndex]);

    useEffect(() => {
        if (!currentStory) return;

        // Mark as viewed
        onViewStory(currentStory._id);

        // Progress Timer
        const duration = 5000; // 5 seconds
        const step = 50;
        let elapsed = 0;

        setProgress(0);

        const timer = setInterval(() => {
            elapsed += step;
            const newProgress = (elapsed / duration) * 100;
            setProgress(newProgress);

            if (elapsed >= duration) {
                handleNext();
            }
        }, step);

        return () => clearInterval(timer);
    }, [currentGroupIndex, currentStoryIndex]); // Re-run when story changes

    const handleNext = () => {
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            // Next story in same group
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            // Next group
            if (currentGroupIndex < groups.length - 1) {
                setCurrentGroupIndex(prev => prev + 1);
            } else {
                // Done with all stories
                onClose();
            }
        }
    };

    const handlePrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else {
            if (currentGroupIndex > 0) {
                setCurrentGroupIndex(prev => prev - 1);
                // Set to last story of previous group? Ideally yes.
                // For MVP, letting it default to 0 is okay, effectively restarting that user's stories.
            }
        }
    };

    if (!currentGroup || !currentStory) return null;

    const imageUrl = currentStory.image.startsWith('http')
        ? currentStory.image
        : `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/${currentStory.image.replace(/\\/g, '/')}`;

    return (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 p-2">
                <X size={32} />
            </button>

            {/* Logo */}
            <div className="absolute top-4 left-4 text-white font-serif z-40 text-xl font-bold">Instagram</div>

            {/* Main Content */}
            <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-xl overflow-hidden bg-[#1a1a1a]">

                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
                    {currentGroup.stories.map((s, idx) => (
                        <div key={s._id} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-linear ${idx === currentStoryIndex ? '' : ''}`}
                                style={{
                                    width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* User Info */}
                <div className="absolute top-6 left-0 p-3 z-20 flex items-center gap-3 w-full bg-gradient-to-b from-black/50 to-transparent">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50">
                        <img src={currentGroup.user.profilePicture || "/default-avatar.png"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white font-semibold text-sm drop-shadow-md">{currentGroup.user.username}</span>
                    <span className="text-white/70 text-xs ml-auto">
                        {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Navigation Areas */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full" onClick={handlePrev}></div>
                    <div className="w-2/3 h-full" onClick={handleNext}></div>
                </div>

                {/* Image */}
                <img
                    src={imageUrl}
                    alt="Story"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Desktop Navigation Arrows */}
            <button onClick={handlePrev} className="hidden md:block absolute left-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
                <ChevronLeft size={32} />
            </button>
            <button onClick={handleNext} className="hidden md:block absolute right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
                <ChevronRight size={32} />
            </button>
        </div>
    );
}
