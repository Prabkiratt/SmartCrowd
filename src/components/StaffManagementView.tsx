import React, { useState } from 'react';
import { StaffMember, Zone } from '../data/mockData';
import { UserCheck, UserPlus, MapPin } from 'lucide-react';

interface StaffManagementViewProps {
  staff: StaffMember[];
  zones: Zone[];
  searchQuery: string;
  onAssignStaffZone: (staffId: string, newZone: string) => void;
  onToggleStaffStatus: (staffId: string) => void;
  onAddStaffMember: (
    name: string,
    role: StaffMember['role'],
    assignedZone: string,
    currentTask: string
  ) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staff,
  zones,
  searchQuery,
  onAssignStaffZone,
  onToggleStaffStatus,
  onAddStaffMember,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<StaffMember['role']>('Support');
  const [newZone, setNewZone] = useState(zones[0]?.name || 'Main Entrance');
  const [newTask, setNewTask] = useState('Floor assistance & queue guidance');

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignedZone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStaffMember(newName.trim(), newRole, newZone, newTask.trim());
    setNewName('');
    setNewTask('Floor assistance & queue guidance');
    setShowAddModal(false);
  };

  const getStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-700';
      case 'Busy':
        return 'text-amber-700';
      case 'On Break':
        return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor floor personnel, check availability status, and dynamically assign staff to
            high-density zones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal((prev) => !prev)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Add Staff Member Form */}
      {showAddModal && (
        <form
          onSubmit={handleCreateStaff}
          className="bg-white border border-indigo-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Staff Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Arjun Mehta"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as StaffMember['role'])}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
            >
              <option value="Security">Security</option>
              <option value="Manager">Manager</option>
              <option value="Support">Support</option>
              <option value="Counter Operator">Counter Operator</option>
              <option value="Floor Coordinator">Floor Coordinator</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Assigned Zone</label>
            <select
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Current Task</label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              Save Staff
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Summary Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Total Staff on Shift</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {staff.length}
            </div>
          </div>
          <UserCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Available for Dispatch</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
              {staff.filter((s) => s.status === 'Available').length}
            </div>
          </div>
          <MapPin className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Actively Engaged / Busy</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
              {staff.filter((s) => s.status === 'Busy').length}
            </div>
          </div>
          <UserCheck className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* Staff Roster Table (Requirement 6: Staff Name, Role, Assigned Zone, Status, Current Task) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Active Staff Roster</h2>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Showing {filteredStaff.length} of {staff.length} personnel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-6">Staff Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Zone (Reassign)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Current Task</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                    <div>{member.name}</div>
                    <div className="text-[11px] font-mono font-normal text-slate-400 mt-0.5">
                      {member.contact}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {member.role}
                  </td>

                  {/* Zone Assignment Select Dropdown */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select
                      value={member.assignedZone}
                      onChange={(e) => onAssignStaffZone(member.id, e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.name}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`font-bold ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-600 max-w-xs">{member.currentTask}</td>

                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={() => onToggleStaffStatus(member.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                    >
                      {member.status === 'Available' ? 'Mark Busy' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
