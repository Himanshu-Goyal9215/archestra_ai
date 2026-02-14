"use client";

import React from 'react';
import GlassCard from '@/components/ui/glass-card';
import { CloudSun, Thermometer, Wind, Droplets } from 'lucide-react';

const WeatherAgent: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard title="Current Weather" delay={1}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500">
                            <CloudSun size={32} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">--°C</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ask for a city to get weather</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Wind" delay={2}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500">
                            <Wind size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">-- km/h</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Wind speed</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Humidity" delay={3}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Droplets size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">--%</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Relative humidity</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard title="Forecast" delay={4}>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="text-center">
                        <Thermometer size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Ask the Weather Agent for a forecast</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default WeatherAgent;
