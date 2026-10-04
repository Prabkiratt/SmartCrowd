import React from 'react';
import { Settings, Play, Pause, RotateCcw, Sliders, BellRing } from 'lucide-react';

interface SettingsViewProps {
  isSimulating: boolean;
  simulationIntervalMs: number;
  onChangeIntervalMs: (ms: number) => void;
  autoAlertsEnabled: boolean;
  onToggleAutoAlerts: () => void;
  onToggleSimulation: () => void;
  onResetAllData: () => void;
  userRole: string;
  onChangeUserRole: (role: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isSimulating,
  simulationIntervalMs,
  onChangeIntervalMs,
  autoAlertsEnabled,
  onToggleAutoAlerts,
  onToggleSimulation,
  onResetAllData,
  userRole,
  onChangeUserRole,
}) => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure the real-time simulation speed, automated alert generation rules, and active
          demonstration role.
        </p>
      </div>

      {/* Simulation Engine Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Real-Time Simulation Engine Controls
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Live Telemetry Update Interval
            </label>
            <p className="text-xs text-slate-500">
              Controls how frequently simulated crowd numbers and queue lengths fluctuate when Live
              Monitoring is active.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[
                { label: 'Fast (1.5s)', ms: 1500 },
                { label: 'Normal (3.0s)', ms: 3000 },
                { label: 'Slow (5.0s)', ms: 5000 },
              ].map((opt) => (
                <button
                  key={opt.ms}
                  onClick={() => onChangeIntervalMs(opt.ms)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    simulationIntervalMs === opt.ms
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Simulation State &amp; Data Reset
            </label>
            <p className="text-xs text-slate-500">
              Start/pause live crowd fluctuations or restore initial demo numbers at any point
              during your presentation.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={onToggleSimulation}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSimulating
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Pause Monitoring' : 'Start Live Monitoring'}</span>
              </button>

              <button
                onClick={onResetAllData}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert & Role Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <BellRing className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Automated Alert Rules &amp; Active User Role
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-800">
              Automatic Threshold Alert Generation
            </div>
            <p className="text-xs text-slate-500">
              When enabled, SmartCrowd automatically creates alerts when a zone reaches 80% / 90%
              capacity or queue wait exceeds 20 minutes.
            </p>
            <button
              onClick={onToggleAutoAlerts}
              className={`mt-1 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                autoAlertsEnabled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {autoAlertsEnabled ? 'Auto-Alerts: Enabled' : 'Auto-Alerts: Paused'}
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-800">Active Demonstration Role</div>
            <p className="text-xs text-slate-500">
              Switch between the three main user personas (Admin/Manager, Staff, Visitor View) to
              explain role perspectives.
            </p>
            <select
              value={userRole}
              onChange={(e) => onChangeUserRole(e.target.value)}
              className="mt-1 w-full max-w-xs px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="System Administrator">1. Admin / Manager (System Administrator)</option>
              <option value="Floor Staff Coordinator">2. Staff (Floor Staff Coordinator)</option>
              <option value="Visitor Information Kiosk">3. Customers / Visitors (Kiosk View)</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Metadata Footer */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-2 font-medium">
          <Settings className="w-4 h-4 text-slate-500" />
          <span>SmartCrowd Console · Local State Engine</span>
        </span>
        <span className="font-mono">Status: Operational</span>
      </div>
    </div>
  );
};
