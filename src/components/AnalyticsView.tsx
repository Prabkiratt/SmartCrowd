import React, { useState } from 'react';
import {
  Zone,
  ANALYTICS_TIME_SERIES,
  DAILY_VISITORS_DATA,
  getOccupancyPercent,
} from '../data/mockData';
import { Clock, TrendingUp, BarChart3, Users, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  zones: Zone[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ zones }) => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days'>('today');

  const seriesData = ANALYTICS_TIME_SERIES[timeFilter];

  const maxCrowd = Math.max(...seriesData.map((d) => d.crowdCount), 800);
  const maxQueue = Math.max(...seriesData.map((d) => d.queueLength), 200);
  const maxWait = Math.max(...seriesData.map((d) => d.avgWait), 30);
  const maxVisitors = Math.max(...DAILY_VISITORS_DATA.map((d) => d.visitors), 4500);

  return (
    <div className="space-y-8">
      {/* Page Header & Time Range Filter (Today, Last 7 Days, Last 30 Days) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Analytics &amp; Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical crowd levels, queue lengths, average waiting time, zone distribution, and
            daily visitor volume.
          </p>
        </div>

        {/* Interactive Time Filters (Requirement 7) */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as 'today' | '7days' | '30days')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                timeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Peak Hour Callout Banner (Requirement 7: Peak Crowd Time: 5:00 PM – 7:00 PM) */}
      <div className="bg-indigo-950 text-white rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-800/80 text-indigo-200 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-indigo-300">PEAK HOUR ANALYSIS</div>
            <h2 className="text-lg font-bold">Peak Crowd Time: 5:00 PM – 7:00 PM</h2>
            <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
              Historical telemetry shows crowd occupancy spikes by +38% during evening rush hours.
              Opening all Ticket &amp; Service Counters at 4:45 PM reduces average waiting time by
              11 minutes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0 border-t md:border-t-0 md:border-l border-indigo-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[11px] text-indigo-300">Peak Occupancy</div>
            <div className="text-xl font-bold font-mono tabular-nums mt-0.5">685 people</div>
          </div>
          <div>
            <div className="text-[11px] text-indigo-300">Peak Avg Wait</div>
            <div className="text-xl font-bold font-mono tabular-nums mt-0.5">25 min</div>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 1: Crowd Levels Over Time & Queue Length Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Crowd Levels Over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Crowd Levels Over Time</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Headcount</span>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {seriesData.map((point) => {
              const heightPct = Math.max(10, Math.round((point.crowdCount / maxCrowd) * 100));
              const isPeak = point.crowdCount >= 650;
              return (
                <div
                  key={point.time}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-700">
                    {point.crowdCount}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-md transition-all duration-300 ${
                      isPeak ? 'bg-orange-500' : 'bg-indigo-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 px-2 text-[11px] font-mono text-slate-500">
            {seriesData.map((point) => (
              <span key={point.time} className="flex-1 text-center truncate">
                {point.time}
              </span>
            ))}
          </div>
        </div>

        {/* Chart 2: Queue Length Over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Queue Length Over Time</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Total Queued People</span>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {seriesData.map((point) => {
              const heightPct = Math.max(10, Math.round((point.queueLength / maxQueue) * 100));
              const isHigh = point.queueLength >= 150;
              return (
                <div
                  key={point.time}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-700">
                    {point.queueLength}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-md transition-all duration-300 ${
                      isHigh ? 'bg-red-500' : 'bg-emerald-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 px-2 text-[11px] font-mono text-slate-500">
            {seriesData.map((point) => (
              <span key={point.time} className="flex-1 text-center truncate">
                {point.time}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Average Waiting Time & Zone-Wise Crowd */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Average Waiting Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Average Waiting Time (Minutes)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Target SLA ≤ 15m</span>
          </div>

          <div className="space-y-3 pt-2">
            {seriesData.map((point) => {
              const widthPct = Math.min(100, Math.round((point.avgWait / maxWait) * 100));
              const isOverSla = point.avgWait > 20;
              return (
                <div key={point.time} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-600">{point.time}</span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        isOverSla ? 'text-red-700' : 'text-slate-800'
                      }`}
                    >
                      {point.avgWait} min
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOverSla ? 'bg-red-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Zone-Wise Crowd Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Zone-Wise Crowd Distribution</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Live Occupancy %</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {zones.map((z) => {
              const pct = getOccupancyPercent(z.currentPeople, z.capacity);
              return (
                <div key={z.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{z.name}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {z.currentPeople} / {z.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 88
                          ? 'bg-red-600'
                          : pct >= 70
                          ? 'bg-orange-500'
                          : pct >= 45
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart 5: Daily Visitors Volume */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Daily Visitors Footfall &amp; Peak Wait Correlation
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Weekly Total: {DAILY_VISITORS_DATA.reduce((s, d) => s + d.visitors, 0).toLocaleString()}{' '}
            visitors
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 pt-2">
          {DAILY_VISITORS_DATA.map((dayItem) => {
            const pct = Math.round((dayItem.visitors / maxVisitors) * 100);
            return (
              <div
                key={dayItem.day}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200/70 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{dayItem.day}</span>
                  <span className="font-mono text-[11px] text-slate-500">{pct}%</span>
                </div>

                <div className="w-full h-20 bg-slate-200/70 rounded flex items-end overflow-hidden p-1">
                  <div
                    className="w-full bg-indigo-600 rounded-xs transition-all duration-300"
                    style={{ height: `${pct}%` }}
                  />
                </div>

                <div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {dayItem.visitors.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    Peak wait: {dayItem.peakWait}m
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
