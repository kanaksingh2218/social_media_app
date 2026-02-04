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

        if (loading) return;

        // Handle different states
        if (status === 'following' || status === 'friends') {
            // Show confirmation for unfollow
            if (!showConfirm) {
                setShowConfirm(true);
                return;
            }

            await unfollow();
            setShowConfirm(false);
            onSuccess?.();
        } else if (status === 'not_following' || status === 'pending_received') {
            await follow();
            onSuccess?.();
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

    // Get button text based on status
    const getButtonText = () => {
        if (loading || status === 'loading') return '...';
        if (showConfirm) return 'Unfollow?';

        // STRICT CONDITIONAL LOGIC - ONLY ONE STRING RETURNED
        if (status === 'following') return isHovering ? 'Unfollow' : 'Following';
        if (status === 'friends') return isHovering ? 'Unfollow' : 'Friends';
        if (status === 'pending_sent') return isHovering ? 'Cancel' : 'Request Sent';
        if (status === 'pending_received') return 'Follow Back';
        if (status === 'not_following') return 'Follow';
        if (status === 'error') return 'Error';

        return 'Follow';
    };

    // Get button styles based on status
    const getButtonStyle = () => {
        if (showConfirm || (isHovering && (status === 'following' || status === 'friends'))) {
            return 'bg-[#ed4956] text-white hover:bg-[#c13340]';
        }

        if (status === 'pending_sent') {
            return 'bg-[#363636] text-white opacity-80';
        }

        if (status === 'following' || status === 'friends') {
            return 'bg-[#363636] text-white hover:bg-[#262626]';
        }

        if (status === 'error') {
            return 'bg-red-500 text-white opacity-50';
        }

        // DEFAULT / FOLLOW BUTTON STYLE
        return 'bg-[#0095f6] hover:bg-[#1877f2] text-white';
    };

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
                ${getButtonStyle()}
            `}
            title={error || undefined}
        >
            {loading || status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <span>{getButtonText()}</span>
            )}
        </button>
    );
}
