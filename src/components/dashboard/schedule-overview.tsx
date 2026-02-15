"use client";

import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    description?: string;
    completed: boolean;
}

export const ScheduleOverview = () => {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    const fetchTodaySchedule = async () => {
        try {
            // Fetch events for "today"
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`/api/schedule?date=${today}`);
            if (!res.ok) throw new Error('Failed to fetch schedule');

            const data: ScheduleEvent[] = await res.json();

            // Sort by time
            const sorted = data.sort((a, b) => a.time.localeCompare(b.time));

            setEvents(sorted.slice(0, 2)); // Latest 2 meets (next up or all if today)
            setStats({
                total: data.length,
                pending: data.filter(e => !e.completed).length
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodaySchedule();
    }, []);

    const formatTime12 = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    return (
        <GlassCard title="Today's Schedule" delay={2} className="h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks & Meetings</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {stats.total} <span className="text-sm font-normal text-gray-400">Scheduled</span>
                    </p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <Calendar size={24} />
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-10 bg-gray-100 dark:bg-gray-800/50 rounded-lg"></div>
                        <div className="h-10 bg-gray-100 dark:bg-gray-800/50 rounded-lg"></div>
                    </div>
                ) : events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((ev, i) => (
                            <div key={ev.id} className="flex items-start gap-3 relative pl-3">
                                {/* Timeline line */}
                                {i !== events.length - 1 && (
                                    <div className="absolute left-[15px] top-6 bottom-[-12px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                )}
                                <div className={`relative z-10 w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${ev.completed ? 'bg-emerald-400' : 'bg-indigo-500'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${ev.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                        {ev.title}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock size={10} />
                                        {formatTime12(ev.time)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No events scheduled today.</p>
                )}
            </div>

            {stats.pending > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 text-xs text-orange-400">
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                    {stats.pending} tasks remaining
                </div>
            )}
        </GlassCard>
    );
};
