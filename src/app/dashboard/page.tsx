"use client";

import React from 'react';
import GlassCard from '@/components/ui/glass-card';
import { Calendar, Activity, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { OverviewChats } from '@/components/dashboard/overview-chats';
import { FinancialOverview } from '@/components/dashboard/financial-overview';
import { ScheduleOverview } from '@/components/dashboard/schedule-overview';
import { HealthOverview } from '@/components/dashboard/health-overview';

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FinancialOverview />

      <ScheduleOverview />

      <HealthOverview />

      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <OverviewChats />
      </div>
    </div>
  );
};

export default Dashboard;
