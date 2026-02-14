"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import { getTrendingTopics } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TrendItem {
    term: string;
    value: string;
    link?: string;
}

export const TrendsWidget = () => {
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTrends = async () => {
        setIsLoading(true);
        try {
            const data = await getTrendingTopics();
            if (data && data.length > 0) {
                setTrends(data);
            } else {
                // Fallback if no data returned
                setTrends([
                    { term: "AI Regulation", value: "Breakout" },
                    { term: "Interest Rates", value: "Trending" },
                    { term: "Tech Sector", value: "Hot" },
                    { term: "Energy Stocks", value: "Trending" },
                    { term: "Crypto ETFs", value: "New Highs" },
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch trends:", err);
            setTrends([
                { term: "AI Regulation", value: "Breakout" },
                { term: "Interest Rates", value: "Trending" },
                { term: "Tech Sector", value: "Hot" },
                { term: "Energy Stocks", value: "Trending" },
                { term: "Crypto ETFs", value: "New Highs" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
    }, []);

    const handleAskAI = (term: string) => {
        const event = new CustomEvent('archestra:chat-query', {
            detail: { query: `What is the latest trend regarding "${term}" and how might it affect the market?` }
        });
        window.dispatchEvent(event);
    };

    return (
        <GlassCard className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" />
                    <h3 className="font-semibold text-lg">Trending Now</h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchTrends}
                    disabled={isLoading}
                    className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    title="Refresh trends"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700/50 rounded-lg w-full"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {trends.map((trend, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer"
                            onClick={() => handleAskAI(trend.term)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-5 text-center shrink-0">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{trend.term}</p>
                                    <span className="text-xs text-emerald-500 font-medium flex items-center gap-0.5">
                                        <TrendingUp size={10} />
                                        {trend.value}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {trend.link && (
                                    <a
                                        href={trend.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                                    >
                                        <ExternalLink size={12} />
                                    </a>
                                )}
                                <div className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-all">
                                    <Sparkles size={14} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </GlassCard>
    );
};
