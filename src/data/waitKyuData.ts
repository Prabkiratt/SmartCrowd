/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VenueQueue {
  id: string;
  name: string;
  category: 'salon' | 'barber' | 'clinic' | 'dentist' | 'restaurant' | 'car wash' | 'temple';
  city: string;
  area: string;
  state: string;
  distanceKm: number;
  rating: number;
  isOpen: boolean;
  currentServing: number;
  lastIssuedToken: number;
  avgServiceTimeMinutes: number;
  activeCounters: number;
  dailyCapacity: number;
  estimatedWaitMinutes: number;
  description: string;
  announcement?: string;
  history: CompletedQueueItem[];
}

export interface CompletedQueueItem {
  tokenNumber: number;
  customerName: string;
  completedAt: string;
  waitingTimeMinutes: number;
  servedByCounter?: number;
}

export interface CustomerTicket {
  ticketId: string;
  venueId: string;
  venueName: string;
  tokenNumber: number;
  customerName: string;
  phone: string;
  partySize: number;
  joinedAt: string;
  status: 'WAITING' | 'SERVING_NOW' | 'COMPLETED' | 'CANCELLED';
  qrCodeToken: string;
}

export interface MerchantAccount {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: 'salon' | 'barber' | 'clinic' | 'dentist' | 'restaurant' | 'car wash' | 'temple';
  city: string;
  area: string;
  venueId: string;
}

