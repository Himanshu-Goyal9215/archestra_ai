"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { PERSONAS } from '@/hooks/use-archestra-chat';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function ChatInterface({ agentId }: { agentId: string }) {
    const realAgentId = (PERSONAS as any)[agentId] || agentId;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(input ?? '').trim() || isLoading) return;

        const text = input.trim();
        const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: text }],
                    agentId: realAgentId,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                const assistantMsg: ChatMessage = {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    content: `Error: ${res.status} - ${errText}`,
                };
                setMessages(prev => [...prev, assistantMsg]);
                return;
            }

            const responseText = await res.text();
            let fullText = '';

            for (const line of responseText.split('\n')) {
                if (line.startsWith('0:')) {
                    try {
                        const jsonStr = line.slice(2);
                        fullText += JSON.parse(jsonStr);
                    } catch {
                        fullText += line.slice(2);
                    }
                }
            }

            if (fullText) {
                const assistantMsg: ChatMessage = {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    content: fullText,
                };
                setMessages(prev => [...prev, assistantMsg]);
            }
        } catch (err: any) {
            console.error("Failed to send message:", err);
            const errMsg: ChatMessage = {
                id: `e-${Date.now()}`,
                role: 'assistant',
                content: `Error: ${err.message || 'Failed to connect'}`,
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, realAgentId]);

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
                {messages.map((m) => (
                    <div key={m.id} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex gap-3 max-w-[95%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {m.role !== 'user' && (
                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 mt-1">
                                    <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}
                            {m.role === 'user' && (
                                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 mt-1">
                                    <User size={14} className="text-blue-600 dark:text-blue-400" />
                                </div>
                            )}

                            <div className={`p-3 rounded-2xl text-sm ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'
                                }`}>
                                {m.role === 'user' ? (
                                    <div className="whitespace-pre-wrap">{m.content}</div>
                                ) : (
                                    <div className="chat-markdown">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 ml-10">
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
                        placeholder={`Message ${agentId}...`}
                        className="flex-1 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input?.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                        <Send size={16} />
                    </Button>
                </div>
            </form>
        </div>
    );
}
