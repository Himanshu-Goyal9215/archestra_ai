"use client";

import React from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Activity, Flame, Heart, Utensils, Dumbbell } from 'lucide-react';

const HealthAgent: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard delay={1} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Steps Today</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">8,432</h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500">
                            <span className="bg-emerald-500/10 px-2 py-1 rounded-md">+12% vs yesterday</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard delay={2} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Flame size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Calories Burned</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">420 <span className="text-lg text-gray-400 font-normal">kcal</span></h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-orange-500">
                            <span className="bg-orange-500/10 px-2 py-1 rounded-md">On track</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard delay={3} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Heart size={100} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Heart Rate</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">72 <span className="text-lg text-gray-400 font-normal">bpm</span></h3>
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-500">
                            <span className="bg-blue-500/10 px-2 py-1 rounded-md">Resting</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard title="Today's Meal Plan" delay={4}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                                <Utensils size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Breakfast</p>
                                <p className="text-sm text-gray-500">Oatmeal with berries & nuts</p>
                            </div>
                            <div className="ml-auto text-sm font-medium text-gray-500">450 kcal</div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                <Utensils size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Lunch</p>
                                <p className="text-sm text-gray-500">Grilled chicken salad</p>
                            </div>
                            <div className="ml-auto text-sm font-medium text-gray-500">600 kcal</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Workout Routine" delay={5}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border-l-4 border-blue-500">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                <Dumbbell size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Upper Body Strength</p>
                                <p className="text-sm text-gray-500">45 mins • High Intensity</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">3</p>
                                <p className="text-xs text-gray-500 uppercase">Sets</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-xs text-gray-500 uppercase">Reps</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">20</p>
                                <p className="text-xs text-gray-500 uppercase">Kg</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default HealthAgent;
