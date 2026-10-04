/**
 * Mock Data Models & Initial State for SmartCrowd
 * Real-Time Crowd Queue & Crowd Management System
 *
 * Designed for BCA College Project Demonstration:
 * Clean, self-contained local data structures that can be easily explained in viva
 * and later connected to Firebase Firestore or a REST API backend.
 */

export type DensityStatus = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Zone {
  id: string;
  name: string;
  currentPeople: number;
  capacity: number;
  warningThreshold: number; // People count where warning triggers
  criticalThreshold: number; // People count where critical alert triggers
  category: 'entry' | 'waiting' | 'service' | 'dining' | 'exit';
  gridPos: { row: number; col: number; spanCols?: number };
}

export interface LiveArea {
  id: string;
  name: string;
  currentPeople: number;
  maxCapacity: number;
}

export interface QueueItem {
  id: string;
  name: string;
  currentPeople: number;
  avgWaitMinutes: number;
  activeCounters: number;
  maxCounters: number;
  assignedStaffCount: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Security' | 'Manager' | 'Support' | 'Counter Operator' | 'Floor Coordinator';
  assignedZone: string;
  status: 'Available' | 'Busy' | 'On Break';
  currentTask: string;
  contact: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  timestamp: string;
  zoneOrQueue: string;
  acknowledged: boolean;
}

export interface AnalyticsSnapshot {
  time: string;
  crowdCount: number;
  queueLength: number;
  avgWait: number;
}

export interface DailyVisitorData {
  day: string;
  visitors: number;
  peakWait: number;
}

// Helper function to calculate occupancy percentage
export function getOccupancyPercent(current: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((current / capacity) * 100));
}

// Helper function to determine density status based on percentage or thresholds
export function getDensityStatus(
  current: number,
  capacity: number,
  warningThreshold?: number,
  criticalThreshold?: number
): DensityStatus {
  const pct = getOccupancyPercent(current, capacity);
  const warnPct = warningThreshold ? (warningThreshold / capacity) * 100 : 70;
  const critPct = criticalThreshold ? (criticalThreshold / capacity) * 100 : 88;

  if (pct >= critPct || pct >= 90) return 'Critical';
  if (pct >= warnPct || pct >= 70) return 'High';
  if (pct >= 45) return 'Medium';
  return 'Low';
}

// Helper function to generate zone-specific recommended actions
export function getZoneRecommendation(zone: Zone): string {
  const status = getDensityStatus(
    zone.currentPeople,
    zone.capacity,
    zone.warningThreshold,
    zone.criticalThreshold
  );

  if (status === 'Critical') {
    if (zone.name.toLowerCase().includes('entrance')) {
      return 'Open additional entry gate & divert inflow to Gate B immediately';
    }
    if (zone.name.toLowerCase().includes('waiting')) {
      return 'Halt new entries to Waiting Area; expedite active service counters';
    }
    return `Critical capacity reached in ${zone.name}. Deploy floor coordinators immediately`;
  }

  if (status === 'High') {
    if (zone.name.toLowerCase().includes('entrance')) {
      return 'Open additional entry gate';
    }
    if (zone.name.toLowerCase().includes('waiting')) {
      return 'Waiting Area is approaching maximum capacity. Open express counter';
    }
    if (zone.name.toLowerCase().includes('ticket')) {
      return 'Deploy 1 backup operator to Ticket Counter';
    }
    if (zone.name.toLowerCase().includes('service')) {
      return 'Reallocate support staff to speed up document verification';
    }
    return `Monitor inflow closely at ${zone.name} and prepare overflow lane`;
  }

  if (status === 'Medium') {
    return 'Flow is steady. Maintain current staff allocation';
  }

  return 'Normal operations. Area well within safe occupancy limits';
}

// Helper function to generate queue-specific recommended actions
export function getQueueRecommendation(queue: QueueItem): {
  statusLabel: 'Normal' | 'Moderate' | 'Busy' | 'Critical';
  recommendation: string;
} {
  if (queue.currentPeople > 70 || queue.avgWaitMinutes >= 28) {
    return {
      statusLabel: 'Critical',
      recommendation: 'Critical: Immediately deploy additional staff & open emergency counter',
    };
  }
  if (queue.currentPeople > 40 || queue.avgWaitMinutes >= 18) {
    return {
      statusLabel: 'Busy',
      recommendation: 'Open another service counter',
    };
  }
  if (queue.currentPeople > 20) {
    return {
      statusLabel: 'Moderate',
      recommendation: 'Standard queue flow; monitor wait time',
    };
  }
  return {
    statusLabel: 'Normal',
    recommendation: 'Optimal wait time; excess counters can handle background tasks',
  };
}

