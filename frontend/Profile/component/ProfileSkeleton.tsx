"use client";
import React from 'react';

export default function ProfileSkeleton() {
    return (
        <div className="max-w-[935px] mx-auto animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-24 px-4 py-4 md:py-12">
                <div className="w-[77px] h-[77px] md:w-[150px] md:h-[150px] rounded-full bg-[#1a1a1a]" />
                <div className="flex-1 flex flex-col gap-4 w-full">
                    <div className="h-8 bg-[#1a1a1a] rounded w-1/3" />
                    <div className="h-10 bg-[#1a1a1a] rounded w-1/2" />
                    <div className="h-16 bg-[#1a1a1a] rounded w-full" />
                </div>
            </div>

            {/* highlights Skeleton */}
            <div className="flex gap-4 md:gap-12 px-4 md:px-12 py-4">
                {[1, 2, 3, 4].map(n => (
                    <div key={n} className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 md:w-[77px] md:h-[77px] rounded-full bg-[#1a1a1a]" />
                        <div className="h-3 bg-[#1a1a1a] rounded w-10" />
                    </div>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="border-t border-[var(--border)] mt-2 h-12" />

            {/* Grid Skeleton */}
            <div className="grid grid-cols-3 gap-1 md:gap-[28px]">
                {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="aspect-square bg-[#1a1a1a]" />
                ))}
            </div>
        </div>
    );
}