// Pan-India Curated Places in the Wait-Kyu marketplace format
export const INITIAL_VENUES: VenueQueue[] = [
  {
    id: 'venue-1',
    name: 'AIIMS Central OPD Consultation',
    category: 'clinic',
    city: 'New Delhi',
    state: 'Delhi NCR',
    area: 'Ansari Nagar East, Ring Road',
    distanceKm: 1.4,
    rating: 4.8,
    isOpen: true,
    currentServing: 42,
    lastIssuedToken: 55, // 13 in line
    avgServiceTimeMinutes: 6,
    activeCounters: 3,
    dailyCapacity: 250,
    estimatedWaitMinutes: 26,
    description: 'General OPD, specialist consultation triage & digital token entry.',
    announcement: 'Senior citizens and emergency referrals proceed directly to Counter 1.',
    history: [
      { tokenNumber: 39, customerName: 'Rajesh K.', completedAt: '10:45 AM', waitingTimeMinutes: 18 },
      { tokenNumber: 40, customerName: 'Sunita D.', completedAt: '10:55 AM', waitingTimeMinutes: 15 },
      { tokenNumber: 41, customerName: 'Amit S.', completedAt: '11:10 AM', waitingTimeMinutes: 20 },
    ],
  },
  {
    id: 'venue-2',
    name: 'Shree Siddhi Vinayak Temple Darshan',
    category: 'temple',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Prabhadevi, Dadar',
    distanceKm: 2.1,
    rating: 5.0,
    isOpen: true,
    currentServing: 78,
    lastIssuedToken: 96, // 18 in line
    avgServiceTimeMinutes: 3,
    activeCounters: 4,
    dailyCapacity: 1200,
    estimatedWaitMinutes: 14,
    description: 'Smart Darshan Pass & Token Verification. Join live line from hotel or transit.',
    announcement: 'Devotees with special passes please assemble at Gate No. 2.',
    history: [
      { tokenNumber: 75, customerName: 'Priya M.', completedAt: '10:30 AM', waitingTimeMinutes: 12 },
      { tokenNumber: 76, customerName: 'Gaurav N.', completedAt: '10:48 AM', waitingTimeMinutes: 15 },
      { tokenNumber: 77, customerName: 'Ramesh P.', completedAt: '11:05 AM', waitingTimeMinutes: 14 },
    ],
  },
  {
    id: 'venue-3',
    name: 'Kashi Vishwanath Corridor Queue Plaza',
    category: 'temple',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    area: 'Godowlia Chowk Gate 4',
    distanceKm: 3.5,
    rating: 4.9,
    isOpen: true,
    currentServing: 112,
    lastIssuedToken: 135, // 23 in line
    avgServiceTimeMinutes: 2,
    activeCounters: 5,
    dailyCapacity: 2000,
    estimatedWaitMinutes: 9,
    description: 'Corridor digital token queue. Avoid physical crowd crushing at inner barricades.',
    history: [
      { tokenNumber: 109, customerName: 'Vikas T.', completedAt: '10:15 AM', waitingTimeMinutes: 10 },
      { tokenNumber: 110, customerName: 'Ananya R.', completedAt: '10:40 AM', waitingTimeMinutes: 12 },
      { tokenNumber: 111, customerName: 'Kailash B.', completedAt: '10:58 AM', waitingTimeMinutes: 8 },
    ],
  },
  {
    id: 'venue-4',
    name: 'Toni & Guy Premium Salon & Spa',
    category: 'salon',
    city: 'Bengaluru',
    state: 'Karnataka',
    area: '100ft Rd, Indiranagar',
    distanceKm: 0.8,
    rating: 4.8,
    isOpen: true,
    currentServing: 14,
    lastIssuedToken: 18, // 4 in line
    avgServiceTimeMinutes: 8,
    activeCounters: 2,
    dailyCapacity: 60,
    estimatedWaitMinutes: 16,
    description: 'Hair styling, treatments and personal grooming with remote turn notification.',
    history: [
      { tokenNumber: 11, customerName: 'Aarav M.', completedAt: '10:45 AM', waitingTimeMinutes: 14 },
      { tokenNumber: 12, customerName: 'Sneha P.', completedAt: '10:55 AM', waitingTimeMinutes: 18 },
      { tokenNumber: 13, customerName: 'Kunal R.', completedAt: '11:10 AM', waitingTimeMinutes: 20 },
    ],
  },
  {
    id: 'venue-5',
    name: 'Vintage Blade Barbershop',
    category: 'barber',
    city: 'Chandigarh',
    state: 'Punjab / Chandigarh',
    area: 'Sector 17 Plaza Market',
    distanceKm: 1.2,
    rating: 4.9,
    isOpen: true,
    currentServing: 8,
    lastIssuedToken: 13, // 5 in line
    avgServiceTimeMinutes: 6,
    activeCounters: 2,
    dailyCapacity: 50,
    estimatedWaitMinutes: 15,
    description: 'Classic scissor cuts, beard trims and grooming with zero waiting room hassle.',
    history: [
      { tokenNumber: 5, customerName: 'Manpreet S.', completedAt: '10:30 AM', waitingTimeMinutes: 12 },
      { tokenNumber: 6, customerName: 'Harjit B.', completedAt: '10:48 AM', waitingTimeMinutes: 15 },
      { tokenNumber: 7, customerName: 'Dev K.', completedAt: '11:05 AM', waitingTimeMinutes: 14 },
    ],
  },
  {
    id: 'venue-6',
    name: 'CareWell Dental & Orthodontics',
    category: 'dentist',
    city: 'Hyderabad',
    state: 'Telangana',
    area: 'Banjara Hills Road No. 12',
    distanceKm: 2.4,
    rating: 4.7,
    isOpen: true,
    currentServing: 4,
    lastIssuedToken: 6, // 2 in line
    avgServiceTimeMinutes: 12,
    activeCounters: 1,
    dailyCapacity: 30,
    estimatedWaitMinutes: 24,
    description: 'Specialist dental consultations, ultrasonic teeth cleaning & braces review.',
    history: [
      { tokenNumber: 2, customerName: 'Meera N.', completedAt: '10:15 AM', waitingTimeMinutes: 22 },
      { tokenNumber: 3, customerName: 'Rohan G.', completedAt: '10:40 AM', waitingTimeMinutes: 25 },
    ],
  },
  {
    id: 'venue-7',
    name: 'Bawarchi Biryani & Kebabs',
    category: 'restaurant',
    city: 'Kolkata',
    state: 'West Bengal',
    area: 'Park Street Dining Zone',
    distanceKm: 3.1,
    rating: 4.8,
    isOpen: true,
    currentServing: 35,
    lastIssuedToken: 44, // 9 in line
    avgServiceTimeMinutes: 4,
    activeCounters: 3,
    dailyCapacity: 200,
    estimatedWaitMinutes: 12,
    description: 'Live table paging & dining queue. Wait at nearby bookshops without losing spot.',
    history: [
      { tokenNumber: 32, customerName: 'Subhashish D.', completedAt: '11:02 AM', waitingTimeMinutes: 16 },
      { tokenNumber: 33, customerName: 'Debolina G.', completedAt: '11:10 AM', waitingTimeMinutes: 14 },
      { tokenNumber: 34, customerName: 'Deepak J.', completedAt: '11:18 AM', waitingTimeMinutes: 11 },
    ],
  },
  {
    id: 'venue-8',
    name: 'SpeedyShine Foam Car Wash',
    category: 'car wash',
    city: 'Chennai',
    state: 'Tamil Nadu',
    area: 'OMR Expressway, Perungudi',
    distanceKm: 4.5,
    rating: 4.9,
    isOpen: true,
    currentServing: 7,
    lastIssuedToken: 10, // 3 in line
    avgServiceTimeMinutes: 15,
    activeCounters: 2,
    dailyCapacity: 40,
    estimatedWaitMinutes: 23,
    description: 'Touchless automated foam wash, chassis blast & express interior vacuum.',
    history: [
      { tokenNumber: 5, customerName: 'Karthik V.', completedAt: '10:30 AM', waitingTimeMinutes: 28 },
      { tokenNumber: 6, customerName: 'Farhan A.', completedAt: '10:55 AM', waitingTimeMinutes: 25 },
    ],
  },
];
