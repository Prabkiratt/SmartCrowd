import React from 'react';
import {
  Zone,
  DensityStatus,
  getOccupancyPercent,
  getDensityStatus,
  getZoneRecommendation,
} from '../data/mockData';
import { Users, Plus, Minus, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface CrowdMonitoringViewProps {
  zones: Zone[];
  searchQuery: string;
  onAdjustZoneCrowd: (zoneId: string, delta: number) => void;
  onExecuteZoneRecommendation: (zoneId: string) => void;
}

export const CrowdMonitoringView: React.FC<CrowdMonitoringViewProps> = ({
  zones,
  searchQuery,
  onAdjustZoneCrowd,
  onExecuteZoneRecommendation,
}) => {
  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusTheme = (status: DensityStatus) => {
    switch (status) {
      case 'Low':
        return {
          statusText: 'LOW',
          textColor: 'text-emerald-700',
          barColor: 'bg-emerald-500',
          heatBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950',
          heatDot: 'bg-emerald-500',
        };
      case 'Medium':
        return {
          statusText: 'MEDIUM',
          textColor: 'text-yellow-700',
          barColor: 'bg-yellow-500',
          heatBg: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-950',
          heatDot: 'bg-yellow-500',
        };
      case 'High':
        return {
          statusText: 'HIGH',
          textColor: 'text-orange-700',
          barColor: 'bg-orange-500',
          heatBg: 'bg-orange-500/25 border-orange-500/60 text-orange-950',
          heatDot: 'bg-orange-500',
        };
      case 'Critical':
        return {
          statusText: 'CRITICAL',
          textColor: 'text-red-700',
          barColor: 'bg-red-600',
          heatBg: 'bg-red-600/25 border-red-600/70 text-red-950',
          heatDot: 'bg-red-600',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crowd Monitoring</h1>
          <p className="text-xs text-slate-500 mt-1">
            Live zone-by-zone crowd density cards, occupancy thresholds, recommended actions, and
            spatial heatmap representation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-4 py-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Low</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-yellow-500" />
            <span>Medium</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-orange-500" />
            <span>High</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
            <span>Critical</span>
          </span>
        </div>
      </div>

      {/* Zone Cards Grid (Requirement 2: Main Entrance, Waiting Area, Food Court, Ticket Counter, Service Area, Exit) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => {
          const occupancyPct = getOccupancyPercent(zone.currentPeople, zone.capacity);
          const status = getDensityStatus(
            zone.currentPeople,
            zone.capacity,
            zone.warningThreshold,
            zone.criticalThreshold
          );
          const recommendation = getZoneRecommendation(zone);
          const theme = getStatusTheme(status);

          return (
            <div
              key={zone.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{zone.name}</h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Status:{' '}
                      <span className={`font-mono font-bold ${theme.textColor}`}>
                        {theme.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Manual Crowd Simulation Controls for Viva Demo */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => onAdjustZoneCrowd(zone.id, -10)}
                      title="Decrease crowd by 10"
                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono px-1 text-slate-600">±10</span>
                    <button
                      onClick={() => onAdjustZoneCrowd(zone.id, 10)}
                      title="Increase crowd by 10"
                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Key Metrics (Matches Requirement 2 format) */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div>
                    <div className="text-[11px] text-slate-500">People / Capacity</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                      {zone.currentPeople} / {zone.capacity}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Occupancy</div>
                    <div className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${theme.textColor}`}>
                      {occupancyPct}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${theme.barColor}`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
                    <span>0%</span>
                    <span>Warning: {Math.round((zone.warningThreshold / zone.capacity) * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Recommended Action Box */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Recommended Action:</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    &ldquo;{recommendation}&rdquo;
                  </p>
                </div>
              </div>

              {(status === 'High' || status === 'Critical') && (
                <button
                  onClick={() => onExecuteZoneRecommendation(zone.id)}
                  className="w-full py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Execute Action &amp; Relieve Congestion</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual Heatmap-Style Area Representation (Requirement 2) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Facility Floor Spatial Heatmap Representation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              2D architectural zone heatmap showing real-time crowd concentration hotspots
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Simulated Overhead Sensor Grid · 6 Sectors
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
          {zones.map((zone) => {
            const pct = getOccupancyPercent(zone.currentPeople, zone.capacity);
            const status = getDensityStatus(
              zone.currentPeople,
              zone.capacity,
              zone.warningThreshold,
              zone.criticalThreshold
            );
            const theme = getStatusTheme(status);

            // Generate visual cluster dots proportional to occupancy percentage (up to 24 dots)
            const dotCount = Math.max(3, Math.min(24, Math.round((pct / 100) * 24)));

            return (
              <div
                key={`heatmap-${zone.id}`}
                className={`p-5 rounded-lg border-2 transition-all duration-300 flex flex-col justify-between min-h-[160px] bg-white/95 ${theme.heatBg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{zone.name}</div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-600 mt-0.5">
                      {zone.currentPeople} / {zone.capacity} people
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold tabular-nums ${theme.textColor}`}>
                    {pct}% · {theme.statusText}
                  </span>
                </div>

                {/* Simulated Thermal / Sensor Dot Matrix */}
                <div className="my-4 flex flex-wrap gap-1.5 items-center">
                  {Array.from({ length: dotCount }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full ${theme.heatDot} opacity-85`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Sensor Active</span>
                  </span>
                  <span className="font-mono">Sector {zone.id.replace('zone-', '0')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
