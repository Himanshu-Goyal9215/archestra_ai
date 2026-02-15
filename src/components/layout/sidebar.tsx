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
        <div className="h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col p-4 text-white">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="font-bold text-sm">A</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">Archestra AI</h1>
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
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-600/10 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon size={20} className={cn(isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white')} />
                            <span className="relative font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-6 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all hover:bg-white/5">
                    <Settings size={20} />
                    <span className="font-medium">Settings</span>
                </Button>
                <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl bg-white/5 border border-white/5">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-white truncate">{user?.displayName || 'User'}</span>
                        <span className="text-xs text-gray-400 truncate">{user?.email || 'Pro Plan'}</span>
                    </div>
                    <button
                        onClick={signOut}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Sign out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
