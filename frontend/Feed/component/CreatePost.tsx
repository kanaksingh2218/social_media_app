"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Image as ImageIcon } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import { getImageUrl } from '@/shared/utils/image.util';

export default function CreatePost({ onPostCreated }: { onPostCreated?: (post: any) => void }) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-black border border-[var(--border)] p-4 rounded-sm mb-4">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                        {user?.profilePicture ? (
                            <img src={getImageUrl(user.profilePicture)} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-semibold text-sm bg-gray-800 text-white">
                                {user?.username?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 text-left bg-transparent text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors py-3 px-2 rounded-md cursor-text"
                    >
                        What's on your mind, {user?.username}?
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 text-[var(--secondary)] hover:text-[var(--primary)] transition-colors"
                    >
                        <ImageIcon size={24} />
                    </button>
                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={onPostCreated}
            />
        </>
    );
}
