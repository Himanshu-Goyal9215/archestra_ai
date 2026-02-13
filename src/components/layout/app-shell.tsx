"use client";

import React from 'react';
import { Sidebar } from './sidebar';
import { ThemeToggle } from '../theme-toggle';
import { usePathname } from 'next/navigation';

import { ChatInterface } from '../chat/chat-interface';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    const getTitle = () => {
        switch (pathname) {
            case '/': return 'Overview';
            case '/finance': return 'Finance Agent';
            case '/schedule': return 'Schedule Agent';
            case '/health': return 'Health Agent';
            case '/shopping': return 'Shopping Assistant';
            default: return 'Agent';
        }
    };

    // Extract agent ID from pathname, removing leading slash
    const agentId = pathname === '/' ? 'general' : pathname.substring(1);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between px-8 py-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-white/5 z-10">
                    <h2 className="text-2xl font-bold capitalize">
                        {getTitle()}
                    </h2>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                                <span className="font-bold text-xs">US</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                    <aside className="w-[400px] border-l border-gray-200 dark:border-white/5 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm hidden xl:block">
                        <ChatInterface agentId={agentId} />
                    </aside>
                </div>
            </div>
        </div>
    );
};
