import React, { useState } from 'react';
import { SystemAlert } from '../data/mockData';
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  CheckCheck,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: SystemAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onAcknowledgeAll: () => void;
  onClearAcknowledged: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onAcknowledgeAll,
  onClearAcknowledged,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Critical' | 'Warning' | 'Info'>(
    'All'
  );

  const filteredAlerts = alerts.filter((a) =>
    filterSeverity === 'All' ? true : a.severity === filterSeverity
  );

  const getSeverityConfig = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'Critical':
        return {
          icon: ShieldAlert,
          borderClass: 'border-l-4 border-l-red-600 border-slate-200',
          iconColor: 'text-red-600 bg-red-50',
          labelColor: 'text-red-700',
        };
      case 'Warning':
        return {
          icon: AlertTriangle,
          borderClass: 'border-l-4 border-l-amber-500 border-slate-200',
          iconColor: 'text-amber-600 bg-amber-50',
          labelColor: 'text-amber-700',
        };
      case 'Info':
        return {
          icon: Info,
          borderClass: 'border-l-4 border-l-indigo-600 border-slate-200',
          iconColor: 'text-indigo-600 bg-indigo-50',
          labelColor: 'text-indigo-700',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Alerts &amp; Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated alerts generated when crowd reaches 80% / 90% capacity, queue waiting time
            exceeds 20 minutes, or staff availability drops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAcknowledgeAll}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={onClearAcknowledged}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Resolved</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Automated Trigger Rules Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {(['All', 'Critical', 'Warning', 'Info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Triggers:</span>
          <span>80% Capacity (Warning)</span>
          <span>·</span>
          <span>90% Capacity (Critical)</span>
          <span>·</span>
          <span>Wait &gt; 20 min</span>
          <span>·</span>
          <span>Low Staff</span>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No Active Alerts in This Filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All monitored zones and queues are operating within safe parameters, or start Live
            Monitoring to simulate new threshold breaches.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-opacity ${
                  config.borderClass
                } ${alert.acknowledged ? 'opacity-65' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`font-mono font-bold ${config.labelColor}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-bold text-slate-900">{alert.title}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-500">{alert.zoneOrQueue}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="font-mono text-slate-400">{alert.timestamp}</span>
                    </div>

                    <p className="text-sm text-slate-800 font-medium">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alert.acknowledged ? (
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
