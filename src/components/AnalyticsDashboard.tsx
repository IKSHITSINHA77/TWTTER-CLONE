// src/components/AnalyticsDashboard.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Eye, Heart, Volume2, CheckCircle2, TrendingUp, Bookmark } from 'lucide-react';
import { MetricSummary, HourlyHeatmapPoint } from '@/lib/analyticsTypes';

interface AnalyticsDashboardProps {
  summary: MetricSummary;
  hourly: HourlyHeatmapPoint[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ summary, hourly }) => {
  const maxHourlyCount = Math.max(...hourly.map((h) => h.count), 1);

  const kpis = [
    {
      title: 'Total Impressions',
      value: summary.impressions.toLocaleString(),
      icon: Eye,
      sub: 'Views across all feeds',
      color: 'text-sky-400',
    },
    {
      title: 'Engagement Rate',
      value: `${summary.engagementRate}%`,
      icon: TrendingUp,
      sub: 'Likes, shares & plays / views',
      color: 'text-emerald-400',
    },
    {
      title: 'Audio Plays',
      value: summary.audioPlays.toLocaleString(),
      icon: Volume2,
      sub: `Avg listen: ${summary.avgAudioListenDuration}s`,
      color: 'text-violet-400',
    },
    {
      title: 'Audio Completions',
      value: summary.audioCompletions.toLocaleString(),
      icon: CheckCircle2,
      sub: `${summary.audioPlays > 0 ? Math.round((summary.audioCompletions / summary.audioPlays) * 100) : 0}% completion rate`,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="bg-neutral-950 border-neutral-800 text-white rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">{kpi.title}</span>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-black">{kpi.value}</div>
                <p className="text-[11px] text-neutral-500">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 24-Hour Engagement Heatmap Chart */}
      <Card className="bg-neutral-950 border-neutral-800 text-white rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>24-Hour Interaction Activity</span>
            <span className="text-xs text-neutral-400 font-normal">Activity by Hour (IST)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-40 flex items-end gap-1.5 sm:gap-2">
            {hourly.map((point) => {
              const heightPercent = (point.count / maxHourlyCount) * 100;
              return (
                <div key={point.hour} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-7 hidden group-hover:block bg-neutral-800 text-neutral-200 text-[10px] px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                    {point.hour}:00 - {point.count} interactions
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${Math.max(heightPercent, 6)}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${
                      point.count > 0 ? 'bg-sky-500 group-hover:bg-sky-400' : 'bg-neutral-800/40'
                    }`}
                  />
                  <span className="text-[9px] text-neutral-500 mt-1 font-mono">
                    {point.hour % 6 === 0 ? `${point.hour}h` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;