"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import GlassCard from '@/components/ui/glass-card';
import {
    Upload, Flame, Beef, Wheat, Droplets, Loader2, X, Sparkles,
    Coffee, UtensilsCrossed, Cookie, Moon, MoreHorizontal,
    Trash2, Plus, Type, Image as ImageIcon, AlertCircle,
    FileText, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { type FoodAnalysis, type MealType } from '@/app/actions/health';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import {
    collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc
} from 'firebase/firestore';

// ─── Meal config ────────────────────────────────────────────────────────
const MEAL_SECTIONS: { type: MealType; label: string; icon: React.ReactNode; color: string; gradient: string }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: <Coffee size={20} />, color: 'text-amber-400', gradient: 'from-amber-500 to-orange-500' },
    { type: 'lunch', label: 'Lunch', icon: <UtensilsCrossed size={20} />, color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
    { type: 'snacks', label: 'Snacks', icon: <Cookie size={20} />, color: 'text-pink-400', gradient: 'from-pink-500 to-rose-500' },
    { type: 'dinner', label: 'Dinner', icon: <Moon size={20} />, color: 'text-indigo-400', gradient: 'from-indigo-500 to-purple-500' },
    { type: 'others', label: 'Others', icon: <MoreHorizontal size={20} />, color: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-500' },
];

// ─── Date helpers ───────────────────────────────────────────────────────
const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const displayDate = (dateStr: string) => {
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 86400000));
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// ─── Helper: resize image ──────────────────────────────────────────────
const resizeImage = (file: File, maxWidth = 800): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxWidth) {
                    h = Math.round((h * maxWidth) / w);
                    w = maxWidth;
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.85);
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, mimeType: file.type || 'image/jpeg' });
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// ─── Types ──────────────────────────────────────────────────────────────
interface StoredMeal {
    id: string;
    meal_type: MealType;
    dish_name: string;
    ingredients: string[];
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    sodium: number;
    estimated_portion_grams: number;
    confidence_score: number;
    summary: string;
    date: string;
    created_at: string;
}

