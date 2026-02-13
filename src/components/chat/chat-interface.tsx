"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';

export function ChatInterface({ agentId }: { agentId: string }) {
    // @ts-expect-error - overriding types for v6 compatibility
    const { messages, sendMessage, isLoading, append } = useChat({
        api: '/api/chat',
        body: { agentId },
    } as any);

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setInput('');

        // Try append first (standard), then sendMessage
        if (append) {
            await append(userMessage as any);
        } else if (sendMessage) {
            await sendMessage(userMessage as any);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white/50 dark:bg-gray-900/50">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Chat with {agentId}</h3>
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        <Bot className="mx-auto mb-2 opacity-50" size={32} />
                        <p>How can I help you today?</p>
                    </div>
                )}
                {messages.map((m: any) => (
                    <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role !== 'user' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
                            }`}>
                            {m.content}
                        </div>
                        {m.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                <User size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 ml-12">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                        <Send size={16} />
                    </Button>
                </div>
            </form>
        </div>
    );
}
