import React from 'react';
import {
  Users,
  Activity,
  ListOrdered,
  Clock,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  Zone,
  LiveArea,
  QueueItem,
  StaffMember,
  DensityStatus,
  getOccupancyPercent,
  getDensityStatus,
} from '../data/mockData';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  zones: Zone[];
  liveAreas: LiveArea[];
  queues: QueueItem[];
  staff: StaffMember[];
  lastUpdated: string;
  searchQuery: string;
  onNavigate: (tab: NavTab) => void;
  onApplyRecommendation: (recId: string, actionType: string, targetName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  zones,
  liveAreas,
  queues,
  staff,
  lastUpdated,
  searchQuery,
  onNavigate,
  onApplyRecommendation,
}) => {
  // Calculate aggregate metrics for Requirement 1
  const totalPeopleInArea = zones.reduce((sum, z) => sum + z.currentPeople, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const overallOccupancyPct = getOccupancyPercent(totalPeopleInArea, totalCapacity);
  const overallDensityStatus: DensityStatus = getDensityStatus(totalPeopleInArea, totalCapacity);

  const activeQueuesCount = queues.length;
  const avgWaitTime =
    queues.length > 0
      ? Math.round(queues.reduce((sum, q) => sum + q.avgWaitMinutes, 0) / queues.length)
      : 0;

  const criticalZonesCount = zones.filter(
    (z) =>
      getDensityStatus(z.currentPeople, z.capacity, z.warningThreshold, z.criticalThreshold) ===
      'Critical'
  ).length;

  const highZonesCount = zones.filter(
    (z) =>
      getDensityStatus(z.currentPeople, z.capacity, z.warningThreshold, z.criticalThreshold) ===
      'High'
  ).length;

  const safetyStatus =
    criticalZonesCount > 0
      ? 'Action Required'
      : highZonesCount > 1
      ? 'Elevated Caution'
      : 'Safe & Nominal';

  const availableStaffCount = staff.filter((s) => s.status === 'Available').length;

  // Color helpers for Green = Low, Yellow = Medium, Orange = High, Red = Critical
  const getStatusColorConfig = (status: DensityStatus) => {
    switch (status) {
      case 'Low':
        return {
          barClass: 'bg-emerald-500',
          textClass: 'text-emerald-700',
          dotClass: 'bg-emerald-500',
          label: 'Low (Green)',
        };
      case 'Medium':
        return {
          barClass: 'bg-yellow-500',
          textClass: 'text-yellow-700',
          dotClass: 'bg-yellow-500',
          label: 'Medium (Yellow)',
        };
      case 'High':
        return {
          barClass: 'bg-orange-500',
          textClass: 'text-orange-700',
          dotClass: 'bg-orange-500',
          label: 'High (Orange)',
        };
      case 'Critical':
        return {
          barClass: 'bg-red-600',
          textClass: 'text-red-700',
          dotClass: 'bg-red-600',
          label: 'Critical (Red)',
        };
    }
  };

  // Rule-Based Smart Recommendations Engine (Requirement 9)
  const recommendations: {
    id: string;
    message: string;
    category: string;
    actionLabel: string;
    actionType: 'open_counter' | 'assign_staff' | 'redirect_visitors' | 'view_analytics';
    targetName: string;
  }[] = [];

  queues.forEach((q) => {
    if (q.currentPeople > 40 && q.activeCounters < q.maxCounters) {
      recommendations.push({
        id: `rec-q-${q.id}`,
        message: `Open Service Counter ${q.activeCounters + 1} at ${q.name} because the queue has exceeded 40 people (${q.currentPeople} waiting).`,
        category: 'Queue Bottleneck',
        actionLabel: 'Open Counter',
        actionType: 'open_counter',
        targetName: q.name,
      });
    }
  });

  if (availableStaffCount >= 2) {
    const busyQueue = queues.find((q) => q.currentPeople >= 40) || queues[0];
    if (busyQueue) {
      recommendations.push({
        id: 'rec-staff-move',
        message: `Move 2 available staff members to the ${busyQueue.name} to reduce the ${busyQueue.avgWaitMinutes} min waiting time.`,
        category: 'Staff Allocation',
        actionLabel: 'Deploy Staff',
        actionType: 'assign_staff',
        targetName: busyQueue.name,
      });
    }
  }

  const entranceZone = zones.find((z) => z.name.toLowerCase().includes('entrance'));
  if (entranceZone && getOccupancyPercent(entranceZone.currentPeople, entranceZone.capacity) >= 60) {
    recommendations.push({
      id: 'rec-entrance-redirect',
      message: 'Redirect visitors from Entrance A to Entrance B to balance entry gate flow.',
      category: 'Flow Diversion',
      actionLabel: 'Balance Inflow',
      actionType: 'redirect_visitors',
      targetName: entranceZone.name,
    });
  }

  const waitingZone = zones.find((z) => z.name.toLowerCase().includes('waiting'));
  if (waitingZone && getOccupancyPercent(waitingZone.currentPeople, waitingZone.capacity) >= 75) {
    recommendations.push({
      id: 'rec-waiting-cap',
      message: `Waiting Area is approaching maximum capacity (${waitingZone.currentPeople}/${waitingZone.capacity} people).`,
      category: 'Capacity Alert',
      actionLabel: 'Relieve Pressure',
      actionType: 'redirect_visitors',
      targetName: waitingZone.name,
    });
  }

  recommendations.push({
    id: 'rec-peak-hour',
    message: 'Peak crowd expected between 5 PM and 7 PM. Pre-schedule all service counters.',
    category: 'Forecast',
    actionLabel: 'View Peak Report',
    actionType: 'view_analytics',
    targetName: 'Analytics',
  });

  // Filter live areas by search query if typed
  const filteredLiveAreas = liveAreas.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 8 Statistic Cards (Requirement 1)
  const statCards = [
    {
      label: 'Total People in Area',
      value: `${totalPeopleInArea}`,
      subtext: `Capacity: ${totalCapacity} (${overallOccupancyPct}%)`,
      icon: Users,
      accent: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Current Crowd Density',
      value: overallDensityStatus,
      subtext: `${overallOccupancyPct}% Aggregate Occupancy`,
      icon: Activity,
      accent:
        overallDensityStatus === 'Critical'
          ? 'text-red-600 bg-red-50'
          : overallDensityStatus === 'High'
          ? 'text-orange-600 bg-orange-50'
          : overallDensityStatus === 'Medium'
          ? 'text-yellow-600 bg-yellow-50'
          : 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Active Queues',
      value: `${activeQueuesCount}`,
      subtext: `${queues.reduce((s, q) => s + q.currentPeople, 0)} Total People in Queues`,
      icon: ListOrdered,
      accent: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Average Waiting Time',
      value: `${avgWaitTime} min`,
      subtext: avgWaitTime > 20 ? 'Above 20m target threshold' : 'Within normal service SLA',
      icon: Clock,
      accent: avgWaitTime > 20 ? 'text-orange-600 bg-orange-50' : 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Number of Critical Zones',
      value: `${criticalZonesCount}`,
      subtext: `${highZonesCount} High Density Zones`,
      icon: AlertTriangle,
      accent: criticalZonesCount > 0 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Safety Status',
      value: safetyStatus,
      subtext: criticalZonesCount === 0 ? 'All exits unobstructed' : 'Immediate attention needed',
      icon: ShieldCheck,
      accent:
        criticalZonesCount > 0
          ? 'text-red-600 bg-red-50'
          : highZonesCount > 1
          ? 'text-amber-600 bg-amber-50'
          : 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Staff Available',
      value: `${availableStaffCount} / ${staff.length}`,
      subtext: `${staff.length - availableStaffCount} Staff Currently Busy`,
      icon: UserCheck,
      accent: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Last Updated Time',
      value: lastUpdated,
      subtext: 'Real-time telemetry synchronization',
      icon: RefreshCw,
      accent: 'text-slate-700 bg-slate-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations Control Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time crowd density, active queue lengths, safety telemetry, and automated action
            recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            onClick={() => onNavigate('monitoring')}
            className="px-3.5 py-2 font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Inspect Zones
          </button>
          <button
            onClick={() => onNavigate('queues')}
            className="px-3.5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Manage Queues
          </button>
        </div>
      </div>

      {/* 8 Statistic Cards Grid (Requirement 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="text-xs font-medium text-slate-500 truncate">{card.label}</div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 truncate">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 truncate">{card.subtext}</div>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.accent}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Crowd Density Visualization Bar & Legend (Requirement 1) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Real-Time Crowd Density Visualization
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Color-coded density scale across monitored facility zones
            </p>
          </div>

          {/* 4-Level Color Legend: Green = Low, Yellow = Medium, Orange = High, Red = Critical */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>Green = Low (0–44%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-yellow-500" />
              <span>Yellow = Medium (45–69%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500" />
              <span>Orange = High (70–87%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
              <span>Red = Critical (88%+)</span>
            </span>
          </div>
        </div>

        {/* Visual Zone Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {zones.map((zone) => {
            const pct = getOccupancyPercent(zone.currentPeople, zone.capacity);
            const status = getDensityStatus(
              zone.currentPeople,
              zone.capacity,
              zone.warningThreshold,
              zone.criticalThreshold
            );
            const colors = getStatusColorConfig(status);

            return (
              <div key={zone.id} className="space-y-2 p-4 bg-slate-50/70 rounded-lg border border-slate-200/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{zone.name}</span>
                  <span className={`font-mono tabular-nums font-semibold ${colors.textClass}`}>
                    {status} · {pct}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${colors.barClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                  <span>
                    People: {zone.currentPeople} / {zone.capacity}
                  </span>
                  <span>
                    Warn: {zone.warningThreshold} · Crit: {zone.criticalThreshold}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Live Area Status (Requirement 1) + Smart Recommendations (Requirement 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Area Status Section: Entrance, Registration Counter, Waiting Area, Service Counter 1, Service Counter 2, Exit */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Live Area Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time occupancy breakdown across operational checkpoints
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {filteredLiveAreas.length} Checkpoints
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 pr-4">Area Checkpoint</th>
                  <th className="py-2.5 px-3 text-right">Current People</th>
                  <th className="py-2.5 px-3 text-right">Max Capacity</th>
                  <th className="py-2.5 px-3 text-right">Occupancy %</th>
                  <th className="py-2.5 pl-3 text-right">Density Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLiveAreas.map((area) => {
                  const pct = getOccupancyPercent(area.currentPeople, area.maxCapacity);
                  const status = getDensityStatus(area.currentPeople, area.maxCapacity);
                  const colors = getStatusColorConfig(status);

                  return (
                    <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                        {area.name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                        {area.currentPeople}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                        {area.maxCapacity}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${colors.barClass}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums font-medium text-slate-800">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pl-3 text-right whitespace-nowrap">
                        <span className={`font-semibold ${colors.textClass}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Recommendations Panel (Requirement 9) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Smart Recommendations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rule-based action engine driven by live crowd &amp; queue thresholds
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-indigo-700">{rec.category}</span>
                    <span>Target: {rec.targetName}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    &ldquo;{rec.message}&rdquo;
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (rec.actionType === 'view_analytics') {
                          onNavigate('analytics');
                        } else {
                          onApplyRecommendation(rec.id, rec.actionType, rec.targetName);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                    >
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rule-based engine active</span>
            </span>
            <button
              onClick={() => onNavigate('alerts')}
              className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View All Alerts →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
