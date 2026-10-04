import React from 'react';
import {
  Search,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Menu,
  User,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetData: () => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  onOpenMobileMenu: () => void;
  userRole: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  isSimulating,
  onToggleSimulation,
  onResetData,
  unreadAlertCount,
  onOpenAlerts,
  onOpenMobileMenu,
  userRole,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Left Zone: Mobile Menu Button + Search Input */}
      <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search zones, queues, or staff..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 text-slate-900"
          />
        </div>
      </div>

      {/* Center / Right Controls: Real-Time Simulation Toolbar + System Status + Notifications + Admin Profile */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
        {/* Live Simulation Status & Controls (Requirement 4) */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
          {isSimulating && (
            <span className="px-2 py-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live • Monitoring Active
            </span>
          )}

          <button
            onClick={onToggleSimulation}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              isSimulating
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Monitoring</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Live Monitoring</span>
              </>
            )}
          </button>

          <button
            onClick={onResetData}
            title="Reset Demo Data"
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-md flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>

        {/* System Status (Requirement 11) */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="whitespace-nowrap">System Status: Operational</span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="View Alerts & Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">Admin</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-none">{userRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
