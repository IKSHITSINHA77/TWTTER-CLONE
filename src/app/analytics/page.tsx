// src/app/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { MetricSummary, HourlyHeatmapPoint } from '@/lib/analyticsTypes';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [hourly, setHourly] = useState<HourlyHeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await axiosInstance.get('/analytics/overview');
      if (res.data?.success) {
        setSummary(res.data.summary);
        setHourly(res.data.hourly);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white max-w-4xl mx-auto border-x border-neutral-800 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-400" />
              Creator Analytics
            </h1>
            <p className="text-xs text-neutral-500">Live audience engagement & audio telemetry</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={refreshing}
          className="border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white rounded-xl text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-neutral-500 gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
            <p className="text-xs">Computing real-time metrics...</p>
          </div>
        ) : summary ? (
          <AnalyticsDashboard summary={summary} hourly={hourly} />
        ) : (
          <div className="py-20 text-center text-neutral-500 text-xs">
            Unable to load analytics data at this time.
          </div>
        )}
      </div>
    </main>
  );
}