/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Search,
  MapPin,
  Clock,
  Users,
  Ticket,
  QrCode,
  Store,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Plus,
  ShieldCheck,
  Star,
  Sparkles,
  Phone,
  User,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  Share2,
  Download,
  Building2,
  Check,
  Copy,
  Info,
  Globe,
  ExternalLink,
  Loader2,
  LogIn,
  Database,
  Shield,
} from 'lucide-react';

import {
  auth,
  googleAuthProvider,
  db,
} from './lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { GeminiChatbot } from './components/GeminiChatbot';

import {
  VenueQueue,
  CustomerTicket,
  MerchantAccount,
  INITIAL_VENUES,
} from './data/waitKyuData';

// Storage keys
const STORAGE_VENUES = 'smartcrowd_waitkyu_venues_v3';
const STORAGE_TICKETS = 'smartcrowd_waitkyu_tickets_v3';
const STORAGE_MERCHANT = 'smartcrowd_waitkyu_merchant_v3';
const STORAGE_USER = 'smartcrowd_waitkyu_customer_v3';

export type AppView =
  | 'home'
  | 'explore'
  | 'venue-detail'
  | 'my-ticket'
  | 'merchant-dashboard'
  | 'merchant-onboarding'
  | 'auth';

export type CategoryFilter =
  | 'all'
  | 'salon'
  | 'barber'
  | 'dentist'
  | 'clinic'
  | 'restaurant'
  | 'car wash'
  | 'temple';

