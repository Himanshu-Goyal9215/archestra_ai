"use client";

import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import { TrendingUp, RefreshCw, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FinancialOverview = () => {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: 'List top 5 finance-related trending keywords right now. Respond ONLY with a JSON array of strings, e.g. ["Bitcoin", "Nvidia"]. No markdown, no explanation.'
                    }],
                    agentId: process.env.NEXT_PUBLIC_GOOGLE_TRENDS_AGENT_ID // Google Trends Agent
                }),
            });

            if (!res.ok) throw new Error('Failed to fetch');

            const text = await res.text();
            // Parse generic chat response wrapper if needed (usually 0:"...")
            // Similar logic to chat-interface
            let fullText = '';
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.startsWith('0:')) {
                    try {
                        fullText += JSON.parse(line.slice(2));
                    } catch {
                        fullText += line.slice(2);
                    }
                }
            }

            const cleanText = fullText.trim().replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);

            if (Array.isArray(parsed)) {
                setKeywords(parsed.slice(0, 5));
            }
        } catch (e) {
            console.error(e);
            // Fallback
            setKeywords(['Market Analysis', 'Crypto Trends', 'Tech Stocks', 'Interest Rates', 'Global Economy']);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
    }, []);

    return (
        <GlassCard title="Market Pulse" delay={1} className="h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Top Trending Keywords</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Activity className="text-emerald-500" size={20} />
                        <span className="text-xs text-emerald-500 font-medium">Live from Google Trends</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchTrends}
                    disabled={loading}
                    className="h-8 w-8"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </Button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword, i) => (
                            <div
                                key={i}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700/50 flex items-center gap-2"
                            >
                                <TrendingUp size={12} className="text-blue-500" />
                                {keyword}
                            </div>
                        ))}
                    </div>
                )}
                {!loading && keywords.length === 0 && (
                    <p className="text-sm text-gray-400">No trends found.</p>
                )}
            </div>

            {/* "Ask Advisor" shortcut */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                <p className="text-xs text-gray-400 mb-2">Ask Financial Advisor:</p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('archestra:chat-query', {
                                detail: { query: 'Analyze the current market sentiment based on top trends.' }
                            }));
                        }}
                    >
                        Analyze Market
                    </Button>
                </div>
            </div>
        </GlassCard>
    );
};
