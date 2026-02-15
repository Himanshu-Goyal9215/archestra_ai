"use client";

import React from 'react';
import { Home, LineChart, Calendar, Activity, Settings, CloudSun, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const menuItems = [
        { href: '/dashboard', label: 'Overview', icon: Home },
        { href: '/dashboard/finance', label: 'Financial Advisor', icon: LineChart },
        { href: '/dashboard/weather', label: 'Weather Agent', icon: CloudSun },
        { href: '/dashboard/schedule', label: 'Schedule Agent', icon: Calendar },
        { href: '/dashboard/health', label: 'Health Agent', icon: Activity },
    ];

    return (
        <div className="h-screen w-64 bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col p-4 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <span className="font-bold text-sm">A</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Archestra AI</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-100 dark:bg-blue-600/10 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon size={20} className={cn(isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white')} />
                            <span className="relative font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10 space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-6 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </Button>
                <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.displayName || 'User'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Pro Plan'}</span>
                    </div>
                    <button
                        onClick={signOut}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Sign out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
