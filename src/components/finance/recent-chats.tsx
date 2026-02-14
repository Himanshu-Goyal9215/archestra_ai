"use client";

import React, { useEffect, useState } from 'react';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import GlassCard from '@/components/ui/glass-card';

interface ChatHistoryItem {
    id: string;
    title: string;
    timestamp: string;
    agentId: string;
    messages?: Array<{ id: string; role: string; content: string }>;
}

export const RecentChats = () => {
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);

    const loadHistory = () => {
        try {
            const stored = localStorage.getItem('archestra_recent_chats');
            if (stored) {
                const parsed = JSON.parse(stored);
                setHistory(parsed.slice(0, 10));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadHistory();
        window.addEventListener('archestra:history-updated', loadHistory);
        return () => window.removeEventListener('archestra:history-updated', loadHistory);
    }, []);

    const handleResumeChat = (chat: ChatHistoryItem) => {
        if (chat.messages && chat.messages.length > 0) {
            // Restore the full conversation
            const event = new CustomEvent('archestra:chat-restore', {
                detail: { messages: chat.messages }
            });
            window.dispatchEvent(event);
        }
        // Old entries without messages — just populate input field
        else {
            const event = new CustomEvent('archestra:chat-query', {
                detail: { query: chat.title }
            });
            window.dispatchEvent(event);
        }
    };

    if (history.length === 0) {
        return (
            <GlassCard title="Recent Chats">
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <MessageSquare className="mx-auto mb-3 opacity-20" size={48} />
                    <p>No recent chats yet.</p>
                    <p className="text-sm mt-1">Start a conversation to see history here.</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard title="Recent Chats">
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {history.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => handleResumeChat(chat)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-transparent hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:text-indigo-500 transition-colors">
                                <MessageSquare size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate pr-4 text-gray-900 dark:text-gray-100">
                                    {chat.title}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock size={10} />
                                    <span>
                                        {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                            <ArrowRight size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};
