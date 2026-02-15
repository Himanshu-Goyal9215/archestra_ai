"use client";

import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Activity, Flame, Beef } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const HealthOverview = () => {
    const { user } = useAuth();
    const [totals, setTotals] = useState({ calories: 0, protein: 0 });
    const [loading, setLoading] = useState(true);

    const formatDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    useEffect(() => {
        if (!user) return;

        const today = formatDate(new Date());
        // Query daily meals
        const q = query(
            collection(db, 'meals'),
            where('user_id', '==', user.uid),
            where('date', '==', today)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => d.data());
            const newTotals = data.reduce(
                (acc: { calories: number; protein: number }, m: any) => ({
                    calories: acc.calories + (m.calories || 0),
                    protein: acc.protein + (m.protein || 0)
                }),
                { calories: 0, protein: 0 }
            );
            setTotals(newTotals);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Simple goals (hardcoded for now, could be dynamic)
    const GOAL_CALORIES = 2200;
    const GOAL_PROTEIN = 120;

    const calPct = Math.min((totals.calories / GOAL_CALORIES) * 100, 100);

    return (
        <GlassCard title="Health Status" delay={3} className="h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Intake</h3>
                    <div className="flex items-end gap-1.5 mt-0.5">
                        <span className="text-2xl font-bold text-orange-400">{Math.round(totals.calories)}</span>
                        <span className="text-xs text-gray-400 mb-1.5">/ {GOAL_CALORIES} kcal</span>
                    </div>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                    <Activity size={24} />
                </div>
            </div>

            <div className="space-y-4">
                {/* Calories Progress */}
                <div>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-orange-400">{Math.round(calPct)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-orange-500 transition-all duration-1000"
                            style={{ width: `${calPct}%` }}
                        ></div>
                    </div>
                </div>

                {/* Macros Mini Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Flame size={14} className="text-orange-400" />
                            <span className="text-xs text-gray-500">Calories</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(totals.calories)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Beef size={14} className="text-rose-400" />
                            <span className="text-xs text-gray-500">Protein</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{totals.protein.toFixed(0)}g</p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
