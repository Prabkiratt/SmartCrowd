import React, { useState } from 'react';
import { Zone, getOccupancyPercent, getDensityStatus } from '../data/mockData';
import { MapPin, Plus, Edit3, Trash2, Check, X } from 'lucide-react';

interface ZoneManagementViewProps {
  zones: Zone[];
  onAddZone: (
    name: string,
    capacity: number,
    warningThreshold: number,
    criticalThreshold: number,
    category: Zone['category']
  ) => void;
  onUpdateZone: (
    zoneId: string,
    updates: {
      name: string;
      capacity: number;
      warningThreshold: number;
      criticalThreshold: number;
    }
  ) => void;
  onDeleteZone: (zoneId: string) => void;
}

export const ZoneManagementView: React.FC<ZoneManagementViewProps> = ({
  zones,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState(200);
  const [newWarning, setNewWarning] = useState(150);
  const [newCritical, setNewCritical] = useState(180);
  const [newCategory, setNewCategory] = useState<Zone['category']>('waiting');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(200);
  const [editWarning, setEditWarning] = useState(150);
  const [editCritical, setEditCritical] = useState(180);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddZone(newName.trim(), newCapacity, newWarning, newCritical, newCategory);
    setNewName('');
    setNewCapacity(200);
    setNewWarning(150);
    setNewCritical(180);
    setShowAddForm(false);
  };

  const startEdit = (zone: Zone) => {
    setEditingId(zone.id);
    setEditName(zone.name);
    setEditCapacity(zone.capacity);
    setEditWarning(zone.warningThreshold);
    setEditCritical(zone.criticalThreshold);
  };

  const saveEdit = (zoneId: string) => {
    if (!editName.trim()) return;
    onUpdateZone(zoneId, {
      name: editName.trim(),
      capacity: Math.max(10, editCapacity),
      warningThreshold: Math.max(5, editWarning),
      criticalThreshold: Math.max(8, editCritical),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Area &amp; Zone Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, edit, or delete facility zones and configure Maximum Capacity, Warning Thresholds,
            and Critical Thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Zone</span>
        </button>
      </div>

      {/* Add New Zone Form (Requirement 8) */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-indigo-200 rounded-xl p-6 space-y-4"
        >
          <div className="text-sm font-semibold text-slate-900">Create New Monitored Zone</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Zone Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., North Gate Lobby"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Zone['category'])}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
              >
                <option value="entry">Entrance / Gate</option>
                <option value="waiting">Waiting Lounge</option>
                <option value="service">Service / Ticket Hall</option>
                <option value="dining">Dining / Food Court</option>
                <option value="exit">Exit Corridor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Maximum Capacity
              </label>
              <input
                type="number"
                min={20}
                max={2000}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Warning Threshold
              </label>
              <input
                type="number"
                min={10}
                max={2000}
                value={newWarning}
                onChange={(e) => setNewWarning(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Critical Threshold
              </label>
              <input
                type="number"
                min={15}
                max={2000}
                value={newCritical}
                onChange={(e) => setNewCritical(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              Save Zone
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

      {/* Zones Configuration Table (Requirement 8 Example: Zone: Waiting Area | Capacity: 200 | Warning: 150 | Critical: 180) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Configured Zones &amp; Threshold Parameters
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {zones.length} Zones Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-6">Zone Name</th>
                <th className="py-3 px-4 text-right">Current Crowd</th>
                <th className="py-3 px-4 text-right">Maximum Capacity</th>
                <th className="py-3 px-4 text-right">Warning Threshold</th>
                <th className="py-3 px-4 text-right">Critical Threshold</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {zones.map((zone) => {
                const isEditing = editingId === zone.id;
                const pct = getOccupancyPercent(zone.currentPeople, zone.capacity);
                const status = getDensityStatus(
                  zone.currentPeople,
                  zone.capacity,
                  zone.warningThreshold,
                  zone.criticalThreshold
                );

                return (
                  <tr key={zone.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2.5 py-1 text-xs border border-indigo-400 rounded bg-white w-44"
                        />
                      ) : (
                        zone.name
                      )}
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {zone.currentPeople} ({pct}%)
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editCapacity}
                          onChange={(e) => setEditCapacity(Number(e.target.value))}
                          className="px-2 py-1 text-xs font-mono border border-indigo-400 rounded bg-white w-20 text-right"
                        />
                      ) : (
                        zone.capacity
                      )}
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums text-amber-700 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editWarning}
                          onChange={(e) => setEditWarning(Number(e.target.value))}
                          className="px-2 py-1 text-xs font-mono border border-indigo-400 rounded bg-white w-20 text-right"
                        />
                      ) : (
                        zone.warningThreshold
                      )}
                    </td>

                    <td className="py-4 px-4 text-right font-mono tabular-nums text-red-700 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editCritical}
                          onChange={(e) => setEditCritical(Number(e.target.value))}
                          className="px-2 py-1 text-xs font-mono border border-indigo-400 rounded bg-white w-20 text-right"
                        />
                      ) : (
                        zone.criticalThreshold
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          status === 'Critical'
                            ? 'text-red-700'
                            : status === 'High'
                            ? 'text-orange-700'
                            : status === 'Medium'
                            ? 'text-yellow-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => saveEdit(zone.id)}
                            className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() => startEdit(zone)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteZone(zone.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Zone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
