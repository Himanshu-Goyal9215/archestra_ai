"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import {
  Sparkles, LineChart, CloudSun, Calendar, Activity,
  ArrowRight, Shield, Zap, Brain
} from "lucide-react";

const features = [
  { icon: LineChart, title: "Financial Advisor", desc: "Real-time market insights & personalized investment advice", color: "from-emerald-500 to-cyan-500" },
  { icon: CloudSun, title: "Weather Agent", desc: "Live weather data, forecasts & air quality monitoring", color: "from-blue-500 to-indigo-500" },
  { icon: Calendar, title: "Schedule Agent", desc: "Smart calendar management & meeting coordination", color: "from-violet-500 to-purple-500" },
  { icon: Activity, title: "Health Agent", desc: "Nutrition scanning & health insights from food photos", color: "from-orange-500 to-red-500" },
];

const stats = [
  { icon: Shield, value: "Enterprise", label: "Security" },
  { icon: Zap, value: "Real-time", label: "Processing" },
  { icon: Brain, value: "Multi-Agent", label: "Architecture" },
];

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null; // Redirecting

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Archestra AI</span>
        </div>
        <button
          onClick={signInWithGoogle}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Sparkles size={14} />
            Your AI-Powered Personal Assistant
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            One Platform.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Multiple AI Agents.
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Archestra AI brings together specialized agents for finance, weather,
            health, and scheduling — all in one seamless dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={signInWithGoogle}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-2xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:scale-[1.02]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/5"
            >
              <s.icon size={22} className="mx-auto mb-2 text-blue-400" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Meet Your AI Agents</h2>
          <p className="text-gray-400 mt-2">Specialized intelligence for every aspect of your life</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-gray-500">
        © 2026 Archestra AI. All rights reserved.
      </footer>
    </div>
  );
}
