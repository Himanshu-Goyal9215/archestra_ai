"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Clock, ArrowRight, Bot, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import { useRouter } from 'next/navigation';

interface ChatSession {
    id: string;
    agentId: string;
    title: string;
    updatedAt: Timestamp;
    messages: any[];
}

const AGENT_TABS = [
    { id: 'finance', label: 'Financial Advisor', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'weather', label: 'Weather Agent', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'schedule', label: 'Schedule Agent', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'health', label: 'Health Agent', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'general', label: 'General Agent', color: 'text-gray-500', bg: 'bg-gray-500/10' },
];

export const OverviewChats = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('finance');
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        setLoading(true);
        // We query the specific collection for the active agent
        // Note: 'chats_finance', 'chats_weather', etc.
        const collectionName = `chats_${activeTab}`;

        // Simple query first to avoid index issues. Client-side sort.
        const q = query(
            collection(db, collectionName),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatSession[];

            // Sort by updatedAt desc
            data.sort((a, b) => {
                const tA = a.updatedAt?.toMillis() || 0;
                const tB = b.updatedAt?.toMillis() || 0;
                return tB - tA;
            });

            setChats(data.slice(0, 5)); // Show top 5
            setLoading(false);
        }, (err) => {
            console.error("Failed to fetch chats:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid, activeTab]);

    const handleRestoreChat = (chat: ChatSession) => {
        // Save pending restore intent
        localStorage.setItem('archestra_pending_restore', JSON.stringify({
            chatId: chat.id,
            messages: chat.messages,
            agentId: chat.agentId
        }));

        // Navigate to the agent's dashboard
        // If the agent is 'general' (or matches the general UUID), go to /dashboard (root overview)
        // Otherwise go to /dashboard/[agent]
        // We use activeTab to know which agent context we are in
        if (activeTab === 'general') {
            router.push('/dashboard');
        } else {
            router.push(`/dashboard/${activeTab}`);
        }
    };

    return (
        <GlassCard title="Recent Conversations" delay={4} className="h-full">
            <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {AGENT_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? `${tab.bg} ${tab.color} ring-1 ring-inset ring-current`
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 space-y-3 min-h-[200px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-xs">
                            Loading history...
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <Bot className="mb-2 opacity-20" size={32} />
                            <p className="text-sm">No recent conversations</p>
                            <p className="text-xs mt-1">Chat with the {AGENT_TABS.find(t => t.id === activeTab)?.label} to verify.</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => handleRestoreChat(chat)}
                                className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-full ${AGENT_TABS.find(t => t.id === activeTab)?.bg} ${AGENT_TABS.find(t => t.id === activeTab)?.color}`}>
                                        <MessageSquare size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate pr-2">
                                            {chat.title || 'New Conversation'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                            <Clock size={10} />
                                            <span>
                                                {chat.updatedAt ? formatDistanceToNow(chat.updatedAt.toDate(), { addSuffix: true }) : 'Just now'}
                                            </span>
                                            <span>•</span>
                                            <span>{chat.messages?.length || 0} msgs</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </GlassCard>
    );
};
