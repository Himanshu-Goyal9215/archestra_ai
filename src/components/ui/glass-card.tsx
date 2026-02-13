"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, title, className = '', delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className={cn(
                "bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden",
                className
            )}
        >
            {title && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
