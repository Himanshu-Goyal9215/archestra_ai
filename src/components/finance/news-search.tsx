"use client";

import React, { useState } from 'react';
import { Search, ArrowRight, ExternalLink, MessageSquare, Newspaper, TrendingUp, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/glass-card';
import { getSerperNews } from '@/app/actions/finance';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
    imageUrl?: string;
}

export const NewsSearch = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<NewsItem[]>([]);
    const [error, setError] = useState('');

    const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const searchQuery = overrideQuery || query;
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError('');
        // Don't clear results immediately if just refreshing, but here we clear to show loading state clearly
        setResults([]);

        try {
            const data = await getSerperNews(searchQuery);
            if (data.news && data.news.length > 0) {
                setResults(data.news);
            } else {
                setError('No news found for this topic.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch news. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAskAI = (item: NewsItem) => {
        const prompt = `Analyze this news: "${item.title}" from ${item.source}. Snippet: ${item.snippet}`;
        const event = new CustomEvent('archestra:chat-query', {
            detail: { query: prompt }
        });
        window.dispatchEvent(event);
    };

    return (
        <div className="space-y-6">
            <GlassCard className="w-full relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                            <Newspaper size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Market News Intelligence</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Real-time semantic search powered by Serper.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={(e) => handleSearch(e)} className="relative">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search companies, markets, or trends (e.g. 'Apple AI strategy')"
                            className="pl-4 pr-12 py-6 text-lg bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500 shadow-sm transition-all focus:bg-white dark:focus:bg-gray-800"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isSearching || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                            {isSearching ? (
                                <span className="animate-spin text-white">⟳</span>
                            ) : (
                                <Search size={20} />
                            )}
                        </Button>
                    </form>

                    <div className="flex gap-2 flex-wrap items-center">
                        <TrendingUp size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mr-1">Trending:</span>
                        {['NVDA Earnings', 'Fed Rate Decision', 'Crypto Regulation', 'Tech IPOs'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setQuery(tag);
                                    handleSearch(undefined, tag);
                                }}
                                className="text-xs px-2.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </GlassCard>

            {/* Results Area */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center text-sm border border-red-200 dark:border-red-900/30"
                    >
                        {error}
                    </motion.div>
                )}

                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-h-[600px] overflow-y-auto space-y-4 pr-1"
                    >
                        {results.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-5 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300 hover:bg-white/60 dark:hover:bg-gray-900/60"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20">{item.source}</span>
                                            <span>•</span>
                                            <span>{item.date}</span>
                                        </div>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            <h4 className="text-lg font-semibold leading-tight mb-2 text-gray-900 dark:text-gray-100">
                                                {item.title}
                                            </h4>
                                        </a>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                                            {item.snippet}
                                        </p>
                                    </div>
                                    {item.imageUrl && (
                                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 mt-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAskAI(item)}
                                        className="text-xs h-8 gap-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3"
                                    >
                                        <Sparkles size={14} />
                                        Ask AI Agent
                                    </Button>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group/link"
                                    >
                                        Read full story
                                        <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
