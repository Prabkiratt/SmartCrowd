import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Zone,
  LiveArea,
  QueueItem,
  StaffMember,
  SystemAlert,
} from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client only when valid credentials are provided in environment variables
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseUrl !== 'https://your-project-id.supabase.co'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch all crowd management tables from Supabase PostgreSQL
 */
export async function fetchCrowdStateFromSupabase() {
  if (!supabase) return null;

  const [zonesRes, areasRes, queuesRes, staffRes, alertsRes] = await Promise.all([
    supabase.from('zones').select('*'),
    supabase.from('live_areas').select('*'),
    supabase.from('queues').select('*'),
    supabase.from('staff_members').select('*'),
    supabase.from('system_alerts').select('*').order('created_at', { ascending: false }),
  ]);

  if (zonesRes.error) throw zonesRes.error;

  const formattedZones: Zone[] = (zonesRes.data || []).map((z: any) => ({
    id: z.id,
    name: z.name,
    currentPeople: z.current_people,
    capacity: z.capacity,
    warningThreshold: z.warning_threshold,
    criticalThreshold: z.critical_threshold,
    category: z.category,
    gridPos: { row: z.grid_row ?? 1, col: z.grid_col ?? 1 },
  }));

  const formattedAreas: LiveArea[] = (areasRes.data || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    currentPeople: a.current_people,
    maxCapacity: a.max_capacity,
  }));

  const formattedQueues: QueueItem[] = (queuesRes.data || []).map((q: any) => ({
    id: q.id,
    name: q.name,
    currentPeople: q.current_people,
    avgWaitMinutes: q.avg_wait_minutes,
    activeCounters: q.active_counters,
    maxCounters: q.max_counters,
    assignedStaffCount: q.assigned_staff_count,
  }));

  const formattedStaff: StaffMember[] = (staffRes.data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    assignedZone: s.assigned_zone,
    status: s.status,
    currentTask: s.current_task,
    contact: s.contact,
  }));

  const formattedAlerts: SystemAlert[] = (alertsRes.data || []).map((al: any) => ({
    id: al.id,
    title: al.title,
    message: al.message,
    severity: al.severity,
    timestamp: al.timestamp_label,
    zoneOrQueue: al.zone_or_queue,
    acknowledged: al.acknowledged,
  }));

  return {
    zones: formattedZones,
    liveAreas: formattedAreas,
    queues: formattedQueues,
    staff: formattedStaff,
    alerts: formattedAlerts,
  };
}

/**
 * Upsert all crowd management tables to Supabase PostgreSQL
 */
export async function syncCrowdStateToSupabase(payload: {
  zones: Zone[];
  liveAreas: LiveArea[];
  queues: QueueItem[];
  staff: StaffMember[];
  alerts: SystemAlert[];
}) {
  if (!supabase) return;

  await Promise.all([
    supabase.from('zones').upsert(
      payload.zones.map((z) => ({
        id: z.id,
        name: z.name,
        current_people: z.currentPeople,
        capacity: z.capacity,
        warning_threshold: z.warningThreshold,
        critical_threshold: z.criticalThreshold,
        category: z.category,
        grid_row: z.gridPos?.row ?? 1,
        grid_col: z.gridPos?.col ?? 1,
      }))
    ),
    supabase.from('live_areas').upsert(
      payload.liveAreas.map((a) => ({
        id: a.id,
        name: a.name,
        current_people: a.currentPeople,
        max_capacity: a.maxCapacity,
      }))
    ),
    supabase.from('queues').upsert(
      payload.queues.map((q) => ({
        id: q.id,
        name: q.name,
        current_people: q.currentPeople,
        avg_wait_minutes: q.avgWaitMinutes,
        active_counters: q.activeCounters,
        max_counters: q.maxCounters,
        assigned_staff_count: q.assignedStaffCount,
      }))
    ),
    supabase.from('staff_members').upsert(
      payload.staff.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        assigned_zone: s.assignedZone,
        status: s.status,
        current_task: s.currentTask,
        contact: s.contact,
      }))
    ),
    supabase.from('system_alerts').upsert(
      payload.alerts.map((al) => ({
        id: al.id,
        title: al.title,
        message: al.message,
        severity: al.severity,
        timestamp_label: al.timestamp,
        zone_or_queue: al.zoneOrQueue,
        acknowledged: al.acknowledged,
      }))
    ),
  ]);
}