// ─── Meal Input Component ───────────────────────────────────────────────
const MealInput: React.FC<{
    mealType: MealType;
    mealConfig: typeof MEAL_SECTIONS[0];
    userId: string;
    selectedDate: string;
    onMealSaved: () => void;
}> = ({ mealType, mealConfig, userId, selectedDate, onMealSaved }) => {
    const [mode, setMode] = useState<'image' | 'text'>('image');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
    const [textInput, setTextInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<FoodAnalysis | null>(null);
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        setError('');
        setResult(null);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
        try {
            const resized = await resizeImage(file);
            setImageData(resized);
        } catch {
            setError('Failed to process image');
        }
    }, []);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError('');
        setResult(null);

        try {
            let requestBody: any = {};
            if (mode === 'image' && imageData) {
                requestBody.imageBase64 = imageData.base64;
                requestBody.imageMimeType = imageData.mimeType;
            } else if (mode === 'text' && textInput.trim()) {
                requestBody.text = textInput.trim();
            } else {
                setError(mode === 'image' ? 'Please upload an image first' : 'Please describe your meal');
                setIsAnalyzing(false);
                return;
            }

            // Call Gemini 2.5 Flash via API route
            const res = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Analysis failed' }));
                throw new Error(errData.error || `Analysis failed: ${res.status}`);
            }

            const analysis: FoodAnalysis = await res.json();
            setResult(analysis);

            // Save to Firestore (including summary, portion, and date)
            await addDoc(collection(db, 'meals'), {
                user_id: userId,
                meal_type: mealType,
                date: selectedDate,
                dish_name: analysis.dish_name,
                ingredients: analysis.ingredients,
                estimated_portion_grams: analysis.estimated_portion_grams || 0,
                calories: analysis.estimated_calories_kcal,
                protein: analysis.protein_g,
                carbohydrates: analysis.carbohydrates_g,
                fat: analysis.fat_g,
                sodium: analysis.sodium_mg,
                confidence_score: analysis.confidence_score,
                summary: analysis.summary || '',
                created_at: new Date().toISOString(),
            });

            onMealSaved();

            // Reset after short delay
            setTimeout(() => {
                setImagePreview(null);
                setImageData(null);
                setTextInput('');
                setResult(null);
                setIsExpanded(false);
                if (fileRef.current) fileRef.current.value = '';
            }, 2500);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to analyze food');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearInput = () => {
        setImagePreview(null);
        setImageData(null);
        setTextInput('');
        setResult(null);
        setError('');
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div>
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-all text-sm"
                >
                    <Plus size={16} />
                    Add {mealConfig.label}
                </button>
            )}

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => { setMode('image'); clearInput(); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'image'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-transparent'
                                    }`}
                            >
                                <ImageIcon size={16} /> Upload Image
                            </button>
                            <button
                                onClick={() => { setMode('text'); clearInput(); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'text'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-transparent'
                                    }`}
                            >
                                <Type size={16} /> Type Description
                            </button>
                        </div>

                        {mode === 'image' ? (
                            <div>
                                {!imagePreview ? (
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-500/5 transition-all"
                                    >
                                        <Upload size={28} className="text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload food photo</p>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                                        <button onClick={clearInput} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="e.g., 2 eggs, 1 toast with butter, orange juice..."
                                className="w-full h-24 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        )}

                        {error && (
                            <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm"
                            >
                                <p className="font-semibold text-emerald-400">✓ {result.dish_name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {result.estimated_calories_kcal} kcal • {result.estimated_portion_grams}g portion saved
                                </p>
                            </motion.div>
                        )}

                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || (mode === 'image' ? !imageData : !textInput.trim())}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-white text-sm transition-all
                                    bg-gradient-to-r ${mealConfig.gradient} hover:opacity-90
                                    disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/10`}
                            >
                                {isAnalyzing ? (
                                    <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Sparkles size={16} /> Analyze & Save</>
                                )}
                            </button>
                            <button
                                onClick={() => { clearInput(); setIsExpanded(false); }}
                                className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Meal Card with Summary Toggle ──────────────────────────────────────
const MealCard: React.FC<{
    meal: StoredMeal;
    onDelete: (id: string) => void;
}> = ({ meal, onDelete }) => {
    const [showSummary, setShowSummary] = useState(false);

    return (
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                        {meal.dish_name}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span className="text-orange-400">{Math.round(meal.calories)} kcal</span>
                        <span>P: {meal.protein?.toFixed(1)}g</span>
                        <span>C: {meal.carbohydrates?.toFixed(1)}g</span>
                        <span>F: {meal.fat?.toFixed(1)}g</span>
                        {meal.estimated_portion_grams > 0 && (
                            <span className="text-gray-400">~{Math.round(meal.estimated_portion_grams)}g</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {meal.summary && (
                        <button
                            onClick={() => setShowSummary(!showSummary)}
                            className={`p-1.5 rounded-lg transition-colors ${showSummary
                                ? 'text-blue-400 bg-blue-500/10'
                                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                                }`}
                            title="View summary"
                        >
                            <FileText size={14} />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(meal.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete meal"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Summary expandable */}
            <AnimatePresence>
                {showSummary && meal.summary && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {meal.summary}
                            </p>
                            {meal.confidence_score > 0 && (
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Confidence: {(meal.confidence_score * 100).toFixed(0)}%
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Health Page ───────────────────────────────────────────────────
const HealthPage: React.FC = () => {
    const { user } = useAuth();
    const [meals, setMeals] = useState<StoredMeal[]>([]);
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [refreshKey, setRefreshKey] = useState(0);

    // Real-time Firestore listener for selected date's meals
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, 'meals'),
            where('user_id', '==', user.uid),
            where('date', '==', selectedDate),
            orderBy('created_at', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as StoredMeal[];
            setMeals(entries);
        }, (error) => {
            console.error('[Firestore] Snapshot error:', error);
        });

        return () => unsubscribe();
    }, [user?.uid, selectedDate, refreshKey]);

    // Daily totals
    const totals = meals.reduce(
        (acc, m) => ({
            calories: acc.calories + (m.calories || 0),
            protein: acc.protein + (m.protein || 0),
            carbohydrates: acc.carbohydrates + (m.carbohydrates || 0),
            fat: acc.fat + (m.fat || 0),
            sodium: acc.sodium + (m.sodium || 0),
        }),
        { calories: 0, protein: 0, carbohydrates: 0, fat: 0, sodium: 0 }
    );

    // Meal-wise calorie breakdown
    const mealCalories = MEAL_SECTIONS.map(s => ({
        ...s,
        calories: meals.filter(m => m.meal_type === s.type).reduce((acc, m) => acc + (m.calories || 0), 0),
        count: meals.filter(m => m.meal_type === s.type).length,
    }));

    const handleDeleteMeal = async (mealId: string) => {
        try {
            await deleteDoc(doc(db, 'meals', mealId));
        } catch (err) {
            console.error('Failed to delete meal:', err);
        }
    };

    // Date navigation
    const goToPreviousDay = () => {
        const d = new Date(selectedDate + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        setSelectedDate(formatDate(d));
    };
    const goToNextDay = () => {
        const d = new Date(selectedDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        const today = formatDate(new Date());
        if (formatDate(d) <= today) setSelectedDate(formatDate(d));
    };
    const isToday = selectedDate === formatDate(new Date());

    const macroCards = [
        { label: 'Calories', value: totals.calories, unit: 'kcal', icon: <Flame size={22} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', gColor: '#f97316', dailyGoal: 2000 },
        { label: 'Protein', value: totals.protein, unit: 'g', icon: <Beef size={22} />, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', gColor: '#fb7185', dailyGoal: 50 },
        { label: 'Carbs', value: totals.carbohydrates, unit: 'g', icon: <Wheat size={22} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gColor: '#60a5fa', dailyGoal: 300 },
        { label: 'Fat', value: totals.fat, unit: 'g', icon: <Droplets size={22} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', gColor: '#facc15', dailyGoal: 65 },
        { label: 'Sodium', value: totals.sodium, unit: 'mg', icon: <Sparkles size={22} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', gColor: '#a78bfa', dailyGoal: 2300 },
    ];

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── Date Selector ──────────────────────────────────────── */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={goToPreviousDay}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                    <Calendar size={16} className="text-blue-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        {displayDate(selectedDate)}
                    </span>
                    <span className="text-xs text-gray-500">{selectedDate}</span>
                </div>
                <button
                    onClick={goToNextDay}
                    disabled={isToday}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            {/* ── Daily Summary Cards ────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {macroCards.map((c, i) => {
                    const pct = Math.min((c.value / c.dailyGoal) * 100, 100);
                    return (
                        <motion.div
                            key={c.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={`relative overflow-hidden rounded-2xl p-4 border ${c.border} bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl`}
                        >
                            <div className={`absolute top-3 right-3 p-1.5 rounded-lg ${c.bg} ${c.color}`}>
                                {c.icon}
                            </div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${c.color}`}>
                                {c.label === 'Calories' ? Math.round(c.value) : c.value.toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500">{c.unit}</p>
                            <div className="mt-2">
                                <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ delay: i * 0.06 + 0.3, duration: 0.6 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: c.gColor }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">{Math.round(pct)}% of daily</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Meal Calorie Breakdown Bar ──────────────────────────── */}
            {totals.calories > 0 && (
                <GlassCard title="Meal Breakdown" delay={1}>
                    <div className="space-y-3">
                        {mealCalories.filter(m => m.calories > 0).map(m => (
                            <div key={m.type} className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 ${m.color}`}>
                                    {m.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">{m.label}</span>
                                <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${m.gradient}`}
                                        style={{ width: `${Math.min((m.calories / totals.calories) * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white w-20 text-right">
                                    {Math.round(m.calories)} kcal
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
                            <span className="text-lg font-bold text-orange-400">{Math.round(totals.calories)} kcal</span>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* ── Meal Sections ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {MEAL_SECTIONS.map((section, i) => {
                    const sectionMeals = meals.filter(m => m.meal_type === section.type);
                    const sectionCalories = sectionMeals.reduce((acc, m) => acc + (m.calories || 0), 0);

                    return (
                        <motion.div
                            key={section.type}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                        >
                            <GlassCard delay={i + 2}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl bg-gradient-to-br ${section.gradient} text-white`}>
                                            {section.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{section.label}</h3>
                                            <p className="text-xs text-gray-500">
                                                {sectionMeals.length === 0
                                                    ? 'No meals logged'
                                                    : `${sectionMeals.length} item${sectionMeals.length > 1 ? 's' : ''} • ${Math.round(sectionCalories)} kcal`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Logged meals with expandable summary */}
                                {sectionMeals.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {sectionMeals.map(meal => (
                                            <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
                                        ))}
                                    </div>
                                )}

                                {/* Add meal input */}
                                <MealInput
                                    mealType={section.type}
                                    mealConfig={section}
                                    userId={user.uid}
                                    selectedDate={selectedDate}
                                    onMealSaved={() => setRefreshKey(k => k + 1)}
                                />
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default HealthPage;
