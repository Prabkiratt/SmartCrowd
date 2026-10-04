import { db } from './index.ts';
import {
  users,
  zones,
  liveAreas,
  queues,
  staffMembers,
  systemAlerts,
} from './schema.ts';
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
} from '../data/mockData.ts';
import { desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, role = 'System Administrator') {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          role,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Failed to synchronize user record in database.', { cause: error });
  }
}

export async function seedInitialCrowdStateIfEmpty() {
  try {
    const existingZones = await db.select().from(zones);
    if (existingZones.length === 0) {
      await db
        .insert(zones)
        .values(
          INITIAL_ZONES.map((z) => ({
            id: z.id,
            name: z.name,
            currentPeople: z.currentPeople,
            capacity: z.capacity,
            warningThreshold: z.warningThreshold,
            criticalThreshold: z.criticalThreshold,
            category: z.category,
            gridRow: z.gridPos.row,
            gridCol: z.gridPos.col,
          }))
        )
        .onConflictDoNothing();
    }

    const existingAreas = await db.select().from(liveAreas);
    if (existingAreas.length === 0) {
      await db
        .insert(liveAreas)
        .values(
          INITIAL_LIVE_AREAS.map((a) => ({
            id: a.id,
            name: a.name,
            currentPeople: a.currentPeople,
            maxCapacity: a.maxCapacity,
          }))
        )
        .onConflictDoNothing();
    }

    const existingQueues = await db.select().from(queues);
    if (existingQueues.length === 0) {
      await db
        .insert(queues)
        .values(
          INITIAL_QUEUES.map((q) => ({
            id: q.id,
            name: q.name,
            currentPeople: q.currentPeople,
            avgWaitMinutes: q.avgWaitMinutes,
            activeCounters: q.activeCounters,
            maxCounters: q.maxCounters,
            assignedStaffCount: q.assignedStaffCount,
          }))
        )
        .onConflictDoNothing();
    }

    const existingStaff = await db.select().from(staffMembers);
    if (existingStaff.length === 0) {
      await db
        .insert(staffMembers)
        .values(
          INITIAL_STAFF.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            assignedZone: s.assignedZone,
            status: s.status,
            currentTask: s.currentTask,
            contact: s.contact,
          }))
        )
        .onConflictDoNothing();
    }

    const existingAlerts = await db.select().from(systemAlerts);
    if (existingAlerts.length === 0) {
      await db
        .insert(systemAlerts)
        .values(
          INITIAL_ALERTS.map((al) => ({
            id: al.id,
            title: al.title,
            message: al.message,
            severity: al.severity,
            timestampLabel: al.timestamp,
            zoneOrQueue: al.zoneOrQueue,
            acknowledged: al.acknowledged,
          }))
        )
        .onConflictDoNothing();
    }
  } catch (error) {
    console.error('Failed to seed initial crowd state:', error);
    throw new Error('Database initialization failed. Please try again later.', { cause: error });
  }
}

export async function fetchFullCrowdState() {
  try {
    await seedInitialCrowdStateIfEmpty();

    const [dbZones, dbAreas, dbQueues, dbStaff, dbAlerts] = await Promise.all([
      db.select().from(zones),
      db.select().from(liveAreas),
      db.select().from(queues),
      db.select().from(staffMembers),
      db.select().from(systemAlerts).orderBy(desc(systemAlerts.createdAt)),
    ]);

    const formattedZones: Zone[] = dbZones.map((z) => ({
      id: z.id,
      name: z.name,
      currentPeople: z.currentPeople,
      capacity: z.capacity,
      warningThreshold: z.warningThreshold,
      criticalThreshold: z.criticalThreshold,
      category: z.category as Zone['category'],
      gridPos: { row: z.gridRow, col: z.gridCol },
    }));

    const formattedAreas: LiveArea[] = dbAreas.map((a) => ({
      id: a.id,
      name: a.name,
      currentPeople: a.currentPeople,
      maxCapacity: a.maxCapacity,
    }));

    const formattedQueues: QueueItem[] = dbQueues.map((q) => ({
      id: q.id,
      name: q.name,
      currentPeople: q.currentPeople,
      avgWaitMinutes: q.avgWaitMinutes,
      activeCounters: q.activeCounters,
      maxCounters: q.maxCounters,
      assignedStaffCount: q.assignedStaffCount,
    }));

    const formattedStaff: StaffMember[] = dbStaff.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role as StaffMember['role'],
      assignedZone: s.assignedZone,
      status: s.status as StaffMember['status'],
      currentTask: s.currentTask,
      contact: s.contact,
    }));

    const formattedAlerts: SystemAlert[] = dbAlerts.map((al) => ({
      id: al.id,
      title: al.title,
      message: al.message,
      severity: al.severity as SystemAlert['severity'],
      timestamp: al.timestampLabel,
      zoneOrQueue: al.zoneOrQueue,
      acknowledged: al.acknowledged,
    }));

    return {
      zones: formattedZones,
      liveAreas: formattedAreas,
      queues: formattedQueues,
      staff: formattedStaff,
      alerts: formattedAlerts,
    };
  } catch (error) {
    console.error('Database fetchFullCrowdState failed:', error);
    throw new Error('Failed to load crowd management state from database.', { cause: error });
  }
}

export async function syncFullCrowdState(payload: {
  zones: Zone[];
  liveAreas: LiveArea[];
  queues: QueueItem[];
  staff: StaffMember[];
  alerts: SystemAlert[];
}) {
  try {
    // Replace current tables cleanly inside try/catch
    await db.delete(zones);
    if (payload.zones.length > 0) {
      await db.insert(zones).values(
        payload.zones.map((z) => ({
          id: z.id,
          name: z.name,
          currentPeople: z.currentPeople,
          capacity: z.capacity,
          warningThreshold: z.warningThreshold,
          criticalThreshold: z.criticalThreshold,
          category: z.category,
          gridRow: z.gridPos?.row ?? 1,
          gridCol: z.gridPos?.col ?? 1,
        }))
      );
    }

    await db.delete(liveAreas);
    if (payload.liveAreas.length > 0) {
      await db.insert(liveAreas).values(
        payload.liveAreas.map((a) => ({
          id: a.id,
          name: a.name,
          currentPeople: a.currentPeople,
          maxCapacity: a.maxCapacity,
        }))
      );
    }

    await db.delete(queues);
    if (payload.queues.length > 0) {
      await db.insert(queues).values(
        payload.queues.map((q) => ({
          id: q.id,
          name: q.name,
          currentPeople: q.currentPeople,
          avgWaitMinutes: q.avgWaitMinutes,
          activeCounters: q.activeCounters,
          maxCounters: q.maxCounters,
          assignedStaffCount: q.assignedStaffCount,
        }))
      );
    }

    await db.delete(staffMembers);
    if (payload.staff.length > 0) {
      await db.insert(staffMembers).values(
        payload.staff.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          assignedZone: s.assignedZone,
          status: s.status,
          currentTask: s.currentTask,
          contact: s.contact,
        }))
      );
    }

    await db.delete(systemAlerts);
    if (payload.alerts.length > 0) {
      await db.insert(systemAlerts).values(
        payload.alerts.map((al) => ({
          id: al.id,
          title: al.title,
          message: al.message,
          severity: al.severity,
          timestampLabel: al.timestamp,
          zoneOrQueue: al.zoneOrQueue,
          acknowledged: al.acknowledged,
        }))
      );
    }

    return { ok: true };
  } catch (error) {
    console.error('Database syncFullCrowdState failed:', error);
    throw new Error('Failed to persist crowd state to database.', { cause: error });
  }
}
