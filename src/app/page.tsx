"use client";

import React from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Calendar, Activity, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard title="Financial Overview" delay={1}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">$24,562.00</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Daily Gain</span>
            <span className="text-emerald-500 font-medium">+$124.50 (0.5%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[75%]"></div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Today's Schedule" delay={2}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Tasks</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4 Pending</h3>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <Calendar size={24} />
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Review Project Proposal</p>
              <p className="text-xs text-gray-500">10:00 AM - 11:30 AM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Team Sync</p>
              <p className="text-xs text-gray-500">02:00 PM - 03:00 PM</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Health Status" delay={3}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Activity</p>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">85%</h3>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
            <Activity size={24} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-gray-500">Steps</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">8,432</p>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-gray-500">Calories</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">420</p>
          </div>
        </div>
      </GlassCard>

      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <GlassCard title="Recent Notifications" delay={4}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <CheckCircle size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Investment Goal Reached</p>
                <p className="text-xs text-gray-500">You've hit your monthly savings target ahead of schedule.</p>
              </div>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
            <div className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Clock size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Meeting Reminder</p>
                <p className="text-xs text-gray-500">Upcoming meeting with design team in 30 minutes.</p>
              </div>
              <span className="text-xs text-gray-400">30m ago</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
