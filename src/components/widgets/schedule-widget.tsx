"use client";

import React from 'react';
import { Clock, CheckSquare, CalendarDays } from 'lucide-react';

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    description?: string;
    completed: boolean;
}

interface ScheduleWidgetProps {
    events: ScheduleEvent[];
    dateLabel?: string;
}

export function ScheduleWidget({ events, dateLabel }: ScheduleWidgetProps) {
    const formatTime12 = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm max-w-sm">
            <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={16} className="text-indigo-500" />
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                    {dateLabel || 'Schedule'}
                </span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
                    {events.length} events
                </span>
            </div>

            {events.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No events scheduled</p>
            ) : (
                <div className="space-y-2">
                    {events.map(event => (
                        <div
                            key={event.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                        >
                            <CheckSquare
                                size={16}
                                className={event.completed ? 'text-emerald-500' : 'text-gray-400'}
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${event.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {event.title}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0">
                                <Clock size={10} />
                                {formatTime12(event.time)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