// 1. INITIAL ZONES (Matches Demo Mode requirements)
export const INITIAL_ZONES: Zone[] = [
  {
    id: 'zone-1',
    name: 'Main Entrance',
    currentPeople: 145,
    capacity: 200,
    warningThreshold: 140,
    criticalThreshold: 180,
    category: 'entry',
    gridPos: { row: 1, col: 1 },
  },
  {
    id: 'zone-2',
    name: 'Waiting Area',
    currentPeople: 175,
    capacity: 200,
    warningThreshold: 150,
    criticalThreshold: 180,
    category: 'waiting',
    gridPos: { row: 1, col: 2 },
  },
  {
    id: 'zone-3',
    name: 'Ticket Counter',
    currentPeople: 85,
    capacity: 100,
    warningThreshold: 70,
    criticalThreshold: 90,
    category: 'service',
    gridPos: { row: 1, col: 3 },
  },
  {
    id: 'zone-4',
    name: 'Food Court',
    currentPeople: 60,
    capacity: 150,
    warningThreshold: 110,
    criticalThreshold: 135,
    category: 'dining',
    gridPos: { row: 2, col: 1 },
  },
  {
    id: 'zone-5',
    name: 'Service Area',
    currentPeople: 95,
    capacity: 120,
    warningThreshold: 85,
    criticalThreshold: 108,
    category: 'service',
    gridPos: { row: 2, col: 2 },
  },
  {
    id: 'zone-6',
    name: 'Exit',
    currentPeople: 40,
    capacity: 150,
    warningThreshold: 110,
    criticalThreshold: 135,
    category: 'exit',
    gridPos: { row: 2, col: 3 },
  },
];

// 2. INITIAL LIVE AREAS (For Dashboard Live Area Status section)
export const INITIAL_LIVE_AREAS: LiveArea[] = [
  { id: 'area-1', name: 'Entrance', currentPeople: 120, maxCapacity: 200 },
  { id: 'area-2', name: 'Registration Counter', currentPeople: 58, maxCapacity: 80 },
  { id: 'area-3', name: 'Waiting Area', currentPeople: 175, maxCapacity: 200 },
  { id: 'area-4', name: 'Service Counter 1', currentPeople: 42, maxCapacity: 60 },
  { id: 'area-5', name: 'Service Counter 2', currentPeople: 53, maxCapacity: 60 },
  { id: 'area-6', name: 'Exit', currentPeople: 40, maxCapacity: 150 },
];

// 3. INITIAL QUEUES (Matches Demo Mode requirements)
export const INITIAL_QUEUES: QueueItem[] = [
  {
    id: 'queue-1',
    name: 'Ticket Counter',
    currentPeople: 45,
    avgWaitMinutes: 18,
    activeCounters: 2,
    maxCounters: 5,
    assignedStaffCount: 3,
  },
  {
    id: 'queue-2',
    name: 'Registration',
    currentPeople: 25,
    avgWaitMinutes: 10,
    activeCounters: 2,
    maxCounters: 4,
    assignedStaffCount: 2,
  },
  {
    id: 'queue-3',
    name: 'Service Counter',
    currentPeople: 52,
    avgWaitMinutes: 24,
    activeCounters: 2,
    maxCounters: 6,
    assignedStaffCount: 3,
  },
  {
    id: 'queue-4',
    name: 'Express Inquiry Desk',
    currentPeople: 16,
    avgWaitMinutes: 6,
    activeCounters: 2,
    maxCounters: 3,
    assignedStaffCount: 2,
  },
];

// 4. INITIAL STAFF
export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Rahul Sharma',
    role: 'Security',
    assignedZone: 'Main Entrance',
    status: 'Available',
    currentTask: 'Entry gate flow supervision & bag check',
    contact: '+91 98110 23401',
  },
  {
    id: 'staff-2',
    name: 'Aman Verma',
    role: 'Manager',
    assignedZone: 'Waiting Area',
    status: 'Busy',
    currentTask: 'Coordinating overflow seating & crowd announcements',
    contact: '+91 98110 23402',
  },
  {
    id: 'staff-3',
    name: 'Simran Kaur',
    role: 'Support',
    assignedZone: 'Ticket Counter',
    status: 'Available',
    currentTask: 'Assisting visitors with digital token kiosk',
    contact: '+91 98110 23403',
  },
  {
    id: 'staff-4',
    name: 'Vikram Patel',
    role: 'Counter Operator',
    assignedZone: 'Service Area',
    status: 'Busy',
    currentTask: 'Operating Service Counter #1 & #2',
    contact: '+91 98110 23404',
  },
  {
    id: 'staff-5',
    name: 'Priya Nair',
    role: 'Floor Coordinator',
    assignedZone: 'Food Court',
    status: 'Available',
    currentTask: 'Monitoring seating turnover & sanitation clearance',
    contact: '+91 98110 23405',
  },
  {
    id: 'staff-6',
    name: 'Karan Malhotra',
    role: 'Security',
    assignedZone: 'Exit',
    status: 'Available',
    currentTask: 'Ensuring unobstructed one-way exit corridor',
    contact: '+91 98110 23406',
  },
  {
    id: 'staff-7',
    name: 'Neha Gupta',
    role: 'Counter Operator',
    assignedZone: 'Ticket Counter',
    status: 'Busy',
    currentTask: 'Handling high-priority pass issuance',
    contact: '+91 98110 23407',
  },
];

