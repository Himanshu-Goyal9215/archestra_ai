"use client";

import React from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Clock, CheckSquare, Plus } from 'lucide-react';

const ScheduleAgent: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard title="Calendar" className="lg:col-span-2" delay={1}>
                {/* Placeholder for a real calendar component */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs font-medium text-gray-400 uppercase">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-sm
                    ${i === 15 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}
                `}>
                            {i + 1 <= 31 ? i + 1 : ''}
                        </div>
                    ))}
                </div>
            </GlassCard>

            <div className="space-y-6 lg:col-span-1">
                <GlassCard title="Today's Tasks" delay={2}>
                    <div className="space-y-3">
                        {[
                            { title: 'Project Review', time: '10:00 AM', completed: true },
                            { title: 'Client Meeting', time: '02:00 PM', completed: false },
                            { title: 'Workout', time: '06:00 PM', completed: false },
                        ].map((task, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <div className={`text-${task.completed ? 'emerald' : 'gray'}-500`}>
                                    <CheckSquare size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={12} />
                                        {task.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-blue-500 hover:border-blue-500 transition-colors">
                        <Plus size={16} />
                        <span>Add Task</span>
                    </button>
                </GlassCard>
            </div>
        </div>
    );
};

export default ScheduleAgent;
