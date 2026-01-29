"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Home, Search, Compass, PlayCircle, MessageCircle, Heart, PlusSquare, User, MoreHorizontal, Menu, LogOut } from 'lucide-react';

const NavItem = ({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) => (
    <Link
        href={href}
        className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group ${active
            ? "font-bold"
            : "hover:bg-white/5 text-[var(--foreground)]"
            }`}
    >
        <span className="transition-transform group-hover:scale-105">
            <Icon size={24} strokeWidth={active ? 3 : 2} fill={active && (label === "Home" || label === "Messages" || label === "Notifications") ? "currentColor" : "none"} />
        </span>
        <span className="hidden xl:block text-[16px] tracking-tight">{label}</span>
    </Link>
);

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navLinks = [
        { href: "/feed", label: "Home", icon: Home },
        { href: "/search", label: "Search", icon: Search },
        { href: "/explore", label: "Explore", icon: Compass },
        { href: "/reels", label: "Reels", icon: PlayCircle },
        { href: "/chat", label: "Messages", icon: MessageCircle },
        { href: "/notifications", label: "Notifications", icon: Heart },
        { href: "/create", label: "Create", icon: PlusSquare },
    ];

    if (user) {
        navLinks.push({ href: `/profile/${user.id || user._id}`, label: "Profile", icon: User });
    }

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row font-sans text-[var(--foreground)]">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[72px] xl:w-[245px] border-r border-[var(--border)] h-screen sticky top-0 px-3 py-8 bg-[var(--background)] z-50">
                <Link href="/feed" className="px-3 mb-10 block">
                    <span className="text-2xl font-black xl:hidden">
                        <svg aria-label="Instagram" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M12 2.047a9.953 9.953 0 1 0 9.953 9.953A9.965 9.965 0 0 0 12 2.047zm5.545 13.565a.556.556 0 0 1-.418.175H6.873a.556.556 0 0 1-.418-.175.589.589 0 0 1-.16-.423v-5.228c0-.166.053-.306.16-.423a.556.556 0 0 1 .418-.175h10.254c.166 0 .306.058.418.175a.589.589 0 0 1 .16.423v5.228a.589.589 0 0 1-.16.423z"></path></svg>
                    </span>
                    <span className="text-2xl font-serif hidden xl:block tracking-tight italic">Instagram</span>
                </Link>

                <nav className="flex-1 flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <NavItem
                            key={link.href}
                            href={link.href}
                            label={link.label}
                            icon={link.icon}
                            active={pathname === link.href || (link.href !== "/feed" && pathname.startsWith(link.href))}
                        />
                    ))}
                </nav>

                <div className="mt-auto flex flex-col gap-1">
                    <button
                        onClick={logout}
                        className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/5 transition-all duration-200 group text-[#ed4956]"
                    >
                        <LogOut size={24} />
                        <span className="hidden xl:block text-[16px]">Logout</span>
                    </button>
                    <button className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/5 transition-all duration-200 group">
                        <Menu size={24} />
                        <span className="hidden xl:block text-[16px]">More</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Top Header */}
            <header className="md:hidden flex justify-between items-center px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-50">
                <Link href="/feed" className="text-xl font-serif">Instagram</Link>
                <div className="flex gap-4 items-center">
                    <Link href="/notifications"><Heart size={24} /></Link>
                    <Link href="/chat"><MessageCircle size={24} /></Link>
                    <button onClick={logout} className="text-[#ed4956]"><LogOut size={22} /></button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-0 overflow-y-auto bg-[var(--background)]">
                <div className="max-w-[1000px] mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden flex justify-around items-center border-t border-[var(--border)] fixed bottom-0 left-0 right-0 bg-[var(--background)] py-3 z-50 px-4">
                <Link href="/feed" className={`transition-all ${pathname === "/feed" ? "scale-110" : "opacity-100"}`}><Home size={26} fill={pathname === "/feed" ? "currentColor" : "none"} /></Link>
                <Link href="/search" className={`transition-all ${pathname === "/search" ? "scale-110" : "opacity-100"}`}><Search size={26} strokeWidth={pathname === "/search" ? 3 : 2} /></Link>
                <Link href="/explore" className={`transition-all ${pathname === "/explore" ? "scale-110" : "opacity-100"}`}><Compass size={26} /></Link>
                <Link href="/chat" className={`transition-all ${pathname.startsWith("/chat") ? "scale-110" : "opacity-100"}`}><MessageCircle size={26} /></Link>
                {user && (
                    <Link href={`/profile/${user.id || user._id}`} className={`transition-all ${pathname.startsWith("/profile") ? "scale-110" : "opacity-100"}`}>
                        <div className={`w-8 h-8 ig-avatar-ring !p-[1px] ${pathname.startsWith("/profile") ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}>
                            <div className="ig-avatar-inner border-[1px]">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/${user.profilePicture.replace(/\\/g, '/')}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={14} className="text-[var(--secondary)]" />
                                )}
                            </div>
                        </div>
                    </Link>
                )}
            </nav>

            {/* Floating Messages Widget (Desktop) */}
            <div className="hidden md:flex fixed bottom-0 right-5 w-[288px] bg-[#121212] border border-[var(--border)] border-b-0 rounded-t-xl overflow-hidden shadow-2xl z-[100] cursor-pointer hover:bg-[var(--surface-hover)] transition-all">
                <div className="flex items-center justify-between w-full px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-black overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80" alt="" />
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-black overflow-hidden relative z-10">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80" alt="" />
                                </div>
                            </div>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ed4956] text-[10px] font-bold text-white border border-black">5</span>
                        </div>
                        <span className="text-sm font-bold tracking-tight">Messages</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                        <svg aria-label="New Message" fill="currentColor" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M12.202 3.203H5.202a3 3 0 0 0-3 3V18.8a3 3 0 0 0 3 3h13.598a3 3 0 0 0 3-3V11.8a1 1 0 0 0-2 0V18.8a1 1 0 0 1-1 1H5.202a1 1 0 0 1-1-1V6.203a1 1 0 0 1 1-1h7a1 1 0 0 0 0-2Z"></path><path d="M22.542 2.725a1.485 1.485 0 0 0-2.099 0L12.05 11.119l-.531 3.183 3.183-.531 8.394-8.391a1.485 1.485 0 0 0 0-2.099l-1.054-1054Z"></path></svg>
                        <svg aria-label="Chevron up" fill="currentColor" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"></path></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
