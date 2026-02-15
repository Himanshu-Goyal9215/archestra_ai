"use client";

import React from 'react';
import { NewsSearch } from '@/components/finance/news-search';
import { TrendsWidget } from '@/components/finance/trends-widget';

export default function FinancePage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-bold mb-1">Financial Advisor</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Get real-time market insights and personalized investment advice.
                </p>
            </div>

            {/* Trends - Full Width */}
            <div className="mb-6">
                <TrendsWidget />
            </div>

            {/* Row 2: News Search (shifted down, with scrollable results) */}
            <NewsSearch />
        </div>
    );
}
