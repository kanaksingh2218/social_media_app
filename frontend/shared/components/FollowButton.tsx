"use client";
import React, { useState, useCallback } from 'react';
import { useFollowStatus } from '../../hooks/useFollowStatus';
import { FollowStatus } from '../../types/follow.types';

interface FollowButtonProps {
    userId: string;
    initialStatus?: FollowStatus;
    onSuccess?: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
}

export default function FollowButton({
    userId,
    initialStatus,
    onSuccess,
    size = 'medium',
    variant = 'primary'
}: FollowButtonProps) {
    const { status, loading, error, follow, unfollow } = useFollowStatus(userId, initialStatus);
    const [isHovering, setIsHovering] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClick = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (loading || status === 'loading') return;

        // Handle different states
        try {
            if (status === 'following') {
                // Show confirmation for unfollow
                if (!showConfirm) {
                    setShowConfirm(true);
                    return;
                }
                await unfollow();
                setShowConfirm(false);
            } else if (status === 'none') {
                await follow();
            } else if (status === 'pending_acceptance') {
                // Navigate to requests or handle accept
                window.location.href = '/requests';
            } else if (status === 'requested') {
                // Cancel request (unfollow)
                await unfollow();
            }
            onSuccess?.();
        } catch (err) {
            console.error('Action failed', err);
        }
    }, [status, loading, showConfirm, follow, unfollow, onSuccess]);

    const handleMouseLeave = () => {
        setIsHovering(false);
        setShowConfirm(false);
    };

    // Size classes
    const sizeClasses = {
        small: 'px-4 py-1 text-xs min-w-[80px]',
        medium: 'px-6 py-1.5 text-sm min-w-[100px]',
        large: 'px-8 py-2 text-base min-w-[120px]'
    };

    // Get button text and style based on status
    const getButtonConfig = () => {
        if (loading || status === 'loading') {
            return {
                text: '...',
                style: 'bg-[#363636] text-white opacity-50'
            };
        }

        if (showConfirm) {
            return {
                text: 'Unfollow?',
                style: 'bg-[#ed4956] text-white hover:bg-[#c13340]'
            };
        }

        switch (status) {
            case 'following':
                return {
                    text: isHovering ? 'Unfollow' : 'Following',
                    style: 'bg-[#363636] text-white hover:bg-[#262626] border border-[var(--border)]'
                };
            case 'requested':
                return {
                    text: isHovering ? 'Cancel' : 'Requested',
                    style: 'bg-[#363636] text-white opacity-80'
                };
            case 'pending_acceptance':
                return {
                    text: 'Accept',
                    style: 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                };
            case 'none':
            default:
                return {
                    text: 'Follow',
                    style: 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                };
        }
    };

    if (status === 'self') {
        return null;
    }

    const config = getButtonConfig();

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={handleMouseLeave}
            disabled={loading || status === 'loading' || status === 'error'}
            className={`
                flex items-center justify-center gap-2 
                rounded-lg font-bold transition-all 
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${sizeClasses[size]}
                ${config.style}
            `}
            title={error || undefined}
        >
            {loading || status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <span>{config.text}</span>
            )}
        </button>
    );
}
