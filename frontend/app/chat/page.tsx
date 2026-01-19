"use client";
import React, { useState, useEffect } from 'react';
import Layout from '@/shared/components/Layout';
import api from '@/services/api.service';
import Link from 'next/link';

export default function ChatBasePage() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await api.get('/chat/contacts');
                setContacts(res.data);
            } catch (err) {
                console.error('Failed to fetch contacts', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    return (
        <Layout>
            <div className="max-w-[1000px] mx-auto h-[calc(100vh-100px)] border border-[var(--border)] bg-white flex mt-4 overflow-hidden rounded-sm">
                <div className="w-full md:w-[350px] border-r border-[var(--border)] flex flex-col">
                    <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                        <span className="font-bold">Messages</span>
                        <button className="text-xl">📝</button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="flex gap-3 animate-pulse">
                                        <div className="w-12 h-12 rounded-full bg-[var(--surface)]" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 bg-[var(--surface)] w-1/2 rounded" />
                                            <div className="h-2 bg-[var(--surface)] w-3/4 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {contacts.map((contact) => (
                                    <Link
                                        key={contact._id}
                                        href={`/chat/${contact._id}`}
                                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-bold">
                                            {contact.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{contact.fullName}</p>
                                            <p className="text-xs text-[var(--secondary)]">@{contact.username}</p>
                                        </div>
                                    </Link>
                                ))}
                                {contacts.length === 0 && (
                                    <div className="p-8 text-center text-[var(--secondary)]">
                                        <p>No messages yet.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4">
                    <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center text-4xl">
                        ✉️
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-light">Your Messages</h2>
                        <p className="text-[var(--secondary)] text-sm mt-1">Send private photos and messages to a friend.</p>
                    </div>
                    <button className="bg-[var(--primary)] text-white px-4 py-1.5 rounded-lg font-bold text-sm">
                        Send Message
                    </button>
                </div>
            </div>
        </Layout>
    );
}