// 5. INITIAL ALERTS
export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'alert-1',
    title: 'HIGH CROWD',
    message: 'Waiting Area has reached 88% capacity (175 / 200 people).',
    severity: 'Warning',
    timestamp: '2 mins ago',
    zoneOrQueue: 'Waiting Area',
    acknowledged: false,
  },
  {
    id: 'alert-2',
    title: 'LONG QUEUE',
    message: 'Service Counter waiting time is 24 minutes (52 people in queue).',
    severity: 'Critical',
    timestamp: '4 mins ago',
    zoneOrQueue: 'Service Counter',
    acknowledged: false,
  },
  {
    id: 'alert-3',
    title: 'HIGH CROWD',
    message: 'Ticket Counter has reached 85% capacity (85 / 100 people).',
    severity: 'Warning',
    timestamp: '7 mins ago',
    zoneOrQueue: 'Ticket Counter',
    acknowledged: false,
  },
  {
    id: 'alert-4',
    title: 'QUEUE THRESHOLD',
    message: 'Ticket Counter queue exceeded 40 people (currently 45 people).',
    severity: 'Info',
    timestamp: '12 mins ago',
    zoneOrQueue: 'Ticket Counter',
    acknowledged: true,
  },
];

// 6. ANALYTICS HISTORICAL DATA (For Today, Last 7 Days, Last 30 Days)
export const ANALYTICS_TIME_SERIES: Record<'today' | '7days' | '30days', AnalyticsSnapshot[]> = {
  today: [
    { time: '09:00 AM', crowdCount: 180, queueLength: 35, avgWait: 7 },
    { time: '11:00 AM', crowdCount: 340, queueLength: 78, avgWait: 13 },
    { time: '01:00 PM', crowdCount: 490, queueLength: 112, avgWait: 17 },
    { time: '03:00 PM', crowdCount: 540, queueLength: 124, avgWait: 19 },
    { time: '05:00 PM', crowdCount: 685, queueLength: 168, avgWait: 25 },
    { time: '06:30 PM', crowdCount: 600, queueLength: 138, avgWait: 20 },
    { time: '08:00 PM', crowdCount: 310, queueLength: 54, avgWait: 9 },
  ],
  '7days': [
    { time: 'Mon', crowdCount: 520, queueLength: 110, avgWait: 15 },
    { time: 'Tue', crowdCount: 495, queueLength: 98, avgWait: 13 },
    { time: 'Wed', crowdCount: 560, queueLength: 130, avgWait: 18 },
    { time: 'Thu', crowdCount: 590, queueLength: 142, avgWait: 19 },
    { time: 'Fri', crowdCount: 670, queueLength: 165, avgWait: 23 },
    { time: 'Sat', crowdCount: 740, queueLength: 190, avgWait: 27 },
    { time: 'Sun', crowdCount: 600, queueLength: 138, avgWait: 18 },
  ],
  '30days': [
    { time: 'Week 1', crowdCount: 540, queueLength: 120, avgWait: 16 },
    { time: 'Week 2', crowdCount: 585, queueLength: 136, avgWait: 18 },
    { time: 'Week 3', crowdCount: 630, queueLength: 154, avgWait: 21 },
    { time: 'Week 4', crowdCount: 600, queueLength: 138, avgWait: 18 },
  ],
};

export const DAILY_VISITORS_DATA: DailyVisitorData[] = [
  { day: 'Mon', visitors: 2450, peakWait: 16 },
  { day: 'Tue', visitors: 2310, peakWait: 14 },
  { day: 'Wed', visitors: 2780, peakWait: 19 },
  { day: 'Thu', visitors: 2940, peakWait: 20 },
  { day: 'Fri', visitors: 3420, peakWait: 24 },
  { day: 'Sat', visitors: 4120, peakWait: 29 },
  { day: 'Sun', visitors: 3680, peakWait: 22 },
];
