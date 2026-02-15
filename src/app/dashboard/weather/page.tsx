"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    CloudSun, Wind, Droplets, Thermometer, Search,
    Clock, Globe, CalendarDays, Gauge, MapPin,
    Sunrise, Sunset, Eye, CloudRain, Sun, RefreshCw
} from 'lucide-react';
import { getCurrentWeather, getForecast, type WeatherData, type ForecastData } from '@/app/actions/weather';
import { motion, AnimatePresence } from 'framer-motion';

const WeatherAgent: React.FC = () => {
    const [city, setCity] = useState('New Delhi');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [now, setNow] = useState(new Date());

    const fetchWeather = async (q: string) => {
        if (!q.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const [currentData, forecastData] = await Promise.all([
                getCurrentWeather(q),
                getForecast(q, 3),
            ]);
            setWeather(currentData);
            setForecast(forecastData);
        } catch (err) {
            console.error(err);
            setError('Could not fetch weather. Check the city name.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(city);
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchWeather(city);
    };

    const cur = weather?.current;
    const loc = weather?.location;
    const aqi = cur?.air_quality;
    const astro = forecast?.forecast?.forecastday?.[0]?.astro;
    const todayForecast = forecast?.forecast?.forecastday?.[0]?.day;

    const getAqiLabel = (index?: number) => {
        if (!index) return { label: '--', color: 'text-gray-400' };
        if (index <= 1) return { label: 'Good', color: 'text-green-500' };
        if (index <= 2) return { label: 'Moderate', color: 'text-yellow-500' };
        if (index <= 3) return { label: 'Unhealthy (Sensitive)', color: 'text-orange-500' };
        if (index <= 4) return { label: 'Unhealthy', color: 'text-red-500' };
        if (index <= 5) return { label: 'Very Unhealthy', color: 'text-purple-500' };
        return { label: 'Hazardous', color: 'text-rose-700' };
    };

    const aqiInfo = getAqiLabel(aqi?.["us-epa-index"]);

    const getLocalTime = () => {
        if (!loc?.tz_id) return '--:--';
        try {
            return now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: loc.tz_id
            });
        } catch (e) {
            return '--:--';
        }
    };

    const getLocalDate = () => {
        if (!loc?.tz_id) return '';
        try {
            return now.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                timeZone: loc.tz_id
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* Search Bar & Refresh */}
            <div className="flex gap-3 items-center">
                <form onSubmit={handleSearch} className="flex-1 flex gap-3">
                    <div className="relative flex-1">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Search city (e.g. 'London', 'Tokyo', 'New York')"
                            className="pl-9 py-5 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-sky-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-[42px] px-5 bg-sky-600 hover:bg-sky-700 text-white"
                    >
                        {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                    </Button>
                </form>
                <Button
                    onClick={() => fetchWeather(city)}
                    disabled={isLoading}
                    variant="outline"
                    className="h-[42px] px-4 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Refresh Weather"
                >
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </Button>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Location Header */}
            <AnimatePresence mode="wait">
                {loc && cur && (
                    <motion.div
                        key={loc.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin size={20} className="text-sky-500" />
                                {loc.name}, {loc.region}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {loc.country} • {getLocalDate()} • {getLocalTime()}
                            </p>
                        </div>
                        {cur.is_day ? (
                            <Sun size={28} className="text-amber-400" />
                        ) : (
                            <Globe size={28} className="text-indigo-400" />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard title="Current Weather" delay={1}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500">
                            {cur?.condition?.icon ? (
                                <img src={`https:${cur.condition.icon}`} alt={cur.condition.text || ''} className="w-10 h-10" />
                            ) : (
                                <CloudSun size={32} />
                            )}
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {cur ? `${Math.round(cur.temp_c)}°C` : '--°C'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {cur ? `${cur.condition.text} • Feels ${Math.round(cur.feelslike_c)}°C` : 'Loading...'}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Wind" delay={2}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500">
                            <Wind size={28} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {cur ? `${cur.wind_kph} km/h` : '-- km/h'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {cur ? `${cur.wind_dir} • Gust ${cur.gust_kph} km/h` : 'Wind speed'}
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard title="Humidity" delay={3}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Droplets size={28} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {cur ? `${cur.humidity}%` : '--%'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {cur ? `Dew point ${cur.feelslike_c}°C` : 'Relative humidity'}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Feature Tiles Grid (matching screenshot layout) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Local Time */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/90 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-sky-500/30 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                        const event = new CustomEvent('archestra:chat-query', { detail: { query: `What time is it in ${city}? Show me timezone details.` } });
                        window.dispatchEvent(event);
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-2xl bg-sky-500/10">
                            <Clock size={36} className="text-sky-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white mb-0.5">{getLocalTime()}</p>
                            <p className="text-sm text-gray-400 font-medium">Local Time</p>
                        </div>
                    </div>
                </motion.div>

                {/* Air Quality */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/90 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                        const event = new CustomEvent('archestra:chat-query', { detail: { query: `What is the air quality like in ${city}? Give me a detailed breakdown.` } });
                        window.dispatchEvent(event);
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/10">
                            <Gauge size={36} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className={`text-xl font-bold ${aqiInfo.color} mb-0.5`}>{aqiInfo.label}</p>
                            <p className="text-sm text-gray-400 font-medium">Air Quality</p>
                            {aqi && <p className="text-xs text-gray-500 mt-0.5">PM2.5: {aqi.pm2_5?.toFixed(1)}</p>}
                        </div>
                    </div>
                </motion.div>

                {/* UV Index */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/90 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                        const event = new CustomEvent('archestra:chat-query', { detail: { query: `What is the UV index in ${city}? Should I wear sunscreen?` } });
                        window.dispatchEvent(event);
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-500/10">
                            <Sun size={36} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white mb-0.5">{cur?.uv ?? '--'}</p>
                            <p className="text-sm text-gray-400 font-medium">UV Index</p>
                        </div>
                    </div>
                </motion.div>

                {/* Sunrise / Sunset */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/90 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                        const event = new CustomEvent('archestra:chat-query', { detail: { query: `What are the sunrise and sunset times in ${city} today?` } });
                        window.dispatchEvent(event);
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center text-center gap-3">
                        <div className="flex gap-2">
                            <div className="p-2 rounded-xl bg-orange-500/10"><Sunrise size={24} className="text-orange-400" /></div>
                            <div className="p-2 rounded-xl bg-indigo-500/10"><Sunset size={24} className="text-indigo-400" /></div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{astro?.sunrise ?? '--'} / {astro?.sunset ?? '--'}</p>
                            <p className="text-sm text-gray-400 font-medium">Sunrise & Sunset</p>
                        </div>
                    </div>
                </motion.div>

                {/* Timezone */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/90 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-violet-500/30 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                        const event = new CustomEvent('archestra:chat-query', { detail: { query: `What timezone is ${city} in? How does it compare to UTC?` } });
                        window.dispatchEvent(event);
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-2xl bg-violet-500/10">
                            <Globe size={36} className="text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white mb-0.5 truncate max-w-[160px]">{loc?.tz_id ?? '--'}</p>
                            <p className="text-sm text-gray-400 font-medium">Timezone</p>
                        </div>
                    </div>
                </motion.div>

                {/* Visibility */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/90 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                        const event = new CustomEvent('archestra:chat-query', { detail: { query: `What is the visibility and cloud cover in ${city}?` } });
                        window.dispatchEvent(event);
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-2xl bg-cyan-500/10">
                            <Eye size={36} className="text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white mb-0.5">{cur ? `${cur.vis_km} km` : '--'}</p>
                            <p className="text-sm text-gray-400 font-medium">Visibility</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3-Day Forecast */}
            {forecast?.forecast?.forecastday && (
                <GlassCard title="3-Day Forecast" delay={5}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {forecast.forecast.forecastday.map((day, i) => {
                            const d = new Date(day.date);
                            const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
                            return (
                                <motion.div
                                    key={day.date}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/30 dark:bg-gray-800/40 border border-gray-200/30 dark:border-gray-700/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} className="w-10 h-10" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{dayName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{day.day.condition.text}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {Math.round(day.day.maxtemp_c)}° <span className="text-gray-400 font-normal">/ {Math.round(day.day.mintemp_c)}°</span>
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-blue-400">
                                            <CloudRain size={10} />
                                            {day.day.daily_chance_of_rain}%
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default WeatherAgent;
