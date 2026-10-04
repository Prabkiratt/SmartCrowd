/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import {
  isSupabaseConfigured,
  fetchCrowdStateFromSupabase,
  syncCrowdStateToSupabase,
} from './lib/supabase';
import {
  INITIAL_ZONES,
  INITIAL_LIVE_AREAS,
  INITIAL_QUEUES,
  INITIAL_STAFF,
  INITIAL_ALERTS,
  Zone,
  LiveArea,
  QueueItem,
  StaffMember,
  SystemAlert,
  getOccupancyPercent,
} from './data/mockData';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CrowdMonitoringView } from './components/CrowdMonitoringView';
import { QueueManagementView } from './components/QueueManagementView';
import { AlertsView } from './components/AlertsView';
import { StaffManagementView } from './components/StaffManagementView';
import { AnalyticsView } from './components/AnalyticsView';
import { ZoneManagementView } from './components/ZoneManagementView';
import { AboutProjectView } from './components/AboutProjectView';
import { SettingsView } from './components/SettingsView';

type AppScreen = 'landing' | 'login' | 'console';

function formatTimeNow(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function App() {
  // Navigation & Auth Screen State
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('System Administrator');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Core Application Data State
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [liveAreas, setLiveAreas] = useState<LiveArea[]>(INITIAL_LIVE_AREAS);
  const [queues, setQueues] = useState<QueueItem[]>(INITIAL_QUEUES);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [lastUpdated, setLastUpdated] = useState<string>(formatTimeNow());

  // Real-Time Simulation Engine State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationIntervalMs, setSimulationIntervalMs] = useState<number>(3000);
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const initialLoadCompleteRef = useRef<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Listen to Firebase Auth state in memory and load state from PostgreSQL backend or Supabase
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchCrowdStateFromSupabase()
        .then((data) => {
          if (!data) return;
          if (data.zones.length > 0) setZones(data.zones);
          if (data.liveAreas.length > 0) setLiveAreas(data.liveAreas);
          if (data.queues.length > 0) setQueues(data.queues);
          if (data.staff.length > 0) setStaff(data.staff);
          if (data.alerts.length > 0) setAlerts(data.alerts);
          setLastUpdated(formatTimeNow());
          initialLoadCompleteRef.current = true;
        })
        .catch((err) => {
          console.error('Error loading from Supabase:', err);
        });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthToken(null);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);

        const res = await fetch('/api/crowd-state', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.zones) && data.zones.length > 0) setZones(data.zones);
          if (Array.isArray(data.liveAreas) && data.liveAreas.length > 0) setLiveAreas(data.liveAreas);
          if (Array.isArray(data.queues) && data.queues.length > 0) setQueues(data.queues);
          if (Array.isArray(data.staff) && data.staff.length > 0) setStaff(data.staff);
          if (Array.isArray(data.alerts)) setAlerts(data.alerts);
          setLastUpdated(formatTimeNow());
          initialLoadCompleteRef.current = true;
        }
      } catch (err) {
        console.error('Error loading persisted state:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist changes to PostgreSQL and/or Supabase when state changes
  useEffect(() => {
    if (!initialLoadCompleteRef.current && !isSupabaseConfigured) return;

    const timeout = setTimeout(async () => {
      if (isSupabaseConfigured) {
        try {
          await syncCrowdStateToSupabase({
            zones,
            liveAreas,
            queues,
            staff,
            alerts,
          });
        } catch (err) {
          console.error('Error syncing to Supabase:', err);
        }
      }

      if (!authToken) return;
      try {
        const currentUser = auth.currentUser;
        const freshToken = currentUser ? await currentUser.getIdToken() : authToken;
        await fetch('/api/crowd-state', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify({
            zones,
            liveAreas,
            queues,
            staff,
            alerts,
          }),
        });
      } catch (err) {
        console.error('Error syncing state:', err);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [zones, liveAreas, queues, staff, alerts, authToken]);

  // Reset all data to initial demo values
  const handleResetData = useCallback(async () => {
    setIsSimulating(false);
    setZones(INITIAL_ZONES);
    setLiveAreas(INITIAL_LIVE_AREAS);
    setQueues(INITIAL_QUEUES);
    setStaff(INITIAL_STAFF);
    setAlerts(INITIAL_ALERTS);
    setLastUpdated(formatTimeNow());

    if (authToken) {
      try {
        const currentUser = auth.currentUser;
        const freshToken = currentUser ? await currentUser.getIdToken() : authToken;
        await fetch('/api/crowd-state/reset', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${freshToken}`,
          },
        });
      } catch (err) {
        console.error('Error resetting database state:', err);
      }
    }

    showToast('Demo data restored to initial baseline.');
  }, [authToken, showToast]);

  // Real-Time Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      const timeLabel = formatTimeNow();
      setLastUpdated(timeLabel);

      // 1. Update Zones randomly within [10, capacity]
      setZones((prevZones) => {
        const updatedZones = prevZones.map((zone) => {
          const delta = Math.floor(Math.random() * 19) - 9;
          const nextPeople = Math.max(10, Math.min(zone.capacity, zone.currentPeople + delta));
          return { ...zone, currentPeople: nextPeople };
        });

        // Automatically generate alerts based on updated zones
        if (autoAlertsEnabled) {
          updatedZones.forEach((z) => {
            const pct = getOccupancyPercent(z.currentPeople, z.capacity);
            if (pct >= 90) {
              setAlerts((prevAlerts) => {
                const alreadyExists = prevAlerts.some(
                  (a) => !a.acknowledged && a.zoneOrQueue === z.name && a.severity === 'Critical'
                );
                if (alreadyExists) return prevAlerts;
                const newAlert: SystemAlert = {
                  id: `alert-${Date.now()}-${z.id}`,
                  title: 'CRITICAL',
                  message: `${z.name} has exceeded safe crowd capacity (${pct}% · ${z.currentPeople}/${z.capacity}).`,
                  severity: 'Critical',
                  timestamp: 'Just now',
                  zoneOrQueue: z.name,
                  acknowledged: false,
                };
                return [newAlert, ...prevAlerts.slice(0, 19)];
              });
            } else if (pct >= 80) {
              setAlerts((prevAlerts) => {
                const alreadyExists = prevAlerts.some(
                  (a) => !a.acknowledged && a.zoneOrQueue === z.name
                );
                if (alreadyExists) return prevAlerts;
                const newAlert: SystemAlert = {
                  id: `alert-${Date.now()}-${z.id}`,
                  title: 'HIGH CROWD',
                  message: `${z.name} has reached ${pct}% capacity (${z.currentPeople}/${z.capacity}).`,
                  severity: 'Warning',
                  timestamp: 'Just now',
                  zoneOrQueue: z.name,
                  acknowledged: false,
                };
                return [newAlert, ...prevAlerts.slice(0, 19)];
              });
            }
          });
        }

        return updatedZones;
      });

      // 2. Update Dashboard Live Areas
      setLiveAreas((prevAreas) =>
        prevAreas.map((area) => {
          const delta = Math.floor(Math.random() * 13) - 6;
          const nextPeople = Math.max(5, Math.min(area.maxCapacity, area.currentPeople + delta));
          return { ...area, currentPeople: nextPeople };
        })
      );

      // 3. Update Queues & Waiting Time
      setQueues((prevQueues) => {
        const updatedQueues = prevQueues.map((q) => {
          const delta = Math.floor(Math.random() * 11) - 5;
          const nextPeople = Math.max(4, Math.min(110, q.currentPeople + delta));
          const nextWait = Math.max(
            2,
            Math.round((nextPeople / Math.max(1, q.activeCounters)) * 0.85)
          );
          return {
            ...q,
            currentPeople: nextPeople,
            avgWaitMinutes: nextWait,
          };
        });

        // Check if queue waiting time exceeds 20 minutes
        if (autoAlertsEnabled) {
          updatedQueues.forEach((q) => {
            if (q.avgWaitMinutes > 20) {
              setAlerts((prevAlerts) => {
                const alreadyExists = prevAlerts.some(
                  (a) => !a.acknowledged && a.zoneOrQueue === q.name && a.title === 'LONG QUEUE'
                );
                if (alreadyExists) return prevAlerts;
                const newAlert: SystemAlert = {
                  id: `alert-q-${Date.now()}-${q.id}`,
                  title: 'LONG QUEUE',
                  message: `${q.name} waiting time is ${q.avgWaitMinutes} minutes (${q.currentPeople} people waiting).`,
                  severity: q.avgWaitMinutes >= 28 ? 'Critical' : 'Warning',
                  timestamp: 'Just now',
                  zoneOrQueue: q.name,
                  acknowledged: false,
                };
                return [newAlert, ...prevAlerts.slice(0, 19)];
              });
            }
          });
        }

        return updatedQueues;
      });
    }, simulationIntervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simulationIntervalMs, autoAlertsEnabled]);

  // --- Handlers for Crowd Monitoring ---
  const handleAdjustZoneCrowd = (zoneId: string, delta: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const nextPeople = Math.max(0, Math.min(z.capacity, z.currentPeople + delta));
        return { ...z, currentPeople: nextPeople };
      })
    );
    setLastUpdated(formatTimeNow());
  };

  const handleExecuteZoneRecommendation = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const reduced = Math.max(20, Math.round(z.currentPeople * 0.72));
        showToast(`Action executed for ${z.name}: Inflow balanced to ${reduced} people.`);
        return { ...z, currentPeople: reduced };
      })
    );
    setLastUpdated(formatTimeNow());
  };

  // --- Handlers for Queue Management ---
  const handleAddQueue = (name: string, maxCounters: number) => {
    const newQ: QueueItem = {
      id: `queue-${Date.now()}`,
      name,
      currentPeople: 18,
      avgWaitMinutes: 7,
      activeCounters: 2,
      maxCounters: Math.max(1, maxCounters),
      assignedStaffCount: 2,
    };
    setQueues((prev) => [...prev, newQ]);
    setLastUpdated(formatTimeNow());
    showToast(`Added queue "${name}".`);
  };

  const handleRemoveQueue = (queueId: string) => {
    setQueues((prev) => prev.filter((q) => q.id !== queueId));
    setLastUpdated(formatTimeNow());
    showToast('Queue removed.');
  };

  const handleAdjustQueuePeople = (queueId: string, delta: number) => {
    setQueues((prev) =>
      prev.map((q) => {
        if (q.id !== queueId) return q;
        const nextPeople = Math.max(0, q.currentPeople + delta);
        const nextWait = Math.max(
          1,
          Math.round((nextPeople / Math.max(1, q.activeCounters)) * 0.85)
        );
        return { ...q, currentPeople: nextPeople, avgWaitMinutes: nextWait };
      })
    );
    setLastUpdated(formatTimeNow());
  };

  const handleAdjustQueueCounters = (queueId: string, delta: number) => {
    setQueues((prev) =>
      prev.map((q) => {
        if (q.id !== queueId) return q;
        const nextCounters = Math.max(1, Math.min(q.maxCounters, q.activeCounters + delta));
        const nextWait = Math.max(
          1,
          Math.round((q.currentPeople / Math.max(1, nextCounters)) * 0.85)
        );
        return { ...q, activeCounters: nextCounters, avgWaitMinutes: nextWait };
      })
    );
    setLastUpdated(formatTimeNow());
  };

  const handleAssignStaffToQueue = (queueId: string) => {
    const availablePerson = staff.find((s) => s.status === 'Available');
    const targetQueue = queues.find((q) => q.id === queueId);
    if (!targetQueue) return;

    if (availablePerson) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === availablePerson.id
            ? {
                ...s,
                status: 'Busy',
                assignedZone: targetQueue.name,
                currentTask: `Assisting queue operations at ${targetQueue.name}`,
              }
            : s
        )
      );
    }

    setQueues((prev) =>
      prev.map((q) => {
        if (q.id !== queueId) return q;
        const nextStaff = q.assignedStaffCount + 1;
        const nextWait = Math.max(2, q.avgWaitMinutes - 3);
        return { ...q, assignedStaffCount: nextStaff, avgWaitMinutes: nextWait };
      })
    );
    setLastUpdated(formatTimeNow());
    showToast(
      availablePerson
        ? `Assigned ${availablePerson.name} to ${targetQueue.name}.`
        : `Allocated additional support unit to ${targetQueue.name}.`
    );
  };

  // --- Handler for Dashboard Smart Recommendations ---
  const handleApplyRecommendation = (_recId: string, actionType: string, targetName: string) => {
    if (actionType === 'open_counter') {
      const targetQ = queues.find((q) => q.name === targetName);
      if (targetQ) {
        handleAdjustQueueCounters(targetQ.id, 1);
        showToast(`Opened additional service counter at ${targetName}.`);
      }
    } else if (actionType === 'assign_staff') {
      const targetQ = queues.find((q) => q.name === targetName) || queues[0];
      if (targetQ) {
        handleAssignStaffToQueue(targetQ.id);
      }
    } else if (actionType === 'redirect_visitors') {
      const targetZ = zones.find((z) => z.name === targetName);
      if (targetZ) {
        handleExecuteZoneRecommendation(targetZ.id);
      }
    }
  };

  // --- Handlers for Alerts ---
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    showToast('All alerts marked as acknowledged.');
  };

  const handleClearAcknowledged = () => {
    setAlerts((prev) => prev.filter((a) => !a.acknowledged));
    showToast('Cleared acknowledged alerts.');
  };

  // --- Handlers for Staff Management ---
  const handleAssignStaffZone = (staffId: string, newZone: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              assignedZone: newZone,
              currentTask: `Supervising crowd flow at ${newZone}`,
            }
          : s
      )
    );
    showToast(`Reassigned staff member to ${newZone}.`);
  };

  const handleToggleStaffStatus = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const nextStatus = s.status === 'Available' ? 'Busy' : 'Available';
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleAddStaffMember = (
    name: string,
    role: StaffMember['role'],
    assignedZone: string,
    currentTask: string
  ) => {
    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name,
      role,
      assignedZone,
      status: 'Available',
      currentTask,
      contact: '+91 98110 88900',
    };
    setStaff((prev) => [newMember, ...prev]);
    showToast(`Added ${name} (${role}) to ${assignedZone}.`);
  };

  // --- Handlers for Zone Management ---
  const handleAddZone = (
    name: string,
    capacity: number,
    warningThreshold: number,
    criticalThreshold: number,
    category: Zone['category']
  ) => {
    const newZ: Zone = {
      id: `zone-${Date.now()}`,
      name,
      currentPeople: Math.round(capacity * 0.35),
      capacity,
      warningThreshold,
      criticalThreshold,
      category,
      gridPos: { row: 3, col: 1 },
    };
    setZones((prev) => [...prev, newZ]);
    setLastUpdated(formatTimeNow());
    showToast(`Created new zone "${name}".`);
  };

  const handleUpdateZone = (
    zoneId: string,
    updates: {
      name: string;
      capacity: number;
      warningThreshold: number;
      criticalThreshold: number;
    }
  ) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z))
    );
    setLastUpdated(formatTimeNow());
    showToast(`Updated thresholds for ${updates.name}.`);
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    setLastUpdated(formatTimeNow());
    showToast('Zone deleted.');
  };

  // Screen Routing: Landing Page -> Login Page -> Main Console
  if (screen === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setScreen('login')}
        onViewDemo={() => {
          setUserRole('System Administrator');
          setScreen('console');
        }}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginPage
        onBackToLanding={() => setScreen('landing')}
        onLoginSuccess={async (_email, roleLabel, idToken) => {
          setUserRole(roleLabel);
          if (idToken) {
            setAuthToken(idToken);
            try {
              await fetch('/api/auth/sync-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ role: roleLabel }),
              });
            } catch (err) {
              console.error('Failed to sync user role:', err);
            }
          }
          setScreen('console');
        }}
      />
    );
  }

  const unreadAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Left Admin Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        unreadAlertCount={unreadAlertCount}
        userRole={userRole}
        onLogout={async () => {
          setIsSimulating(false);
          setAuthToken(null);
          try {
            await signOut(auth);
          } catch (err) {
            console.error('Error signing out:', err);
          }
          setScreen('landing');
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSimulating={isSimulating}
          onToggleSimulation={() => {
            setIsSimulating((prev) => {
              const next = !prev;
              showToast(
                next
                  ? 'Live Crowd Simulation started — telemetry updating automatically.'
                  : 'Live Crowd Simulation paused.'
              );
              return next;
            });
          }}
          onResetData={handleResetData}
          unreadAlertCount={unreadAlertCount}
          onOpenAlerts={() => setActiveTab('alerts')}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          userRole={userRole}
        />

        {/* Subtle Action Toast Banner */}
        {actionFeedback && (
          <div className="bg-indigo-950 text-white px-6 py-2 text-xs font-medium flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-indigo-200 hover:text-white ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Active View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              zones={zones}
              liveAreas={liveAreas}
              queues={queues}
              staff={staff}
              lastUpdated={lastUpdated}
              searchQuery={searchQuery}
              onNavigate={(tab) => setActiveTab(tab)}
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}

          {activeTab === 'monitoring' && (
            <CrowdMonitoringView
              zones={zones}
              searchQuery={searchQuery}
              onAdjustZoneCrowd={handleAdjustZoneCrowd}
              onExecuteZoneRecommendation={handleExecuteZoneRecommendation}
            />
          )}

          {activeTab === 'queues' && (
            <QueueManagementView
              queues={queues}
              staff={staff}
              searchQuery={searchQuery}
              onAddQueue={handleAddQueue}
              onRemoveQueue={handleRemoveQueue}
              onAdjustQueuePeople={handleAdjustQueuePeople}
              onAdjustQueueCounters={handleAdjustQueueCounters}
              onAssignStaffToQueue={handleAssignStaffToQueue}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onAcknowledgeAll={handleAcknowledgeAll}
              onClearAcknowledged={handleClearAcknowledged}
            />
          )}

          {activeTab === 'staff' && (
            <StaffManagementView
              staff={staff}
              zones={zones}
              searchQuery={searchQuery}
              onAssignStaffZone={handleAssignStaffZone}
              onToggleStaffStatus={handleToggleStaffStatus}
              onAddStaffMember={handleAddStaffMember}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView zones={zones} />}

          {activeTab === 'zones' && (
            <ZoneManagementView
              zones={zones}
              onAddZone={handleAddZone}
              onUpdateZone={handleUpdateZone}
              onDeleteZone={handleDeleteZone}
            />
          )}

          {activeTab === 'about' && <AboutProjectView />}

          {activeTab === 'settings' && (
            <SettingsView
              isSimulating={isSimulating}
              simulationIntervalMs={simulationIntervalMs}
              onChangeIntervalMs={setSimulationIntervalMs}
              autoAlertsEnabled={autoAlertsEnabled}
              onToggleAutoAlerts={() => setAutoAlertsEnabled((p) => !p)}
              onToggleSimulation={() => setIsSimulating((p) => !p)}
              onResetAllData={handleResetData}
              userRole={userRole}
              onChangeUserRole={setUserRole}
            />
          )}
        </main>
      </div>
    </div>
  );
}
