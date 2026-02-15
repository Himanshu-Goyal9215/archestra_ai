"use client";

import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Clock, CheckSquare, Plus, Trash2, X, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    description?: string;
    completed: boolean;
}

import { useAuth } from '@/contexts/auth-context';

export default function SchedulePage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('09:00');
    const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(false);

    const [viewDate, setViewDate] = useState(new Date());

    // Fetch events for the selected date
    const fetchEvents = useCallback(async () => {
        if (!user?.uid) return;
        const res = await fetch(`/api/schedule?date=${selectedDate}&userId=${user.uid}`);
        const data = await res.json();
        setEvents(data);
    }, [selectedDate, user?.uid]);

    // Fetch ALL events for the current month (for badge counts)
    const fetchAllEvents = useCallback(async () => {
        if (!user?.uid) return;
        const res = await fetch(`/api/schedule?userId=${user.uid}`);
        const data = await res.json();
        setAllEvents(data);
    }, [user?.uid]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);
    useEffect(() => { fetchAllEvents(); }, [fetchAllEvents]);

    // Count events per date for badges
    const eventCountByDate: Record<string, number> = {};
    allEvents.forEach(ev => {
        eventCountByDate[ev.date] = (eventCountByDate[ev.date] || 0) + 1;
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !user?.uid) return;
        setLoading(true);
        await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.uid,
                title: newTitle.trim(),
                date: selectedDate,
                time: newTime,
                description: newDesc.trim() || undefined,
            }),
        });
        setNewTitle('');
        setNewTime('09:00');
        setNewDesc('');
        setShowForm(false);
        setLoading(false);
        fetchEvents();
        fetchAllEvents();
    };

    const handleToggle = async (id: string, completed: boolean) => {
        if (!user?.uid) return;
        await fetch('/api/schedule', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, userId: user.uid, completed: !completed }),
        });
        fetchEvents();
    };

    const handleDelete = async (id: string) => {
        if (!user?.uid) return;
        await fetch(`/api/schedule?id=${id}&userId=${user.uid}`, { method: 'DELETE' });
        fetchEvents();
        fetchAllEvents();
    };

    // Calendar helpers
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const formatDateStr = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const formatTime12 = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const selectedDateLabel = selectedDate === todayStr
        ? "Today's Tasks"
        : `Tasks for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;

    return (
        <div className="space-y-6">
            {/* Calendar — full width on top */}
            <GlassCard title="" delay={1}>
                <div className="flex items-center justify-between mb-5">
                    <button
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors text-lg"
                    >
                        ←
                    </button>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <CalendarDays size={22} className="text-indigo-500" />
                        {monthName}
                    </h3>
                    <button
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors text-lg"
                    >
                        →
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-medium text-gray-400 uppercase py-1">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, i) => {
                        if (day === null) return <div key={`empty-${i}`} />;
                        const dateStr = formatDateStr(day);
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === todayStr;
                        const count = eventCountByDate[dateStr] || 0;

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200
                                    ${isSelected
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                        : isToday
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-300 dark:ring-indigo-600'
                                            : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {day}
                                {count > 0 && (
                                    <span
                                        className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none px-1
                                            ${isSelected
                                                ? 'bg-white text-indigo-600 shadow-md'
                                                : 'bg-indigo-500 text-white shadow-sm shadow-indigo-400/40'
                                            }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Tasks — below the calendar */}
            <GlassCard title="" delay={2}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                        {selectedDateLabel}
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {events.length}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[304px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}>
                    {events.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6 col-span-full">No events for this date</p>
                    )}
                    {events
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(event => (
                            <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group transition-all hover:shadow-md">
                                <button
                                    onClick={() => handleToggle(event.id, event.completed)}
                                    className={`mt-0.5 shrink-0 ${event.completed ? 'text-emerald-500' : 'text-gray-400 hover:text-indigo-500'} transition-colors`}
                                >
                                    <CheckSquare size={20} />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${event.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                        {event.title}
                                    </p>
                                    {event.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{event.description}</p>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Clock size={12} />
                                        {formatTime12(event.time)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                </div>

                {/* Add Task Form */}
                {showForm ? (
                    <form onSubmit={handleAdd} className="mt-4 space-y-3 p-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">New Event</span>
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>
                        <Input
                            placeholder="Event title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="text-sm"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="text-sm w-32"
                            />
                            <Input
                                placeholder="Description (optional)"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="text-sm flex-1"
                            />
                        </div>
                        <Button type="submit" disabled={loading || !newTitle.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
                            {loading ? 'Adding...' : 'Add Event'}
                        </Button>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-indigo-500 hover:border-indigo-400 transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Event</span>
                    </button>
                )}
            </GlassCard>
        </div>
    );
}
