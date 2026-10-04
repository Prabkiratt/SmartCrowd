import React, { useState } from 'react';
import { QueueItem, StaffMember, getQueueRecommendation } from '../data/mockData';
import {
  Plus,
  Minus,
  Trash2,
  UserPlus,
  Lightbulb,
  Sliders,
} from 'lucide-react';

interface QueueManagementViewProps {
  queues: QueueItem[];
  staff: StaffMember[];
  searchQuery: string;
  onAddQueue: (name: string, maxCounters: number) => void;
  onRemoveQueue: (queueId: string) => void;
  onAdjustQueuePeople: (queueId: string, delta: number) => void;
  onAdjustQueueCounters: (queueId: string, delta: number) => void;
  onAssignStaffToQueue: (queueId: string) => void;
}

export const QueueManagementView: React.FC<QueueManagementViewProps> = ({
  queues,
  staff,
  searchQuery,
  onAddQueue,
  onRemoveQueue,
  onAdjustQueuePeople,
  onAdjustQueueCounters,
  onAssignStaffToQueue,
}) => {
  const [newQueueName, setNewQueueName] = useState('');
  const [newMaxCounters, setNewMaxCounters] = useState(4);
  const [showAddForm, setShowAddForm] = useState(false);

  const availableStaffCount = staff.filter((s) => s.status === 'Available').length;

  const filteredQueues = queues.filter((q) =>
    q.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueueName.trim()) return;
    onAddQueue(newQueueName.trim(), newMaxCounters);
    setNewQueueName('');
    setNewMaxCounters(4);
    setShowAddForm(false);
  };

  const getQueueStatusStyle = (statusLabel: 'Normal' | 'Moderate' | 'Busy' | 'Critical') => {
    switch (statusLabel) {
      case 'Normal':
        return 'text-emerald-700';
      case 'Moderate':
        return 'text-yellow-700';
      case 'Busy':
        return 'text-orange-700';
      case 'Critical':
        return 'text-red-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Queue Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor live queue lengths, open or close service counters, assign available staff, and
            follow rule-based queue recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3.5 py-2 font-mono tabular-nums">
            Available Staff: <span className="font-bold text-indigo-700">{availableStaffCount}</span>
          </div>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Queue</span>
          </button>
        </div>
      </div>

      {/* Add Queue Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateQueue}
          className="bg-white border border-indigo-200 rounded-xl p-5 flex flex-wrap items-end gap-4"
        >
          <div className="flex-1 min-w-[220px] space-y-1">
            <label className="block text-xs font-medium text-slate-700">Queue Name</label>
            <input
              type="text"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              placeholder="e.g., VIP FastTrack Counter or Baggage Drop"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
              required
            />
          </div>

          <div className="w-40 space-y-1">
            <label className="block text-xs font-medium text-slate-700">Max Service Counters</label>
            <input
              type="number"
              min={1}
              max={12}
              value={newMaxCounters}
              onChange={(e) => setNewMaxCounters(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              Create Queue
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Queue Table Layout (Requirement 3) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">Active Service Queues</h2>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {filteredQueues.length} Queues Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-6">Queue Name</th>
                <th className="py-3 px-4 text-right">Current People</th>
                <th className="py-3 px-4 text-right">Average Wait</th>
                <th className="py-3 px-4 text-right">Service Counters</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-6 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQueues.map((q) => {
                const { statusLabel, recommendation } = getQueueRecommendation(q);
                const statusColor = getQueueStatusStyle(statusLabel);

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                      <div>{q.name}</div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5 font-mono tabular-nums">
                        Assigned Staff: {q.assignedStaffCount}
                      </div>
                    </td>

                    {/* Current People with +/- adjustment */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onAdjustQueuePeople(q.id, -5)}
                          title="Decrease queue by 5 people"
                          className="p-1 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums font-bold text-slate-900 w-16 text-center">
                          {q.currentPeople} people
                        </span>
                        <button
                          onClick={() => onAdjustQueuePeople(q.id, 5)}
                          title="Increase queue by 5 people"
                          className="p-1 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Average Wait */}
                    <td className="py-4 px-4 text-right font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                      {q.avgWaitMinutes} min
                    </td>

                    {/* Service Counters with open/close buttons */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onAdjustQueueCounters(q.id, -1)}
                          disabled={q.activeCounters <= 1}
                          title="Close 1 service counter"
                          className="p-1 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono tabular-nums font-medium text-slate-800 w-24 text-center">
                          {q.activeCounters} / {q.maxCounters} counters
                        </span>
                        <button
                          onClick={() => onAdjustQueueCounters(q.id, 1)}
                          disabled={q.activeCounters >= q.maxCounters}
                          title="Open 1 service counter"
                          className="p-1 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`font-bold ${statusColor}`}>{statusLabel}</span>
                    </td>

                    {/* Recommended Action */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{recommendation}</span>
                      </div>
                    </td>

                    {/* Admin Actions: Assign Staff & Remove Queue */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onAssignStaffToQueue(q.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Assign available staff member to this queue"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Staff</span>
                        </button>

                        <button
                          onClick={() => onRemoveQueue(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Remove Queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule-Based Recommendation System Explanation Card (Requirement 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
          <div className="text-xs font-mono font-semibold text-emerald-700">
            THRESHOLD RULE 01 · ≤ 40 PEOPLE
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Standard Queue Flow</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When queue size is 40 people or fewer, existing service counters maintain optimal wait
            times under 15 minutes.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
          <div className="text-xs font-mono font-semibold text-orange-700">
            THRESHOLD RULE 02 · &gt; 40 PEOPLE
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            &ldquo;Open another service counter&rdquo;
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automatically flags the queue as Busy and recommends opening an additional counter to
            halve average waiting time.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
          <div className="text-xs font-mono font-semibold text-red-700">
            THRESHOLD RULE 03 · &gt; 70 PEOPLE
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            &ldquo;Critical: Immediately deploy additional staff&rdquo;
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Escalates queue status to Critical and prompts immediate staff deployment from low-load
            zones.
          </p>
        </div>
      </div>
    </div>
  );
};