export default function App() {
  // 1. Core State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('venue-1');

  // Venues (Persisted in localStorage)
  const [venues, setVenues] = useState<VenueQueue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENUES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_VENUES;
  });

  // Customer Tickets (Persisted in localStorage)
  const [tickets, setTickets] = useState<CustomerTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TICKETS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        ticketId: 'TKT-8902',
        venueId: 'venue-1',
        venueName: 'AIIMS Central OPD Consultation',
        tokenNumber: 52,
        customerName: 'Prabhkirat Singh',
        phone: '+91 98765 43210',
        partySize: 1,
        joinedAt: '11:15 AM',
        status: 'WAITING',
        qrCodeToken: 'SC-DEL-52-AIIMS',
      },
    ];
  });

  // Active Merchant Session
  const [activeMerchant, setActiveMerchant] = useState<MerchantAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MERCHANT);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'merch-1',
      businessName: 'AIIMS Central OPD Consultation',
      ownerName: 'Dr. Sharma',
      email: 'opd@aiims.edu',
      phone: '+91 98111 22334',
      category: 'clinic',
      city: 'New Delhi',
      area: 'Ansari Nagar East',
      venueId: 'venue-1',
    };
  });

  // Customer Profile
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_USER) || 'Prabhkirat Singh';
  });
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98765 43210');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All India');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedSort, setSelectedSort] = useState<'wait' | 'rating' | 'distance'>('wait');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Join Queue Modal form state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinVenueTarget, setJoinVenueTarget] = useState<VenueQueue | null>(null);
  const [joinPartySize, setJoinPartySize] = useState<number>(1);
  const [qrModalVenue, setQrModalVenue] = useState<VenueQueue | null>(null);

  // Merchant New Venue form
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState<CategoryFilter>('salon');
  const [newBizCity, setNewBizCity] = useState('New Delhi');
  const [newBizArea, setNewBizArea] = useState('Connaught Place');
  const [newBizAvgTime, setNewBizAvgTime] = useState('6');
  const [newBizCounters, setNewBizCounters] = useState('2');
  const [copiedLink, setCopiedLink] = useState(false);

  // Firebase Auth & Firestore Sync state
  // Extended Auth State
  const [customerEmail, setCustomerEmail] = useState<string>(() => {
    return localStorage.getItem('smartcrowd_user_email') || 'visitor@smartcrowd.in';
  });
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('demo.visitor@smartcrowd.in');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authFullName, setAuthFullName] = useState('Aarav Sharma');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // Firebase Auth & Firestore Sync state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isFirestoreSynced, setIsFirestoreSynced] = useState(false);

  // Interactive Live Queue Simulator State (For Landing Page)
  const [simWaitingInput, setSimWaitingInput] = useState<number>(10);
  const [simActiveToken, setSimActiveToken] = useState<number | null>(11);
  const [simCurrentServing, setSimCurrentServing] = useState<number>(1);
  const [simAvgServiceTime, setSimAvgServiceTime] = useState<number>(5);

  // Helper calculations for Interactive Queue Simulator
  const simPeopleBefore = simActiveToken !== null ? Math.max(0, simActiveToken - simCurrentServing) : 0;
  const simEstimatedWait = simPeopleBefore * simAvgServiceTime;

  // Crowd status classification based on requirements:
  // Green = Low (<10), Yellow = Moderate (10-25), Orange = Busy (26-50), Red = Very Busy (>50)
  const getCrowdStatus = (count: number) => {
    if (count < 10) {
      return {
        level: 'Low',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        badgeBg: 'bg-emerald-500',
        alert: 'Queue is currently low.',
      };
    }
    if (count <= 25) {
      return {
        level: 'Moderate',
        color: 'text-amber-800 bg-amber-50 border-amber-300',
        badgeBg: 'bg-amber-400',
        alert: 'Moderate crowd. Normal waiting time.',
      };
    }
    if (count <= 50) {
      return {
        level: 'Busy',
        color: 'text-orange-800 bg-orange-50 border-orange-300',
        badgeBg: 'bg-orange-500',
        alert: 'Busy queue. Waiting time is increasing.',
      };
    }
    return {
      level: 'Very Busy',
      color: 'text-red-800 bg-red-50 border-red-300',
      badgeBg: 'bg-red-500',
      alert: 'High crowd! Consider opening another counter.',
    };
  };

  const simCrowdStatus = getCrowdStatus(simPeopleBefore);

  // Simulator actions
  const handleSimGenerateToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const count = Math.max(0, Number(simWaitingInput) || 0);
    const newToken = count + 1;
    setSimActiveToken(newToken);
    setSimCurrentServing(1);
    showToast(`Token #${newToken} generated! ${count} people before you.`);
  };

  const handleSimServeNext = () => {
    if (simActiveToken === null) {
      showToast('Please generate a queue token first.');
      return;
    }
    if (simCurrentServing >= simActiveToken) {
      showToast(`🎉 Token #${simActiveToken} is being served right now! It is your turn.`);
      return;
    }
    const nextServing = simCurrentServing + 1;
    setSimCurrentServing(nextServing);
    if (nextServing === simActiveToken) {
      showToast(`🔔 Token #${nextServing}: It's your turn now! Please proceed to the service counter.`);
    } else {
      showToast(`Now serving Token #${nextServing}. Queue moved forward!`);
    }
  };

  const handleSimLeaveQueue = () => {
    setSimActiveToken(null);
    showToast('You have left the simulation queue.');
  };

  const handleSimReset = () => {
    setSimWaitingInput(10);
    setSimActiveToken(11);
    setSimCurrentServing(1);
    showToast('Queue simulator reset to Token #11 with 10 people waiting.');
  };

  // Auth computed state
  const isAuthenticated = Boolean(
    firebaseUser || (customerEmail && customerName && customerName !== 'Visitor')
  );
  const activeUserDisplayName = firebaseUser?.displayName || customerName || 'Visitor';
  const activeUserEmail = firebaseUser?.email || customerEmail || '';

  // Listen to Firebase Auth state & sync with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        if (u.displayName) {
          setCustomerName(u.displayName);
          try {
            localStorage.setItem(STORAGE_USER, u.displayName);
          } catch {
            // ignore
          }
        }
        if (u.email) {
          setCustomerEmail(u.email);
          try {
            localStorage.setItem('smartcrowd_user_email', u.email);
          } catch {
            // ignore
          }
        }
        try {
          // Persist user profile to Firestore
          await setDoc(
            doc(db, 'users', u.uid),
            {
              uid: u.uid,
              name: u.displayName || 'SmartCrowd User',
              email: u.email || '',
              photoURL: u.photoURL || '',
              lastSeen: new Date().toISOString(),
            },
            { merge: true }
          );
          setIsFirestoreSynced(true);

          // Retrieve user's existing tickets from Firestore
          const q = query(collection(db, 'tickets'), where('userId', '==', u.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const fetchedTickets: CustomerTicket[] = [];
            snapshot.forEach((snapDoc) => {
              const data = snapDoc.data();
              fetchedTickets.push({
                ticketId: data.ticketId || snapDoc.id,
                venueId: data.venueId,
                venueName: data.venueName,
                tokenNumber: data.tokenNumber,
                customerName: data.customerName,
                phone: data.phone,
                partySize: data.partySize || 1,
                joinedAt: data.joinedAt,
                status: data.status,
                qrCodeToken: data.qrCodeToken,
              });
            });
            if (fetchedTickets.length > 0) {
              setTickets((prev) => {
                const map = new Map<string, CustomerTicket>();
                fetchedTickets.forEach((t) => map.set(t.ticketId, t));
                prev.forEach((t) => {
                  if (!map.has(t.ticketId)) map.set(t.ticketId, t);
                });
                return Array.from(map.values());
              });
            }
          }
        } catch (err) {
          console.warn('Firestore initial sync note:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      setFirebaseUser(result.user);
      if (result.user.displayName) setCustomerName(result.user.displayName);
      if (result.user.email) setCustomerEmail(result.user.email);
      setIsAuthModalOpen(false);
      if (currentView === 'auth') setCurrentView('home');
      showToast(`Welcome ${result.user.displayName || 'Visitor'}! Signed in with Google.`);
    } catch (err: any) {
      console.warn('Google Sign In:', err);
      showToast('Google Sign In completed or popup handled. Demo credentials also active.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    if (!authEmail.trim() || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!authPassword.trim() || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    const derivedName = authEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    setCustomerName(formattedName);
    setCustomerEmail(authEmail.trim());
    localStorage.setItem(STORAGE_USER, formattedName);
    localStorage.setItem('smartcrowd_user_email', authEmail.trim());

    // Save profile to Firestore
    try {
      setDoc(doc(db, 'users', `usr_${authEmail.replace(/[^a-zA-Z0-9]/g, '_')}`), {
        email: authEmail.trim(),
        name: formattedName,
        lastLogin: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } catch {}

    setIsAuthModalOpen(false);
    if (currentView === 'auth') setCurrentView('home');
    showToast(`Welcome back, ${formattedName}! Signed in.`);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    if (!authFullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!authEmail.trim() || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match. Please verify.');
      return;
    }

    const trimmedName = authFullName.trim();
    const trimmedEmail = authEmail.trim();

    setCustomerName(trimmedName);
    setCustomerEmail(trimmedEmail);
    localStorage.setItem(STORAGE_USER, trimmedName);
    localStorage.setItem('smartcrowd_user_email', trimmedEmail);

    setAuthSuccessMessage('Account created successfully.');
    showToast('Account created successfully.');

    // Save profile to Firestore
    try {
      const mockUid = `usr_${Date.now()}`;
      setDoc(doc(db, 'users', mockUid), {
        uid: mockUid,
        name: trimmedName,
        email: trimmedEmail,
        createdAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } catch {}

    setTimeout(() => {
      setIsAuthModalOpen(false);
      if (currentView === 'auth') setCurrentView('home');
    }, 1200);
  };

  const handleDemoSignIn = () => {
    const demoName = 'Aarav Sharma';
    const demoEmail = 'aarav.sharma@smartcrowd.in';
    setCustomerName(demoName);
    setCustomerEmail(demoEmail);
    try {
      localStorage.setItem(STORAGE_USER, demoName);
      localStorage.setItem('smartcrowd_user_email', demoEmail);
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
    if (currentView === 'auth') setCurrentView('home');
    showToast(`Signed in as Demo User (${demoName})`);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out note:', err);
    }
    setFirebaseUser(null);
    setCustomerName('Visitor');
    setCustomerEmail('');
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem('smartcrowd_user_email');
    showToast('Signed out of SmartCrowd.');
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VENUES, JSON.stringify(venues));
    } catch {
      // ignore
    }
  }, [venues]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TICKETS, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  useEffect(() => {
    try {
      if (activeMerchant) {
        localStorage.setItem(STORAGE_MERCHANT, JSON.stringify(activeMerchant));
      } else {
        localStorage.removeItem(STORAGE_MERCHANT);
      }
    } catch {
      // ignore
    }
  }, [activeMerchant]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  // Helper: Get venue by id
  const getVenue = (id: string) => venues.find((v) => v.id === id) || venues[0];

  // Selected Venue
  const currentVenue = useMemo(() => getVenue(selectedVenueId), [venues, selectedVenueId]);

  // Active user ticket (if any)
  const activeTicket = useMemo(() => {
    return tickets.find((t) => t.status === 'WAITING' || t.status === 'SERVING_NOW') || null;
  }, [tickets]);

  // Overall Statistics across marketplace
  const stats = useMemo(() => {
    const openQueues = venues.filter((v) => v.isOpen).length;
    const peopleInLine = venues.reduce((acc, v) => {
      const inLine = Math.max(0, v.lastIssuedToken - v.currentServing);
      return acc + inLine;
    }, 0);
    const customersServed = venues.reduce((acc, v) => acc + v.history.length, 0) + 184;
    return { openQueues, peopleInLine, customersServed };
  }, [venues]);

  // Cities List for Pan-India Selector
  const citiesList = useMemo(() => {
    const uniqueCities = Array.from(new Set(venues.map((v) => v.city)));
    return ['All India', ...uniqueCities];
  }, [venues]);

  // Filtered & Sorted Venues for Explore
  const filteredVenues = useMemo(() => {
    let list = [...venues];
    if (selectedCity !== 'All India') {
      list = list.filter((v) => v.city === selectedCity);
    }
    if (selectedCategory !== 'all') {
      list = list.filter((v) => v.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.area.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (selectedSort === 'wait') {
        const waitA = Math.max(
          1,
          Math.round(((a.lastIssuedToken - a.currentServing) * a.avgServiceTimeMinutes) / (a.activeCounters || 1))
        );
        const waitB = Math.max(
          1,
          Math.round(((b.lastIssuedToken - b.currentServing) * b.avgServiceTimeMinutes) / (b.activeCounters || 1))
        );
        return waitA - waitB;
      }
      if (selectedSort === 'rating') return b.rating - a.rating;
      return a.distanceKm - b.distanceKm;
    });
    return list;
  }, [venues, selectedCity, selectedCategory, searchQuery, selectedSort]);

  // Category list with counts
  const categoriesList: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All Places', icon: '⚡' },
    { id: 'clinic', label: 'Clinics & Hospitals', icon: '🩺' },
    { id: 'temple', label: 'Temple Darshan', icon: '🛕' },
    { id: 'salon', label: 'Salon & Spa', icon: '✂️' },
    { id: 'barber', label: 'Barber Shop', icon: '💈' },
    { id: 'dentist', label: 'Dentist', icon: '🦷' },
    { id: 'restaurant', label: 'Restaurants', icon: '🍜' },
    { id: 'car wash', label: 'Car Wash', icon: '🚗' },
  ];

  // Customer Actions: Take Ticket
  const handleOpenJoinModal = (venue: VenueQueue) => {
    setJoinVenueTarget(venue);
    setJoinPartySize(1);
    setJoinModalOpen(true);
  };

  const handleConfirmJoinQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinVenueTarget) return;

    const currentV = getVenue(joinVenueTarget.id);
    const newTokenNum = currentV.lastIssuedToken + 1;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ticketCode = `SC-${currentV.city.slice(0, 3).toUpperCase()}-${newTokenNum}-${Math.floor(100 + Math.random() * 900)}`;

    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === currentV.id) {
          const inLine = newTokenNum - v.currentServing;
          const waitMins = Math.max(
            1,
            Math.round((inLine * v.avgServiceTimeMinutes) / (v.activeCounters || 1))
          );
          return {
            ...v,
            lastIssuedToken: newTokenNum,
            estimatedWaitMinutes: waitMins,
          };
        }
        return v;
      })
    );

    const newTicket: CustomerTicket = {
      ticketId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      venueId: currentV.id,
      venueName: currentV.name,
      tokenNumber: newTokenNum,
      customerName: customerName.trim() || 'Guest Visitor',
      phone: customerPhone.trim() || '+91 98765 00000',
      partySize: joinPartySize,
      joinedAt: nowTime,
      status: 'WAITING',
      qrCodeToken: ticketCode,
    };

    setTickets((prev) => [newTicket, ...prev.filter((t) => t.status !== 'WAITING')]);
    setJoinModalOpen(false);
    setSelectedVenueId(currentV.id);
    setCurrentView('my-ticket');

    // Async persist to Firestore
    try {
      setDoc(doc(db, 'tickets', newTicket.ticketId), {
        ...newTicket,
        userId: firebaseUser ? firebaseUser.uid : 'guest',
        persistedAt: new Date().toISOString(),
      }).then(() => {
        setIsFirestoreSynced(true);
      }).catch((e) => console.warn('Firestore ticket sync:', e));
    } catch (e) {
      console.warn('Firestore save err:', e);
    }

    showToast(`You took Ticket #${newTokenNum} at ${currentV.name}! Your live position is saved.`);
  };

  const handleCancelTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, status: 'CANCELLED' } : t))
    );
    // Sync cancel to Firestore
    try {
      updateDoc(doc(db, 'tickets', ticketId), {
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
      }).catch((e) => console.warn('Firestore cancel sync:', e));
    } catch (e) {
      // ignore
    }
    showToast('Your queue ticket was cancelled.');
  };

  // Merchant Actions
  const handleMerchantServeNext = (venueId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          if (v.currentServing >= v.lastIssuedToken) {
            showToast('No more people waiting in the queue.');
            return v;
          }

          const servedToken = v.currentServing;
          const nextServing = v.currentServing + 1;
          const newHistory = [
            {
              tokenNumber: servedToken,
              customerName: `Visitor #${servedToken}`,
              completedAt: nowTime,
              waitingTimeMinutes: Math.round(v.avgServiceTimeMinutes * 1.2),
              servedByCounter: Math.floor(Math.random() * v.activeCounters) + 1,
            },
            ...v.history,
          ];

          setTickets((tList) =>
            tList.map((t) => {
              if (t.venueId === venueId && t.tokenNumber === servedToken) {
                // Update Firestore if present
                updateDoc(doc(db, 'tickets', t.ticketId), {
                  status: 'COMPLETED',
                  completedAt: nowTime,
                }).catch(() => {});
                return { ...t, status: 'COMPLETED' };
              }
              if (t.venueId === venueId && t.tokenNumber === nextServing) {
                updateDoc(doc(db, 'tickets', t.ticketId), {
                  status: 'SERVING_NOW',
                }).catch(() => {});
                return { ...t, status: 'SERVING_NOW' };
              }
              return t;
            })
          );

          showToast(`Token #${servedToken} completed! Now calling Token #${nextServing}`);

          return {
            ...v,
            currentServing: nextServing,
            history: newHistory,
          };
        }
        return v;
      })
    );
  };

  const handleMerchantAddWalkIn = (venueId: string) => {
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          const newToken = v.lastIssuedToken + 1;
          showToast(`Walk-in visitor added with Token #${newToken}`);
          return {
            ...v,
            lastIssuedToken: newToken,
          };
        }
        return v;
      })
    );
  };

  const handleMerchantResetQueue = (venueId: string) => {
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          showToast(`Queue for ${v.name} was reset.`);
          return {
            ...v,
            currentServing: 1,
            lastIssuedToken: 1,
          };
        }
        return v;
      })
    );
  };

  const handleToggleQueueOpen = (venueId: string) => {
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          const newState = !v.isOpen;
          showToast(newState ? `${v.name} is now OPEN for queueing` : `${v.name} is now CLOSED`);
          return { ...v, isOpen: newState };
        }
        return v;
      })
    );
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) {
      showToast('Please enter a business or venue name');
      return;
    }
    const newId = `venue-${venues.length + 1}`;
    const newV: VenueQueue = {
      id: newId,
      name: newBizName.trim(),
      category: newBizCategory as any,
      city: newBizCity.trim() || 'New Delhi',
      state: 'India',
      area: newBizArea.trim() || 'Central Complex',
      distanceKm: 0.5,
      rating: 5.0,
      isOpen: true,
      currentServing: 1,
      lastIssuedToken: 3,
      avgServiceTimeMinutes: parseInt(newBizAvgTime, 10) || 6,
      activeCounters: parseInt(newBizCounters, 10) || 1,
      dailyCapacity: 100,
      estimatedWaitMinutes: (parseInt(newBizAvgTime, 10) || 6) * 2,
      description: 'Listed on SmartCrowd live crowd marketplace. Instant QR check-in enabled.',
      history: [],
    };

    const newMerchant: MerchantAccount = {
      id: `merch-${Date.now()}`,
      businessName: newV.name,
      ownerName: customerName || 'Venue Manager',
      email: `${newV.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@smartcrowd.in`,
      phone: customerPhone || '+91 98000 12345',
      category: newV.category,
      city: newV.city,
      area: newV.area,
      venueId: newId,
    };

    setVenues((prev) => [newV, ...prev]);
    setActiveMerchant(newMerchant);
    setSelectedVenueId(newId);
    setCurrentView('merchant-dashboard');
    showToast(`🎉 Congratulations! ${newV.name} is now live on SmartCrowd!`);
  };

  // Helper calculations for a venue
  const getVenueWaitingCount = (v: VenueQueue) => Math.max(0, v.lastIssuedToken - v.currentServing);
  const getVenueEstimatedWait = (v: VenueQueue) => {
    const inLine = getVenueWaitingCount(v);
    const counters = Math.max(1, v.activeCounters);
    return Math.max(1, Math.round((inLine * v.avgServiceTimeMinutes) / counters));
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1a1a17] flex flex-col font-sans selection:bg-[#ffc21a] selection:text-[#1a1a17]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#faf6ee]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo Brand Lockup with SmartCrowd Name */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            {/* Signature Logo SVG */}
            <svg
              width="38"
              height="38"
              viewBox="0 0 64 64"
              className="transition-transform group-hover:rotate-[-10deg]"
            >
              <g transform="rotate(-7 32 32)">
                <path
                  d="M12 10H52a8 8 0 0 1 8 8V26a6 6 0 0 0 0 12V46a8 8 0 0 1-8 8H12a8 8 0 0 1-8-8V38a6 6 0 0 0 0-12V18a8 8 0 0 1 8-8Z"
                  fill="#ffc21a"
                  stroke="#1a1a17"
                  strokeWidth="2.5"
                />
                <path
                  d="M39.5 15.5V48.5"
                  stroke="#1a1a17"
                  strokeOpacity=".35"
                  strokeWidth="1.8"
                  strokeDasharray="2.2 3.6"
                  strokeLinecap="round"
                />
                <path
                  d="M14.6 27.2a7.4 7.4 0 1 1 10.6 6.6c-2 1-3.1 2.2-3.1 4.4"
                  fill="none"
                  stroke="#1a1a17"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx="22.2" cy="46.4" r="3.2" fill="#d9421c" />
                <circle cx="48.2" cy="32" r="4.8" fill="none" stroke="#1a1a17" strokeWidth="2.3" />
                <path
                  d="M48.2 29.2V32l2 1.2"
                  fill="none"
                  stroke="#1a1a17"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>

            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.45rem] font-extrabold tracking-tight text-stone-900">
                SmartCrowd<span className="text-[#d9421c]">.</span>
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Never wait blindly · Live India Queues
              </span>
            </span>
          </button>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-semibold">
            {/* Homepage Button */}
            <button
              onClick={() => setCurrentView('home')}
              className={`rounded-lg px-3 py-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'home' ? 'bg-[#ffc21a] text-[#1a1a17]' : 'hover:bg-[#f3eee3] text-stone-700'
              }`}
            >
              <Home className="w-4 h-4 text-[#d9421c]" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentView('explore')}
              className={`rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                currentView === 'explore' ? 'bg-[#ffc21a] text-[#1a1a17]' : 'hover:bg-[#f3eee3] text-stone-700'
              }`}
            >
              Explore Queues
            </button>

            {/* My Ticket Tab with Badge */}
            <button
              onClick={() => setCurrentView('my-ticket')}
              className={`relative rounded-lg px-3 py-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'my-ticket' ? 'bg-[#ffc21a] text-[#1a1a17]' : 'hover:bg-[#f3eee3] text-stone-700'
              }`}
            >
              <Ticket className="w-4 h-4 text-[#d9421c]" />
              <span>My Ticket</span>
              {activeTicket && (
                <span className="w-2 h-2 rounded-full bg-[#d9421c] animate-pulse" />
              )}
            </button>

            {/* Merchant Dashboard Tab */}
            <button
              onClick={() => {
                if (activeMerchant) {
                  setSelectedVenueId(activeMerchant.venueId);
                  setCurrentView('merchant-dashboard');
                } else {
                  setCurrentView('merchant-onboarding');
                }
              }}
              className={`hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                currentView === 'merchant-dashboard'
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-800/20 hover:bg-[#f3eee3] text-stone-900'
              }`}
            >
              <Store className="w-4 h-4 text-[#ffc21a]" />
              <span>For Businesses</span>
            </button>

            <button
              onClick={() => setCurrentView('merchant-onboarding')}
              className="hidden sm:inline-block rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              + List Venue
            </button>

            {/* User Session / Sign In Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-300">
                <button
                  onClick={() => setCurrentView('auth')}
                  title={`Signed in as ${activeUserDisplayName} (${activeUserEmail}) · View Profile`}
                  className="flex items-center gap-1.5 bg-white border border-stone-300 hover:border-stone-400 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-800 shadow-sm cursor-pointer transition-colors"
                >
                  {firebaseUser?.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={activeUserDisplayName}
                      className="w-5 h-5 rounded-full object-cover border border-stone-300"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#ffc21a] text-[#1a1a17] font-bold flex items-center justify-center text-[10px]">
                      {(activeUserDisplayName || 'U')[0].toUpperCase()}
                    </span>
                  )}
                  <span className="hidden md:inline max-w-[95px] truncate font-bold">
                    {activeUserDisplayName.split(' ')[0]}
                  </span>
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                    title="Active Cloud Session"
                  />
                </button>
                <button
                  onClick={handleSignOut}
                  title="Sign out of SmartCrowd"
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setCurrentView('auth');
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-900 bg-white hover:bg-amber-50 px-3 py-1.5 text-xs font-bold text-stone-900 transition-colors cursor-pointer shadow-sm shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#d9421c]" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={handleDemoSignIn}
                  className="hidden md:inline-flex items-center gap-1 rounded-lg border border-stone-800/20 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                  title="Instant Demo Login (No password required)"
                >
                  <span>Demo</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Real-Time Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border-2 border-stone-900 bg-[#ffc21a] px-4 py-3 text-sm font-bold text-stone-900 shadow-[4px_4px_0_0_#1a1a17] transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#d9421c] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-xs font-mono opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Active Ticket Quick Bar */}
      {activeTicket && currentView !== 'my-ticket' && (
        <div className="bg-[#ffc21a] border-b-2 border-stone-900 px-4 py-2.5">
          <div className="mx-auto max-w-6xl flex items-center justify-between text-xs sm:text-sm font-bold text-stone-900">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d9421c] animate-ping" />
              <span>
                You have active <strong>Token #{activeTicket.tokenNumber}</strong> at {activeTicket.venueName}
              </span>
            </div>
            <button
              onClick={() => setCurrentView('my-ticket')}
              className="underline underline-offset-2 hover:text-[#d9421c] cursor-pointer flex items-center gap-1"
            >
              <span>View Live Position</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================================
          VIEW 1: HOME LANDING PAGE (Wait? Kyu? Interface branded as SmartCrowd)
      ============================================================================ */}
      {currentView === 'home' && (
        <main className="flex-1">
          {/* 1. Hero Section with Live Search, CTAs & Session Status */}
          <section className="border-b border-black/10 bg-[#faf6ee] px-4 py-12 sm:py-16">
            <div className="mx-auto max-w-4xl text-center space-y-6">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-900/15 bg-white/70 px-3.5 py-1 text-xs font-semibold text-stone-700 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#d9421c]" />
                <span>Pan-India · Delhi, Mumbai, Varanasi, Bengaluru, Hyderabad, Kolkata · {stats.openQueues} live queues</span>
              </div>

              {/* H1 Heading with Signature Yellow Highlight */}
              <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
                Find a <span className="hl">shorter wait.</span>
              </h1>

              <p className="mx-auto max-w-2xl text-base sm:text-lg text-stone-600 leading-relaxed">
                SmartCrowd helps manage queues and eliminate blind waiting. Generate instant digital tokens, calculate estimated waiting times, and monitor live crowd density across hospitals, OPDs, temples, salons, and retail counters in India.
              </p>

              {/* Dynamic Auth Callout / Welcome Banner */}
              <div className="pt-2">
                {isAuthenticated ? (
                  <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-stone-900 bg-white p-3 shadow-[4px_4px_0_0_#1a1a17]">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800 px-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Welcome back, <strong>{activeUserDisplayName}</strong>!</span>
                      {activeTicket && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md text-[11px]">
                          Token #{activeTicket.tokenNumber} Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentView('explore')}
                        className="rounded-xl border border-stone-900 bg-[#ffc21a] px-3.5 py-1.5 text-xs font-bold text-stone-900 hover:bg-[#e6ad15] transition-colors cursor-pointer"
                      >
                        Explore Queues →
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setCurrentView('explore')}
                      className="rounded-2xl border-2 border-stone-900 bg-[#ffc21a] px-6 py-3.5 text-xs sm:text-sm font-extrabold text-stone-900 shadow-[4px_4px_0_0_#1a1a17] hover:bg-[#e6ad15] transition-all cursor-pointer"
                    >
                      Get Started / Explore Queues →
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('signin');
                        setCurrentView('auth');
                      }}
                      className="flex items-center gap-2 rounded-2xl border-2 border-stone-900 bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-stone-900 shadow-[4px_4px_0_0_#1a1a17] hover:bg-stone-50 transition-all cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-[#d9421c]" />
                      <span>Sign In / Create Account</span>
                    </button>
                    <button
                      onClick={handleDemoSignIn}
                      className="rounded-2xl border-2 border-dashed border-stone-800 bg-amber-50 hover:bg-amber-100 px-4 py-3.5 text-xs sm:text-sm font-bold text-stone-900 cursor-pointer transition-colors"
                      title="Instant 1-Click Demo Login"
                    >
                      ⚡ 1-Click Demo Login
                    </button>
                  </div>
                )}
              </div>

              {/* Big Search Input with Quick Category Tags */}
              <div className="mx-auto max-w-2xl space-y-3 pt-3">
                <div className="relative flex items-center rounded-2xl border-2 border-stone-900 bg-white p-2 shadow-[4px_4px_0_0_#1a1a17]">
                  <Search className="ml-2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setCurrentView('explore');
                    }}
                    placeholder="Search AIIMS OPD, temples, salons, clinics, restaurants in India..."
                    className="w-full bg-transparent px-3 py-2 text-sm sm:text-base font-medium outline-none placeholder:text-stone-400"
                  />
                  <button
                    onClick={() => setCurrentView('explore')}
                    className="rounded-xl bg-[#ffc21a] border border-stone-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-stone-900 hover:bg-[#e6ad15] transition-colors cursor-pointer shrink-0"
                  >
                    Explore
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-stone-600">
                  <span className="font-semibold text-stone-500">Popular categories:</span>
                  {['clinic', 'temple', 'salon', 'barber', 'dentist', 'restaurant', 'car wash'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat as CategoryFilter);
                        setCurrentView('explore');
                      }}
                      className="font-semibold text-stone-900 underline decoration-[#ffc21a] decoration-2 underline-offset-4 hover:decoration-stone-900 cursor-pointer capitalize"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Live Stats Counters */}
              <div className="pt-6">
                <dl className="mx-auto grid max-w-2xl grid-cols-3 rounded-2xl border-2 border-stone-900 bg-white p-4 shadow-[4px_4px_0_0_#1a1a17]">
                  <div className="text-center">
                    <dt className="font-display text-2xl sm:text-4xl font-extrabold tabular-nums text-stone-900">
                      {stats.openQueues}
                    </dt>
                    <dd className="text-xs sm:text-sm font-medium text-stone-600 mt-0.5">queues open</dd>
                  </div>
                  <div className="border-l border-stone-200 text-center">
                    <dt className="font-display text-2xl sm:text-4xl font-extrabold tabular-nums text-[#d9421c]">
                      {stats.peopleInLine}
                    </dt>
                    <dd className="text-xs sm:text-sm font-medium text-stone-600 mt-0.5">people in line now</dd>
                  </div>
                  <div className="border-l border-stone-200 text-center">
                    <dt className="font-display text-2xl sm:text-4xl font-extrabold tabular-nums text-stone-900">
                      {stats.customersServed}
                    </dt>
                    <dd className="text-xs sm:text-sm font-medium text-stone-600 mt-0.5">visitors served</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* 2. Interactive Queue Simulator & Waiting Time Calculator (BCA Project Core) */}
          <section className="mx-auto max-w-5xl px-4 py-12">
            <div className="rounded-3xl border-2 border-stone-900 bg-white p-6 sm:p-8 shadow-[6px_6px_0_0_#1a1a17] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <span className="rounded-md border border-stone-900 bg-[#ffc21a] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-stone-900">
                    Real-Time Simulator
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                    Interactive Queue Simulator & Waiting Time Calculator
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Enter the number of people waiting. The system automatically issues your unique token and calculates estimated waiting time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Service Speed:</span>
                  <select
                    value={simAvgServiceTime}
                    onChange={(e) => setSimAvgServiceTime(Number(e.target.value))}
                    className="rounded-lg border border-stone-900 bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-900 outline-none cursor-pointer"
                    title="Change average service time per person"
                  >
                    <option value={3}>3 min / person (Fast)</option>
                    <option value={5}>5 min / person (Standard)</option>
                    <option value={8}>8 min / person (Consultation)</option>
                    <option value={10}>10 min / person (Specialized)</option>
                  </select>
                </div>
              </div>

              {/* Simulator Input Form */}
              <form onSubmit={handleSimGenerateToken} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8 space-y-1">
                  <label className="block text-xs font-bold text-stone-700">
                    How many people are waiting currently in the queue?
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={simWaitingInput}
                      onChange={(e) => setSimWaitingInput(Number(e.target.value))}
                      placeholder="e.g. 10"
                      className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2.5 text-sm font-mono font-bold outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="w-full rounded-xl border-2 border-stone-900 bg-[#ffc21a] hover:bg-[#e6ad15] p-2.5 text-sm font-display font-extrabold text-stone-900 shadow-[3px_3px_0_0_#1a1a17] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Generate Queue Token</span>
                  </button>
                </div>
              </form>

              {/* Dynamic Queue Output Status Card */}
              {simActiveToken !== null ? (
                <div className="rounded-2xl border-2 border-stone-900 bg-[#faf6ee] p-5 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="rounded-xl border border-stone-300 bg-white p-3.5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-stone-500">Your Token</p>
                      <p className="font-display text-3xl font-extrabold text-[#d9421c] mt-0.5">
                        #{simActiveToken}
                      </p>
                    </div>

                    <div className="rounded-xl border border-stone-300 bg-white p-3.5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-stone-500">People Before You</p>
                      <p className="font-display text-3xl font-extrabold text-stone-900 tabular-nums mt-0.5">
                        {simPeopleBefore}
                      </p>
                    </div>

                    <div className="rounded-xl border border-stone-300 bg-white p-3.5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-stone-500">Estimated Wait</p>
                      <p className="font-display text-3xl font-extrabold text-stone-900 tabular-nums mt-0.5">
                        ~{simEstimatedWait} min
                      </p>
                    </div>

                    <div className="rounded-xl border border-stone-300 bg-white p-3.5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-stone-500">Queue Status</p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${simCrowdStatus.color}`}>
                          <span className={`w-2 h-2 rounded-full ${simCrowdStatus.badgeBg}`} />
                          <span>{simCrowdStatus.level}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Serving Position & Live Alert Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-stone-200">
                    <div className="flex items-center gap-4 text-xs font-semibold text-stone-700">
                      <span>Currently Serving: <strong className="text-stone-900 font-mono">Token #{simCurrentServing}</strong></span>
                      <span>·</span>
                      <span>Next Token: <strong className="text-stone-900 font-mono">Token #{simCurrentServing + 1}</strong></span>
                    </div>

                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${simCrowdStatus.color}`}>
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{simCrowdStatus.alert}</span>
                    </div>
                  </div>

                  {/* Action Simulation Controls */}
                  <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSimServeNext}
                        className="rounded-xl border-2 border-stone-900 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 text-xs font-bold transition-all shadow-[2px_2px_0_0_#1a1a17] cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#ffc21a]" />
                        <span>Serve Next Person</span>
                      </button>
                      <button
                        onClick={handleSimLeaveQueue}
                        className="rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Leave Queue
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500 font-mono">
                      Calculation: {simPeopleBefore} people × {simAvgServiceTime} min = {simEstimatedWait} min
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center space-y-2 bg-stone-50">
                  <p className="text-xs font-bold text-stone-600">No active simulation token.</p>
                  <p className="text-[11px] text-stone-500">
                    Enter the number of waiting people above and click &ldquo;Generate Queue Token&rdquo; to test.
                  </p>
                  <button
                    onClick={handleSimReset}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 underline underline-offset-2 hover:text-[#d9421c] cursor-pointer pt-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Simulation to 10 People</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* 3. Section: Shortest Waits Right Now Across India */}
          <section className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
                  Shortest waits right now across India
                </h2>
                <p className="text-sm text-stone-600 mt-1">Live queue positions updating across all cities</p>
              </div>
              <button
                onClick={() => setCurrentView('explore')}
                className="text-xs sm:text-sm font-bold text-stone-900 underline underline-offset-4 hover:text-[#d9421c] cursor-pointer"
              >
                See all places →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {venues.slice(0, 3).map((v) => {
                const inLine = getVenueWaitingCount(v);
                const wait = getVenueEstimatedWait(v);
                return (
                  <div
                    key={v.id}
                    className="group rounded-2xl border-2 border-stone-900 bg-white p-5 shadow-[4px_4px_0_0_#1a1a17] hover:shadow-[6px_6px_0_0_#1a1a17] transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md border border-stone-900 bg-[#ffc21a] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-stone-900">
                          {v.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
                          <Star className="w-3.5 h-3.5 fill-[#ffc21a] text-stone-900" />
                          <span>{v.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-[#d9421c] transition-colors">
                        {v.name}
                      </h3>

                      <p className="text-xs text-stone-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{v.city} · {v.area}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                        <div className="rounded-lg bg-stone-50 p-2.5">
                          <p className="text-[10px] uppercase font-bold text-stone-500">Wait time</p>
                          <p className="font-display text-xl font-extrabold text-[#d9421c] tabular-nums">
                            ~{wait} min
                          </p>
                        </div>
                        <div className="rounded-lg bg-stone-50 p-2.5">
                          <p className="text-[10px] uppercase font-bold text-stone-500">In line</p>
                          <p className="font-display text-xl font-extrabold text-stone-900 tabular-nums">
                            {inLine} people
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenJoinModal(v)}
                        className="flex-1 rounded-xl border border-stone-900 bg-[#ffc21a] py-2.5 text-xs font-bold text-stone-900 hover:bg-[#e6ad15] transition-colors cursor-pointer"
                      >
                        Join Queue
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVenueId(v.id);
                          setCurrentView('venue-detail');
                        }}
                        className="rounded-xl border border-stone-300 bg-stone-50 p-2.5 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                        title="View Queue Details & QR"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Section: 3 Core Pillars (Digital Tokens, Waiting Time, Queue Management) */}
          <section className="mx-auto max-w-6xl px-4 py-16 border-t border-black/10">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d9421c]">
                Core Technology
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900">
                Simple and Smart Queue Features
              </h2>
              <p className="text-sm text-stone-600">
                Designed to make physical lines obsolete and waiting comfortable.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border-2 border-stone-900 bg-white p-7 shadow-[4px_4px_0_0_#1a1a17] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffc21a] border border-stone-900 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-stone-900" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-stone-900">
                  Digital Tokens
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Automatically generate unique queue and token numbers without physical paper tickets or crowd congestion. Visitors hold verified tokens on their phones.
                </p>
              </div>

              <div className="rounded-3xl border-2 border-stone-900 bg-white p-7 shadow-[4px_4px_0_0_#1a1a17] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffc21a] border border-stone-900 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-stone-900" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-stone-900">
                  Waiting Time Calculation
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Dynamically calculates exact waiting times using FIFO positions and active counter throughput (Average: 5 min/person). Never wait blindly again.
                </p>
              </div>

              <div className="rounded-3xl border-2 border-stone-900 bg-white p-7 shadow-[4px_4px_0_0_#1a1a17] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffc21a] border border-stone-900 flex items-center justify-center">
                  <SlidersHorizontal className="w-6 h-6 text-stone-900" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-stone-900">
                  Queue Management & Admin
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Operators and counter staff control real-time lines with 1-click &ldquo;Serve Next&rdquo;, walk-in ticket entry, reset controls, and printable entrance posters.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Section: How The System Works (6-Step Visual Workflow) */}
          <section className="mx-auto max-w-6xl px-4 py-16 border-t border-black/10 bg-[#fbf8f1]">
            <h2 className="font-display max-w-xl text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
              Waiting is fine. Waiting <span className="hl">blindly</span> isn&apos;t.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Here is how the automated queue management workflow operates step by step:
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Enter Waiting Count / Scan',
                  desc: 'User enters the number of people waiting currently or scans the venue door QR code.',
                },
                {
                  step: '02',
                  title: 'Automatic Token Generation',
                  desc: 'System assigns a unique queue token number (e.g., 10 people in line → Token #11).',
                },
                {
                  step: '03',
                  title: 'Estimated Waiting Time Calculation',
                  desc: 'System multiplies people ahead by average service time (10 × 5 = 50 minutes).',
                },
                {
                  step: '04',
                  title: 'Live Real-Time Turn Tracking',
                  desc: 'User monitors their position on mobile. Line shrinks on phone while waiting in comfort.',
                },
                {
                  step: '05',
                  title: 'Staff Calls Token One by One',
                  desc: 'Staff clicks "Call Next Token" on the dashboard. Completed tokens archive to history.',
                },
                {
                  step: '06',
                  title: 'Walk in Right on Schedule',
                  desc: 'User receives prompt notice when they are next in line and arrives at the counter stress-free.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border-2 border-stone-900 bg-white p-5 shadow-[3px_3px_0_0_#1a1a17] space-y-2">
                  <span className="font-display text-4xl font-extrabold text-[#ffc21a] [-webkit-text-stroke:1px_#1a1a17]">
                    {item.step}
                  </span>
                  <h3 className="font-display text-base font-bold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Section: For Business & Venue Operators */}
          <section className="mx-auto max-w-6xl px-4 py-16 border-t border-black/10">
            <div className="rounded-3xl border-2 border-stone-900 bg-[#ffc21a] p-8 sm:p-12 shadow-[6px_6px_0_0_#1a1a17]">
              <div className="max-w-2xl space-y-4">
                <span className="rounded-md border border-stone-900 bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-stone-900">
                  For Business & Venue Operators
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight text-stone-900">
                  Got a waiting room? Put the line on people&apos;s phones.
                </h2>
                <p className="text-sm sm:text-base text-stone-800 leading-relaxed">
                  A one-tap live staff dashboard, a printable QR poster for your entrance, and instant exposure across India.
                  Set up in 5 minutes with zero special hardware.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setCurrentView('merchant-onboarding')}
                    className="rounded-xl border-2 border-stone-900 bg-stone-900 px-6 py-3 text-sm font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    List Your Venue Free
                  </button>
                  <button
                    onClick={() => {
                      if (activeMerchant) {
                        setSelectedVenueId(activeMerchant.venueId);
                        setCurrentView('merchant-dashboard');
                      } else {
                        setCurrentView('merchant-onboarding');
                      }
                    }}
                    className="rounded-xl border-2 border-stone-900 bg-white px-6 py-3 text-sm font-bold text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Open Merchant Dashboard
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ============================================================================
          VIEW 2: EXPLORE QUEUES & SEARCH MARKETPLACE
      ============================================================================ */}
      {currentView === 'explore' && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-stone-900">
                Explore Live Queues
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Updated the second a queue moves across India. Join remotely or scan at the entrance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="rounded-lg border border-stone-900 bg-white px-3 py-1.5 text-xs font-bold text-stone-900 outline-none cursor-pointer"
              >
                <option value="wait">Shortest Wait</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest Distance</option>
              </select>
            </div>
          </div>

          {/* Search bar inside Explore */}
          <div className="relative rounded-xl border-2 border-stone-900 bg-white p-2 shadow-[3px_3px_0_0_#1a1a17]">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venue name, city (Delhi, Mumbai, Varanasi...), or service category..."
              className="w-full pl-9 pr-3 py-1 text-sm font-medium outline-none"
            />
          </div>

          {/* Pan-India City Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-stone-500 whitespace-nowrap">City:</span>
            {citiesList.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`rounded-lg px-3 py-1 font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCity === city
                    ? 'border-2 border-stone-900 bg-[#ffc21a] text-stone-900 shadow-[2px_2px_0_0_#1a1a17]'
                    : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-900'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'border-2 border-stone-900 bg-stone-900 text-white'
                    : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-900'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Venue Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((v) => {
              const inLine = getVenueWaitingCount(v);
              const wait = getVenueEstimatedWait(v);
              return (
                <div
                  key={v.id}
                  className="rounded-2xl border-2 border-stone-900 bg-white p-5 shadow-[4px_4px_0_0_#1a1a17] hover:shadow-[6px_6px_0_0_#1a1a17] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="rounded-md border border-stone-900 bg-[#ffc21a] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-stone-900">
                        {v.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
                        <Star className="w-3.5 h-3.5 fill-[#ffc21a] text-stone-900" />
                        <span>{v.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-bold text-stone-900">{v.name}</h3>
                    <p className="text-xs text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{v.city} · {v.area}</span>
                    </p>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{v.description}</p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
                      <div className="rounded-lg bg-stone-50 p-2">
                        <p className="text-[10px] font-bold text-stone-500 uppercase">Wait</p>
                        <p className="font-display text-base font-extrabold text-[#d9421c]">~{wait}m</p>
                      </div>
                      <div className="rounded-lg bg-stone-50 p-2">
                        <p className="text-[10px] font-bold text-stone-500 uppercase">In line</p>
                        <p className="font-display text-base font-extrabold text-stone-900">{inLine}</p>
                      </div>
                      <div className="rounded-lg bg-stone-50 p-2">
                        <p className="text-[10px] font-bold text-stone-500 uppercase">Serving</p>
                        <p className="font-display text-base font-extrabold text-emerald-700">#{v.currentServing}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenJoinModal(v)}
                      className="flex-1 rounded-xl border border-stone-900 bg-[#ffc21a] py-2.5 text-xs font-bold text-stone-900 hover:bg-[#e6ad15] transition-colors cursor-pointer"
                    >
                      Take Ticket
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVenueId(v.id);
                        setCurrentView('venue-detail');
                      }}
                      className="rounded-xl border border-stone-900 bg-white px-3 py-2.5 text-xs font-bold text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      Details & QR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}



      {/* ============================================================================
          VIEW 3: VENUE DETAIL & QR ENTRY KIOSK
      ============================================================================ */}
      {currentView === 'venue-detail' && (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
          <button
            onClick={() => setCurrentView('explore')}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
          >
            ← Back to Explore
          </button>

          <div className="rounded-3xl border-2 border-stone-900 bg-white p-6 sm:p-8 shadow-[6px_6px_0_0_#1a1a17] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <span className="rounded-md border border-stone-900 bg-[#ffc21a] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-stone-900">
                  {currentVenue.category}
                </span>
                <h1 className="font-display text-3xl font-extrabold text-stone-900 mt-2">
                  {currentVenue.name}
                </h1>
                <p className="text-sm text-stone-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span>{currentVenue.city}, {currentVenue.state} · {currentVenue.area}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQrModalVenue(currentVenue)}
                  className="rounded-xl border border-stone-900 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-900 hover:bg-stone-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Door QR Code</span>
                </button>
                <button
                  onClick={() => handleOpenJoinModal(currentVenue)}
                  className="rounded-xl border-2 border-stone-900 bg-[#ffc21a] px-5 py-2 text-xs sm:text-sm font-bold text-stone-900 hover:bg-[#e6ad15] cursor-pointer"
                >
                  Join This Queue
                </button>
              </div>
            </div>

            {currentVenue.announcement && (
              <div className="rounded-xl border border-stone-900/10 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{currentVenue.announcement}</span>
              </div>
            )}

            {/* Live Queue Pulse Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border-2 border-stone-900 bg-emerald-50 p-4 text-center">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">Now Serving</p>
                <p className="font-display text-4xl font-extrabold text-emerald-700 mt-1">
                  #{currentVenue.currentServing}
                </p>
              </div>

              <div className="rounded-2xl border-2 border-stone-900 bg-stone-50 p-4 text-center">
                <p className="text-[11px] font-bold text-stone-500 uppercase">Next In Line</p>
                <p className="font-display text-4xl font-extrabold text-stone-900 mt-1">
                  #{currentVenue.currentServing + 1}
                </p>
              </div>

              <div className="rounded-2xl border-2 border-stone-900 bg-stone-50 p-4 text-center">
                <p className="text-[11px] font-bold text-stone-500 uppercase">People Waiting</p>
                <p className="font-display text-4xl font-extrabold text-stone-900 mt-1">
                  {getVenueWaitingCount(currentVenue)}
                </p>
              </div>

              <div className="rounded-2xl border-2 border-stone-900 bg-amber-50 p-4 text-center">
                <p className="text-[11px] font-bold text-amber-800 uppercase">Estimated Wait</p>
                <p className="font-display text-4xl font-extrabold text-[#d9421c] mt-1">
                  ~{getVenueEstimatedWait(currentVenue)}m
                </p>
              </div>
            </div>

            {/* Service Parameters */}
            <div className="border-t border-stone-200 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-bold text-stone-500 uppercase">Service Counters</p>
                <p className="font-bold text-stone-900 text-sm mt-0.5">
                  {currentVenue.activeCounters} active counter(s)
                </p>
              </div>
              <div>
                <p className="font-bold text-stone-500 uppercase">Average Service Pace</p>
                <p className="font-bold text-stone-900 text-sm mt-0.5">
                  ~{currentVenue.avgServiceTimeMinutes} mins per person
                </p>
              </div>
              <div>
                <p className="font-bold text-stone-500 uppercase">Last Token Issued Today</p>
                <p className="font-bold text-stone-900 text-sm mt-0.5">
                  Token #{currentVenue.lastIssuedToken}
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================================
          VIEW 4: MY TICKET (Live Digital Queue Ticket with Real-Time Position)
      ============================================================================ */}
      {currentView === 'my-ticket' && (
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-extrabold text-stone-900">
              Live Queue Ticket
            </h1>
            <button
              onClick={() => showToast('Queue position refreshed in real-time.')}
              className="rounded-lg border border-stone-900 bg-white p-2 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {activeTicket ? (
            (() => {
              const venue = getVenue(activeTicket.venueId);
              const peopleAhead = Math.max(0, activeTicket.tokenNumber - venue.currentServing);
              const estWait = Math.max(
                1,
                Math.round((peopleAhead * venue.avgServiceTimeMinutes) / (venue.activeCounters || 1))
              );
              const isServing = activeTicket.tokenNumber === venue.currentServing;
              const isNext = activeTicket.tokenNumber === venue.currentServing + 1;

              return (
                <div className="rounded-3xl border-2 border-stone-900 bg-white shadow-[6px_6px_0_0_#1a1a17] overflow-hidden">
                  {/* Ticket Header */}
                  <div className="border-b-2 border-dashed border-stone-900/30 bg-[#ffc21a] px-6 py-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-800">
                        Official Digital Token · SmartCrowd
                      </span>
                      <h2 className="font-display text-lg font-bold text-stone-900">{activeTicket.venueName}</h2>
                      <p className="text-xs text-stone-700">{venue.city}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-stone-700">TICKET ID</span>
                      <p className="font-mono text-xs font-bold text-stone-900">{activeTicket.ticketId}</p>
                    </div>
                  </div>

                  {/* Main Token Display */}
                  <div className="p-6 text-center space-y-4">
                    {isServing ? (
                      <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 animate-pulse">
                          🎉 IT IS YOUR TURN NOW!
                        </span>
                        <p className="font-display text-6xl font-extrabold text-emerald-700 mt-2">
                          #{activeTicket.tokenNumber}
                        </p>
                        <p className="text-xs font-semibold text-emerald-800 mt-1">
                          Please proceed to Counter 1 immediately.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          YOUR QUEUE TOKEN NUMBER
                        </span>
                        <p className="font-display text-6xl font-extrabold text-[#d9421c] mt-1">
                          #{activeTicket.tokenNumber}
                        </p>
                        {isNext && (
                          <p className="text-xs font-bold text-amber-800 mt-1 bg-amber-100 py-1 px-3 rounded-full inline-block">
                            ⚡ You are NEXT! Stand near the counter.
                          </p>
                        )}
                      </div>
                    )}

                    {/* People ahead & estimated wait */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                        <p className="text-[11px] font-bold text-stone-500 uppercase">People Ahead</p>
                        <p className="font-display text-2xl font-extrabold text-stone-900 tabular-nums">
                          {peopleAhead}
                        </p>
                      </div>

                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                        <p className="text-[11px] font-bold text-stone-500 uppercase">Estimated Wait</p>
                        <p className="font-display text-2xl font-extrabold text-[#d9421c] tabular-nums">
                          ~{estWait} min
                        </p>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="border-t border-b border-stone-100 py-3 text-xs space-y-2 text-stone-600 text-left">
                      <div className="flex justify-between">
                        <span>Currently Serving:</span>
                        <span className="font-bold text-stone-900">#{venue.currentServing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Name:</span>
                        <span className="font-bold text-stone-900">{activeTicket.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Joined Queue At:</span>
                        <span className="font-mono text-stone-900">{activeTicket.joinedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Token Code:</span>
                        <span className="font-mono font-bold text-stone-900">{activeTicket.qrCodeToken}</span>
                      </div>
                    </div>

                    {/* Simulated "Serve Next" button for easy viva demo */}
                    <div className="pt-2 space-y-2.5">
                      <button
                        onClick={() => handleMerchantServeNext(venue.id)}
                        className="w-full rounded-xl border border-stone-900 bg-stone-900 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#ffc21a]" />
                        <span>Simulate Queue Move (Serve Next)</span>
                      </button>

                      <button
                        onClick={() => handleCancelTicket(activeTicket.ticketId)}
                        className="w-full rounded-xl border border-red-300 bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Leave Queue / Cancel Ticket
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="rounded-3xl border-2 border-stone-900 bg-white p-8 text-center space-y-4 shadow-[4px_4px_0_0_#1a1a17]">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6 text-[#d9421c]" />
              </div>
              <h2 className="font-display text-xl font-bold text-stone-900">No Active Ticket</h2>
              <p className="text-sm text-stone-600 max-w-sm mx-auto">
                You haven&apos;t joined any queue yet. Explore nearby venues or temples across India to take a live token from your sofa.
              </p>
              <button
                onClick={() => setCurrentView('explore')}
                className="rounded-xl border-2 border-stone-900 bg-[#ffc21a] px-6 py-2.5 text-xs font-bold text-stone-900 hover:bg-[#e6ad15] cursor-pointer"
              >
                Browse & Take a Ticket
              </button>
            </div>
          )}
        </main>
      )}

      {/* ============================================================================
          VIEW 5: MERCHANT DASHBOARD (Business Control Center)
      ============================================================================ */}
      {currentView === 'merchant-dashboard' && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-stone-900 bg-[#ffc21a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-900">
                  Business Operator Mode
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {currentVenue.city} · {currentVenue.area}
                </span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-stone-900 mt-1">
                {currentVenue.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setQrModalVenue(currentVenue)}
                className="rounded-xl border border-stone-900 bg-white px-3 py-2 text-xs font-bold text-stone-900 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#d9421c]" />
                <span>Print Door QR Poster</span>
              </button>

              <button
                onClick={() => handleToggleQueueOpen(currentVenue.id)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  currentVenue.isOpen
                    ? 'border border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border border-red-600 bg-red-50 text-red-800'
                }`}
              >
                {currentVenue.isOpen ? '● Queue Open' : '○ Queue Paused'}
              </button>
            </div>
          </div>

          {/* Quick Switcher if user has multiple venues */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
            <span className="font-bold text-stone-500">Manage venue:</span>
            {venues.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVenueId(v.id)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedVenueId === v.id
                    ? 'border-2 border-stone-900 bg-[#ffc21a] text-stone-900'
                    : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                {v.name} ({v.city})
              </button>
            ))}
          </div>

          {/* Big Action Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-3xl border-2 border-stone-900 bg-white p-6 sm:p-8 shadow-[6px_6px_0_0_#1a1a17] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-stone-500">Live Counter 1</span>
                  <p className="font-display text-2xl font-extrabold text-stone-900">
                    Serving Token #{currentVenue.currentServing}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-stone-500">Next Up</span>
                  <p className="font-display text-2xl font-extrabold text-stone-500">
                    #{currentVenue.currentServing + 1}
                  </p>
                </div>
              </div>

              {/* Big "Call Next" Button */}
              <button
                onClick={() => handleMerchantServeNext(currentVenue.id)}
                className="w-full rounded-2xl border-2 border-stone-900 bg-[#ffc21a] py-5 px-6 text-xl sm:text-2xl font-display font-extrabold text-stone-900 hover:bg-[#e6ad15] shadow-[4px_4px_0_0_#1a1a17] active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <CheckCircle2 className="w-7 h-7 text-stone-900" />
                <span>Call Next Token (#{currentVenue.currentServing + 1})</span>
              </button>

              {/* Secondary Quick Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => handleMerchantAddWalkIn(currentVenue.id)}
                  className="rounded-xl border border-stone-900 bg-stone-50 p-3 text-xs font-bold text-stone-900 hover:bg-stone-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>+ Walk-In Ticket</span>
                </button>

                <button
                  onClick={() => {
                    const newAnnouncement = prompt(
                      'Enter announcement for visitors on their phones:',
                      currentVenue.announcement || ''
                    );
                    if (newAnnouncement !== null) {
                      setVenues((prev) =>
                        prev.map((v) =>
                          v.id === currentVenue.id ? { ...v, announcement: newAnnouncement } : v
                        )
                      );
                      showToast('Live announcement updated on visitor tickets!');
                    }
                  }}
                  className="rounded-xl border border-stone-900 bg-stone-50 p-3 text-xs font-bold text-stone-900 hover:bg-stone-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#d9421c]" />
                  <span>Broadcast Notice</span>
                </button>

                <button
                  onClick={() => handleMerchantResetQueue(currentVenue.id)}
                  className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-700 hover:bg-red-100 flex items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1"
                >
                  <span>Reset Today&apos;s Queue</span>
                </button>
              </div>
            </div>

            {/* Side Queue Summary */}
            <div className="rounded-3xl border-2 border-stone-900 bg-[#ffc21a] p-6 shadow-[6px_6px_0_0_#1a1a17] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-display text-xl font-extrabold text-stone-900">
                  Live Queue Metrics
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="rounded-xl border border-stone-900 bg-white p-3 flex justify-between items-center">
                    <span className="font-bold text-stone-600">Waiting in line:</span>
                    <span className="font-display text-2xl font-extrabold text-[#d9421c]">
                      {getVenueWaitingCount(currentVenue)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-900 bg-white p-3 flex justify-between items-center">
                    <span className="font-bold text-stone-600">Estimated wait:</span>
                    <span className="font-display text-2xl font-extrabold text-stone-900">
                      ~{getVenueEstimatedWait(currentVenue)}m
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-900 bg-white p-3 flex justify-between items-center">
                    <span className="font-bold text-stone-600">Last token issued:</span>
                    <span className="font-display text-2xl font-extrabold text-stone-900">
                      #{currentVenue.lastIssuedToken}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-stone-900/30 bg-black/5 p-3 text-xs text-stone-800">
                💡 <strong>BCA Project Note:</strong> When staff clicks &ldquo;Call Next Token&rdquo;, the customer&apos;s live mobile ticket updates immediately, decreasing their waiting time.
              </div>
            </div>
          </div>

          {/* History of Served Customers Table */}
          <div className="rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-[4px_4px_0_0_#1a1a17] space-y-4">
            <h3 className="font-display text-lg font-bold text-stone-900">
              Recently Completed Tokens Today
            </h3>

            {currentVenue.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase">
                      <th className="py-2.5 px-3">Token</th>
                      <th className="py-2.5 px-3">Visitor</th>
                      <th className="py-2.5 px-3">Completed At</th>
                      <th className="py-2.5 px-3 text-right">Waiting Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {currentVenue.history.map((h, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                          #{h.tokenNumber}
                        </td>
                        <td className="py-2.5 px-3 text-stone-800">{h.customerName}</td>
                        <td className="py-2.5 px-3 font-mono text-stone-600">{h.completedAt}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right text-emerald-700">
                          {h.waitingTimeMinutes} mins
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-4 text-center">
                No tokens served yet today. Click &ldquo;Call Next Token&rdquo; to begin serving visitors.
              </p>
            )}
          </div>
        </main>
      )}

      {/* ============================================================================
          VIEW 6: LIST YOUR BUSINESS ONBOARDING
      ============================================================================ */}
      {currentView === 'merchant-onboarding' && (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
          >
            ← Back to Home
          </button>

          <div className="rounded-3xl border-2 border-stone-900 bg-white p-6 sm:p-8 shadow-[6px_6px_0_0_#1a1a17] space-y-6">
            <div>
              <span className="rounded-md border border-stone-900 bg-[#ffc21a] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-stone-900">
                10-Minute Setup · No Hardware Required
              </span>
              <h1 className="font-display text-3xl font-extrabold text-stone-900 mt-2">
                List your venue on SmartCrowd
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Put your queue on customers&apos; phones across India, eliminate physical overcrowding, and improve visitor flow.
              </p>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-4 text-xs font-semibold text-stone-800">
              <div className="space-y-1">
                <label className="block">Venue / Business Name *</label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="e.g. Apollo Super-Specialty OPD, Sri Ram Temple, Urban Salon"
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block">Category *</label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="clinic">Clinic / Hospital OPD</option>
                    <option value="temple">Temple Darshan</option>
                    <option value="salon">Salon & Spa</option>
                    <option value="barber">Barbershop</option>
                    <option value="dentist">Dentist</option>
                    <option value="restaurant">Restaurant / Cafe</option>
                    <option value="car wash">Car Wash</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block">City (India) *</label>
                  <input
                    type="text"
                    required
                    value={newBizCity}
                    onChange={(e) => setNewBizCity(e.target.value)}
                    placeholder="e.g. New Delhi, Mumbai, Varanasi, Bengaluru"
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block">Area / Neighborhood *</label>
                <input
                  type="text"
                  required
                  value={newBizArea}
                  onChange={(e) => setNewBizArea(e.target.value)}
                  placeholder="e.g. Connaught Place, Dadar, Godowlia Chowk"
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block">Average Service Time (minutes per person)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newBizAvgTime}
                    onChange={(e) => setNewBizAvgTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm font-mono outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">Number of Active Serving Counters</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newBizCounters}
                    onChange={(e) => setNewBizCounters(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm font-mono outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full rounded-2xl border-2 border-stone-900 bg-[#ffc21a] py-3.5 text-base font-display font-extrabold text-stone-900 hover:bg-[#e6ad15] shadow-[4px_4px_0_0_#1a1a17] transition-all cursor-pointer"
                >
                  Create Queue & Open Dashboard
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ============================================================================
          VIEW 8: DEDICATED AUTHENTICATION & USER PROFILE VIEW
      ============================================================================ */}
      {currentView === 'auth' && (
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-10 space-y-6">
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            ← Back to Home
          </button>

          {isAuthenticated ? (
            /* Logged In Profile Card */
            <div className="rounded-3xl border-2 border-stone-900 bg-white p-7 sm:p-8 shadow-[6px_6px_0_0_#1a1a17] space-y-6">
              <div className="flex items-center gap-4 border-b border-stone-200 pb-5">
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={activeUserDisplayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-900 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl border-2 border-stone-900 bg-[#ffc21a] text-stone-900 font-display font-extrabold text-2xl flex items-center justify-center shadow-sm">
                    {(activeUserDisplayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Active User Profile
                  </span>
                  <h1 className="font-display text-2xl font-extrabold text-stone-900">
                    {activeUserDisplayName}
                  </h1>
                  <p className="text-xs font-mono text-stone-500">{activeUserEmail || 'Synced via local demo'}</p>
                </div>
              </div>

              {/* Status details */}
              <div className="space-y-3">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600">Database Status:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isFirestoreSynced ? 'Firebase Firestore Synchronized' : 'Active Local Session'}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600">Active Queue Tokens:</span>
                    <span className="font-mono font-bold text-stone-900">
                      {tickets.filter((t) => t.status === 'WAITING' || t.status === 'SERVING_NOW').length} active
                    </span>
                  </div>
                </div>

                {activeTicket && (
                  <div className="rounded-2xl border-2 border-stone-900 bg-[#faf6ee] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-500">Your Current Queue</p>
                      <p className="font-display text-base font-bold text-stone-900">{activeTicket.venueName}</p>
                      <p className="text-xs text-[#d9421c] font-bold">Token #{activeTicket.tokenNumber} · {activeTicket.status}</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('my-ticket')}
                      className="rounded-xl border border-stone-900 bg-[#ffc21a] px-3.5 py-2 text-xs font-bold text-stone-900 hover:bg-[#e6ad15] cursor-pointer"
                    >
                      View Ticket
                    </button>
                  </div>
                )}
              </div>

              {/* Actions & Sign Out Button */}
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCurrentView('explore')}
                    className="rounded-xl border border-stone-900 bg-white hover:bg-stone-50 p-3 text-xs font-bold text-stone-900 cursor-pointer text-center"
                  >
                    Explore Queues
                  </button>
                  <button
                    onClick={() => {
                      if (activeMerchant) {
                        setSelectedVenueId(activeMerchant.venueId);
                        setCurrentView('merchant-dashboard');
                      } else {
                        setCurrentView('merchant-onboarding');
                      }
                    }}
                    className="rounded-xl border border-stone-900 bg-white hover:bg-stone-50 p-3 text-xs font-bold text-stone-900 cursor-pointer text-center"
                  >
                    Staff Dashboard
                  </button>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full rounded-2xl border-2 border-red-300 bg-red-50 hover:bg-red-100 p-3.5 text-xs sm:text-sm font-bold text-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of SmartCrowd</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up Form Card */
            <div className="rounded-3xl border-2 border-stone-900 bg-white p-7 sm:p-8 shadow-[6px_6px_0_0_#1a1a17] space-y-6">
              {/* Tab Selector */}
              <div className="flex rounded-2xl border-2 border-stone-900 bg-stone-100 p-1">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                    setAuthSuccessMessage(null);
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-stone-900 shadow-[2px_2px_0_0_#1a1a17]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                    setAuthSuccessMessage(null);
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-stone-900 shadow-[2px_2px_0_0_#1a1a17]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div>
                <h1 className="font-display text-2xl font-extrabold text-stone-900">
                  {authMode === 'signin' ? 'Sign In to SmartCrowd' : 'Create Your Account'}
                </h1>
                <p className="text-xs text-stone-600 mt-1">
                  {authMode === 'signin'
                    ? 'Enter your credentials to access your live queue dashboard and digital tokens.'
                    : 'Sign up to generate queue tokens, track wait times, and register business queues.'}
                </p>
              </div>

              {authError && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccessMessage && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{authSuccessMessage}</span>
                </div>
              )}

              {authMode === 'signin' ? (
                /* Sign In Form */
                <form onSubmit={handleEmailSignIn} className="space-y-4 text-xs font-semibold text-stone-800">
                  <div className="space-y-1">
                    <label className="block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="demo.visitor@smartcrowd.in"
                      className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl border-2 border-stone-900 bg-[#ffc21a] hover:bg-[#e6ad15] p-3 text-sm font-display font-extrabold text-stone-900 shadow-[3px_3px_0_0_#1a1a17] transition-all cursor-pointer"
                  >
                    Sign In
                  </button>

                  <div className="flex items-center gap-2 my-2 text-[11px] text-stone-400">
                    <div className="flex-1 border-t border-stone-200" />
                    <span>OR</span>
                    <div className="flex-1 border-t border-stone-200" />
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="w-full rounded-2xl border-2 border-stone-900 bg-white hover:bg-stone-50 p-3 text-xs sm:text-sm font-bold text-stone-900 shadow-[2px_2px_0_0_#1a1a17] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Sign in with Google</span>
                  </button>

                  {/* 1-Click Demo Login */}
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    className="w-full rounded-2xl border-2 border-stone-900 bg-amber-50 hover:bg-amber-100 p-3 text-xs sm:text-sm font-bold text-stone-900 shadow-[2px_2px_0_0_#1a1a17] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>One-Click Demo Login (Instant Access)</span>
                  </button>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleCreateAccount} className="space-y-4 text-xs font-semibold text-stone-800">
                  <div className="space-y-1">
                    <label className="block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="e.g. Prabhkirat Singh"
                      className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block">Password *</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-stone-300 p-3 text-sm font-medium outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl border-2 border-stone-900 bg-[#ffc21a] hover:bg-[#e6ad15] p-3 text-sm font-display font-extrabold text-stone-900 shadow-[3px_3px_0_0_#1a1a17] transition-all cursor-pointer"
                  >
                    Create Account
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-xs font-bold text-stone-600 underline hover:text-stone-900 cursor-pointer"
                    >
                      Already have an account? Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </main>
      )}

      {/* ============================================================================
          MODAL: TAKE TICKET / REMOTE QUEUE DIALOG
      ============================================================================ */}
      {joinModalOpen && joinVenueTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-[8px_8px_0_0_#1a1a17] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Join Remote Queue
                </span>
                <h3 className="font-display text-2xl font-extrabold text-stone-900">
                  {joinVenueTarget.name}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">{joinVenueTarget.city} · {joinVenueTarget.area}</p>
              </div>
              <button
                onClick={() => setJoinModalOpen(false)}
                className="text-stone-400 hover:text-stone-900 font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[10px] font-bold uppercase text-stone-500">Next Available Token</p>
                <p className="font-display text-2xl font-extrabold text-stone-900">
                  #{joinVenueTarget.lastIssuedToken + 1}
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[10px] font-bold uppercase text-stone-500">Est. Wait</p>
                <p className="font-display text-2xl font-extrabold text-[#d9421c]">
                  ~{getVenueEstimatedWait(joinVenueTarget)} min
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmJoinQueue} className="space-y-3 text-xs font-semibold text-stone-800">
              <div className="space-y-1">
                <label className="block">Your Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block">Mobile Number (For turn notification)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-mono outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block">Party Size (Number of visitors)</label>
                <select
                  value={joinPartySize}
                  onChange={(e) => setJoinPartySize(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900 bg-white"
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 People</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4+ Group</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="w-1/3 rounded-xl border border-stone-300 bg-stone-100 py-3 text-xs font-bold text-stone-700 hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 rounded-xl border-2 border-stone-900 bg-[#ffc21a] py-3 text-sm font-bold text-stone-900 hover:bg-[#e6ad15] shadow-[2px_2px_0_0_#1a1a17] cursor-pointer"
                >
                  Confirm & Take Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL: DOOR QR CODE POSTER (Printable for venues)
      ============================================================================ */}
      {qrModalVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border-2 border-stone-900 bg-white p-6 shadow-[8px_8px_0_0_#1a1a17] text-center space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setQrModalVenue(null)}
                className="text-stone-400 hover:text-stone-900 font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border-4 border-dashed border-stone-900/40 rounded-2xl p-6 bg-[#faf6ee] space-y-3">
              <span className="font-display text-2xl font-extrabold text-stone-900">
                SmartCrowd<span className="text-[#d9421c]">.</span>
              </span>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                {qrModalVenue.name}
              </p>
              <p className="text-[11px] text-stone-500">{qrModalVenue.city}, {qrModalVenue.state}</p>

              <div className="mx-auto w-44 h-44 rounded-xl border-2 border-stone-900 bg-white p-3 flex flex-col items-center justify-center shadow-inner relative group">
                <QrCode className="w-32 h-32 text-stone-900" />
                <span className="text-[9px] font-mono font-bold text-stone-500 mt-1">
                  SCAN TO JOIN QUEUE
                </span>
              </div>

              <p className="text-[11px] text-stone-600 leading-snug">
                Scan with any smartphone camera to take a digital ticket and wait anywhere.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 rounded-xl border border-stone-900 bg-[#ffc21a] py-2.5 text-xs font-bold text-stone-900 hover:bg-[#e6ad15] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Poster</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://smartcrowd.app/venue/${qrModalVenue.id}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL: FIREBASE AUTHENTICATION (Google Sign-In & Demo Login)
      ============================================================================ */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border-2 border-stone-900 bg-white p-6 sm:p-7 shadow-[8px_8px_0_0_#1a1a17] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Firebase &amp; SmartCrowd Auth
                </span>
                <h3 className="font-display text-2xl font-extrabold text-stone-900">
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </h3>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-stone-400 hover:text-stone-900 font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Mode Toggle */}
            <div className="flex rounded-xl border border-stone-300 bg-stone-100 p-1 text-xs font-bold">
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                  setAuthSuccessMessage(null);
                }}
                className={`flex-1 rounded-lg py-1.5 transition-colors cursor-pointer ${
                  authMode === 'signin' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                  setAuthSuccessMessage(null);
                }}
                className={`flex-1 rounded-lg py-1.5 transition-colors cursor-pointer ${
                  authMode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                New Account
              </button>
            </div>

            {authError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                {authError}
              </div>
            )}

            {authSuccessMessage && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">
                {authSuccessMessage}
              </div>
            )}

            {authMode === 'signin' ? (
              <form onSubmit={handleEmailSignIn} className="space-y-3 pt-1 text-xs font-semibold text-stone-800">
                <div className="space-y-1">
                  <label className="block text-stone-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="demo.visitor@smartcrowd.in"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-700">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl border-2 border-stone-900 bg-[#ffc21a] hover:bg-[#e6ad15] p-2.5 text-xs sm:text-sm font-display font-extrabold text-stone-900 shadow-[2px_2px_0_0_#1a1a17] transition-all cursor-pointer"
                >
                  Sign In
                </button>

                <div className="flex items-center gap-2 my-1 text-[10px] text-stone-400">
                  <div className="flex-1 border-t border-stone-200" />
                  <span>OR</span>
                  <div className="flex-1 border-t border-stone-200" />
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isAuthLoading}
                  className="w-full rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 p-2.5 text-xs font-bold text-stone-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>

                {/* Demo Sign In Button */}
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full rounded-2xl border border-stone-800/30 bg-amber-50 hover:bg-amber-100 p-2.5 text-xs font-bold text-stone-900 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>One-Click Demo Login</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-3 pt-1 text-xs font-semibold text-stone-800">
                <div className="space-y-1">
                  <label className="block text-stone-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Prabhkirat Singh"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-700">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-700">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-sm font-medium outline-none focus:border-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl border-2 border-stone-900 bg-[#ffc21a] hover:bg-[#e6ad15] p-2.5 text-xs sm:text-sm font-display font-extrabold text-stone-900 shadow-[2px_2px_0_0_#1a1a17] transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[10px] text-stone-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secured by Firebase Firestore & Google Auth</span>
            </div>
          </div>
        </div>
      )}

      {/* Signature Footer */}
      <footer className="mt-16 border-t border-black/10 bg-[#f3eee3] py-10 px-4 text-sm text-stone-600">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-4">
          <div className="sm:col-span-2 space-y-3">
            <span className="flex items-center gap-2">
              <span className="font-display text-2xl font-extrabold text-stone-900">
                SmartCrowd<span className="text-[#d9421c]">.</span>
              </span>
            </span>
            <p className="max-w-sm text-xs sm:text-sm text-stone-600 leading-relaxed">
              Never wait blindly again. Live waiting times and remote queues for businesses, OPD clinics, salons, restaurants, and temples across India.
            </p>
            <p className="text-xs text-stone-500">
              Smart crowd monitoring and real-time digital queue management across India.
            </p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <p className="font-bold text-stone-900">For Visitors</p>
            <button
              onClick={() => setCurrentView('home')}
              className="block text-stone-600 hover:text-stone-900 cursor-pointer font-semibold"
            >
              Homepage
            </button>
            <button
              onClick={() => setCurrentView('explore')}
              className="block text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Explore Queues
            </button>
            <button
              onClick={() => setCurrentView('my-ticket')}
              className="block text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              My Active Ticket
            </button>
            <button
              onClick={() => setCurrentView('auth')}
              className="block text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              {isAuthenticated ? `Account (${activeUserDisplayName.split(' ')[0]}) · Log Out` : 'Sign In / Sign Up'}
            </button>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <p className="font-bold text-stone-900">For Businesses & Venues</p>
            <button
              onClick={() => setCurrentView('merchant-onboarding')}
              className="block text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              List your venue
            </button>
            <button
              onClick={() => {
                if (activeMerchant) {
                  setSelectedVenueId(activeMerchant.venueId);
                  setCurrentView('merchant-dashboard');
                } else {
                  setCurrentView('merchant-onboarding');
                }
              }}
              className="block text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Staff Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_VENUES);
                localStorage.removeItem(STORAGE_TICKETS);
                setVenues(INITIAL_VENUES);
                showToast('Reset marketplace to demo state.');
              }}
              className="block text-stone-500 hover:text-stone-800 cursor-pointer text-xs"
            >
              Reset Demo Data
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-8 pt-4 border-t border-black/10 text-center text-xs text-stone-500">
          © 2026 SmartCrowd · Live Waiting Times & Remote Queue System Across India · Firebase Firestore Cloud Sync
        </div>
      </footer>

      {/* Floating Gemini AI Chatbot (CrowdBot) */}
      <GeminiChatbot venueContext={currentVenue} />
    </div>
  );
}
