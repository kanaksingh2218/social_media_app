"use client";
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '@/services/api.service';
import { useAuth } from '@/context/AuthContext';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';

const StoryItem = ({ username, image, isSeen, isOwn, onClick }: { username: string, image: string, isSeen?: boolean, isOwn?: boolean, onClick: () => void }) => {
    // Determine image URL safely
    const imageUrl = image?.startsWith('http')
        ? image
        : `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/${image?.replace(/\\/g, '/')}`;

    return (
        <div className="flex flex-col items-center gap-1 min-w-[74px] cursor-pointer group" onClick={onClick}>
            <div className={`w-16 h-16 rounded-full p-[2px] ${isOwn ? 'bg-transparent border border-gray-600' : (isSeen ? 'bg-gray-700' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600')}`}>
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black p-[2px]">
                    <img src={imageUrl || "/default-avatar.png"} alt={username} className="w-full h-full object-cover rounded-full transition-transform group-hover:scale-110" />
                </div>
                {isOwn && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-black">
                        <Plus size={12} className="text-white" />
                    </div>
                )}
            </div>
            <span className="text-xs text-center overflow-hidden text-ellipsis w-full px-1 truncate max-w-[74px] text-gray-200">
                {isOwn ? 'Your story' : username}
            </span>
        </div>
    );
};

export default function Stories() {
    const { user } = useAuth();
    const [stories, setStories] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewerGroupId, setViewerGroupId] = useState<number | null>(null);

    const fetchStories = async () => {
        try {
            const res = await api.get('/stories/feed');
            setStories(res.data);
        } catch (error) {
            console.error('Failed to fetch stories', error);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleCreateSuccess = (newStory: any) => {
        fetchStories(); // Refresh feed
    };

    const handleViewStory = async (storyId: string) => {
        try {
            await api.post(`/stories/${storyId}/view`);
            // Optimistically update seen status locally if needed
        } catch (error) {
            console.error('Failed to view story', error);
        }
    };

    return (
        <div className="bg-black pt-4 pb-0 flex gap-4 overflow-x-auto no-scrollbar max-w-full">
            {/* Create Story Button */}
            <div className="flex flex-col items-center gap-1 min-w-[74px] cursor-pointer" onClick={() => setShowCreateModal(true)}>
                <div className="w-16 h-16 rounded-full p-[2px] bg-transparent relative">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 border-2 border-black relative">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} className="w-full h-full object-cover opacity-60" />
                        ) : (
                            <div className="w-full h-full bg-gray-800" />
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-[var(--background)]">
                        <Plus size={14} className="text-white" />
                    </div>
                </div>
                <span className="text-xs text-center w-full px-1 text-gray-400">Your story</span>
            </div>

            {/* Story List */}
            {stories.map((group, index) => (
                <StoryItem
                    key={group.user._id}
                    username={group.user.username}
                    image={group.user.profilePicture}
                    isSeen={!group.hasUnseen}
                    onClick={() => setViewerGroupId(index)}
                />
            ))}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateStoryModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* Viewer */}
            {viewerGroupId !== null && (
                <StoryViewer
                    groups={stories}
                    initialGroupIndex={viewerGroupId}
                    onClose={() => setViewerGroupId(null)}
                    onViewStory={handleViewStory}
                />
            )}
        </div>
    );
}
