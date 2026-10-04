import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('System Administrator'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Monitored Zones table
export const zones = pgTable('zones', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  currentPeople: integer('current_people').notNull(),
  capacity: integer('capacity').notNull(),
  warningThreshold: integer('warning_threshold').notNull(),
  criticalThreshold: integer('critical_threshold').notNull(),
  category: text('category').notNull(),
  gridRow: integer('grid_row').notNull().default(1),
  gridCol: integer('grid_col').notNull().default(1),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Live Area Checkpoints table
export const liveAreas = pgTable('live_areas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  currentPeople: integer('current_people').notNull(),
  maxCapacity: integer('max_capacity').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Service Queues table
export const queues = pgTable('queues', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  currentPeople: integer('current_people').notNull(),
  avgWaitMinutes: integer('avg_wait_minutes').notNull(),
  activeCounters: integer('active_counters').notNull(),
  maxCounters: integer('max_counters').notNull(),
  assignedStaffCount: integer('assigned_staff_count').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Staff Roster table
export const staffMembers = pgTable('staff_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  assignedZone: text('assigned_zone').notNull(),
  status: text('status').notNull(),
  currentTask: text('current_task').notNull(),
  contact: text('contact').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. System Alerts table
export const systemAlerts = pgTable('system_alerts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity').notNull(),
  timestampLabel: text('timestamp_label').notNull(),
  zoneOrQueue: text('zone_or_queue').notNull(),
  acknowledged: boolean('acknowledged').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
