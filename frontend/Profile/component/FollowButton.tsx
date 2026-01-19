"use client";
import React, { useState } from 'react';
import api from '../../services/api.service';

export default function FollowButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        setLoading(true);
        try {
            await api.post(`/profile/follow/${userId}`);
            window.location.reload();
        } catch (err) {
            alert('Follow failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className="bg-[var(--primary)] text-white px-6 py-1 rounded font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
            {loading ? 'Processing...' : 'Follow'}
        </button>
    );
}
