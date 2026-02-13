"use client";

import React, { useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import { DollarSign, PieChart, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

const FinanceAgent: React.FC = () => {
    const [capital, setCapital] = useState('');
    const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard title="Investment Parameters" className="lg:col-span-1" delay={1}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Capital</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    value={capital}
                                    onChange={(e) => setCapital(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Tolerance</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['low', 'medium', 'high'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setRisk(level)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${risk === level
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                            Analyze Portfolio <ArrowRight size={16} />
                        </button>
                    </div>
                </GlassCard>

                <GlassCard title="Portfolio Analysis" className="lg:col-span-2" delay={2}>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="text-center">
                            <PieChart size={48} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">Enter your capital and risk settings to see analysis</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard title="Recommended Strategy" delay={3}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Balanced Growth</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Based on your medium risk profile, we recommend a diversified mix of 60% equities and 40% bonds.
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Risk Assessment" delay={4}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Moderate Volatility</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Expect some market fluctuations. Ensure you have an emergency fund separate from this investment.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default FinanceAgent;
