"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NavItem = ({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) => (
    <Link
        href={href}
        className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group ${active ? "font-bold" : "hover:bg-[var(--surface)] text-[var(--foreground)]"
            }`}
    >
        <span className={`text-2xl group-hover:scale-110 transition-transform ${active ? "scale-110" : ""}`}>{icon}</span>
        <span className="hidden xl:block text-base">{label}</span>
    </Link>
);

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navLinks = [
        { href: "/feed", label: "Home", icon: "🏠" },
        { href: "/search", label: "Search", icon: "🔍" },
        { href: "/friends/suggestions", label: "Explore", icon: "🧭" },
        { href: "/chat", label: "Messages", icon: "✈️" },
        { href: "/notifications", label: "Notifications", icon: "❤️" },
        { href: "/friends", label: "Friends", icon: "👥" },
    ];

    if (user) {
        navLinks.push({ href: `/profile/${user.id || user._id}`, label: "Profile", icon: "👤" });
    }

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-20 xl:w-64 border-r border-[var(--border)] h-screen sticky top-0 px-3 py-8 bg-[var(--background)]">
                <Link href="/feed" className="px-3 mb-10 block">
                    <span className="text-2xl font-bold xl:hidden italic">IG</span>
                    <span className="text-2xl font-bold hidden xl:block italic tracking-tighter">Instagram</span>
                </Link>

                <nav className="flex-1 flex flex-col gap-2">
                    {navLinks.map((link) => (
                        <NavItem
                            key={link.href}
                            href={link.href}
                            label={link.label}
                            icon={link.icon}
                            active={pathname === link.href}
                        />
                    ))}
                </nav>

                {user && (
                    <button
                        onClick={logout}
                        className="mt-auto px-3 py-3 flex items-center gap-4 hover:bg-[var(--danger-hover)] text-[var(--danger)] rounded-lg transition-colors group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">➡️</span>
                        <span className="hidden xl:block font-medium">Logout</span>
                    </button>
                )}
            </aside>

            {/* Mobile Top Header */}
            <header className="md:hidden flex justify-between items-center px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-50">
                <Link href="/feed" className="text-xl font-bold italic tracking-tighter">Instagram</Link>
                <div className="flex gap-4">
                    <Link href="/notifications" className="text-2xl">❤️</Link>
                    <Link href="/chat" className="text-2xl">✈️</Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
                <div className="max-w-[600px] mx-auto py-8 px-4 md:px-0">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden flex justify-around items-center border-t border-[var(--border)] fixed bottom-0 left-0 right-0 bg-[var(--background)] py-2 z-50">
                <Link href="/feed" className={`text-2xl p-2 ${pathname === "/feed" ? "opacity-100" : "opacity-60"}`}>🏠</Link>
                <Link href="/search" className={`text-2xl p-2 ${pathname === "/search" ? "opacity-100" : "opacity-60"}`}>🔍</Link>
                <Link href="/friends/suggestions" className={`text-2xl p-2 ${pathname === "/friends/suggestions" ? "opacity-100" : "opacity-60"}`}>🧭</Link>
                <Link href="/chat" className={`text-2xl p-2 ${pathname.startsWith("/chat") ? "opacity-100" : "opacity-60"}`}>✈️</Link>
                {user && (
                    <Link href={`/profile/${user.id || user._id}`} className={`text-2xl p-2 ${pathname.startsWith("/profile") ? "opacity-100" : "opacity-60"}`}>
                        👤
                    </Link>
                )}
            </nav>
        </div>
    );
}
