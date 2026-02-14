"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Sidebar } from './sidebar';
import { ThemeToggle } from '../theme-toggle';
import { usePathname } from 'next/navigation';
import { GripVertical } from 'lucide-react';

import { ChatInterface } from '../chat/chat-interface';

const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 900;
const DEFAULT_PANEL_WIDTH = 520;

export const AppShell = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const getTitle = () => {
        switch (pathname) {
            case '/': return 'Overview';
            case '/finance': return 'Financial Advisor';
            case '/weather': return 'Weather Agent';
            case '/schedule': return 'Schedule Agent';
            case '/health': return 'Health Agent';
            case '/shopping': return 'Shopping Assistant';
            default: return 'Agent';
        }
    };

    const agentId = pathname === '/' ? 'general' : pathname.substring(1);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        startX.current = e.clientX;
        startWidth.current = panelWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            // Moving left increases width (panel is on right side)
            const delta = startX.current - e.clientX;
            const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth.current + delta));
            setPanelWidth(newWidth);
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [panelWidth]);

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

                    {/* Resizable chat panel */}
                    <aside
                        className="relative border-l border-gray-200 dark:border-white/5 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm hidden xl:flex flex-col"
                        style={{ width: panelWidth }}
                    >
                        {/* Drag handle */}
                        <div
                            onMouseDown={handleMouseDown}
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-20 group flex items-center justify-center hover:bg-indigo-500/10 transition-colors"
                        >
                            <div className="w-1 h-10 rounded-full bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <ChatInterface agentId={agentId} />
                    </aside>
                </div>
            </div>
        </div>
    );
};
