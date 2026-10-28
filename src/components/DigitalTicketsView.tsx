/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Ticket,
  QrCode,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Share2,
} from 'lucide-react';
import { INDIAN_HUBS, IndianHub } from '../data/mockData';

export interface PublicToken {
  id: string;
  tokenNumber: number;
  hubId: string;
  hubName: string;
  city: string;
  customerName: string;
  phone: string;
  status: 'Serving' | 'Waiting' | 'Completed';
  issuedAt: string;
  counterAssigned: number;
}

export const DigitalTicketsView: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeHub, setActiveHub] = useState<IndianHub>(INDIAN_HUBS[0]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // User's active digital token state
  const [userToken, setUserToken] = useState<PublicToken | null>({
    id: 'TKT-IN-908',
    tokenNumber: 28,
    hubId: 'hub-delhi',
    hubName: 'AIIMS Central OPD & Emergency',
    city: 'New Delhi',
    customerName: 'Prabhkirat Singh',
    phone: '+91 98765 43210',
    status: 'Waiting',
    issuedAt: '11:15 AM',
    counterAssigned: 2,
  });

  // Current Serving number for active hub
  const [currentServing, setCurrentServing] = useState<number>(24);
  const [lastIssued, setLastIssued] = useState<number>(31);
  const avgPaceMinutes = 5;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Cities list from Indian hubs
  const cities = ['All', ...Array.from(new Set(INDIAN_HUBS.map((h) => h.city)))];
  const categories = ['All', 'Hospital', 'Temple / Religious', 'Metro & Transit', 'Airport Terminal'];

  const filteredHubs = INDIAN_HUBS.filter((h) => {
    const matchesCity = selectedCity === 'All' || h.city === selectedCity;
    const matchesCat = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCat && matchesSearch;
  });

  // Calculation for user token
  const peopleAhead = userToken ? Math.max(0, userToken.tokenNumber - currentServing) : 0;
  const estimatedWait = peopleAhead * avgPaceMinutes;

  const handleTakeTicket = (hub: IndianHub) => {
    const nextNum = lastIssued + 1;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTkt: PublicToken = {
      id: `TKT-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: nextNum,
      hubId: hub.id,
      hubName: hub.name,
      city: hub.city,
      customerName: 'Demonstration Visitor',
      phone: '+91 98000 11223',
      status: 'Waiting',
      issuedAt: nowTime,
      counterAssigned: 1,
    };
    setUserToken(newTkt);
    setLastIssued(nextNum);
    setActiveHub(hub);
    showToast(`Token #${nextNum} generated for ${hub.name} (${hub.city}). Estimated wait: ${Math.max(1, (nextNum - currentServing) * avgPaceMinutes)} mins.`);
  };

  const handleServeNext = () => {
    if (currentServing >= lastIssued) {
      showToast('All issued tokens for this venue have been served.');
      return;
    }
    const nextServing = currentServing + 1;
    setCurrentServing(nextServing);
    showToast(`Counter 1 now calling Token #${nextServing}. Waiting line decreased!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="bg-indigo-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-md">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-indigo-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pan-India Digital Token & QR System
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Nationwide Queues
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse high-footfall religious centers, AIIMS hospitals, and metro transit hubs across New Delhi, Mumbai, Varanasi, Bengaluru, Kolkata, and Hyderabad.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setQrModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Venue QR Code</span>
          </button>
          <button
            onClick={handleServeNext}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Serve Next Token</span>
          </button>
        </div>
      </div>

      {/* Active User Token Banner (Wait-Kyu Feature in SmartCrowd Interface) */}
      {userToken && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Your Active Digital Token · Remote Waiting
              </span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{userToken.hubName}</span>
                <span className="text-xs font-normal text-indigo-200 bg-white/10 px-2 py-0.5 rounded">
                  {userToken.city}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Issued for {userToken.customerName} at {userToken.issuedAt} · Token ID: {userToken.id}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-xs">
              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200">Your Token</span>
                <p className="text-3xl font-mono font-extrabold text-amber-400">
                  #{userToken.tokenNumber}
                </p>
              </div>

              <div className="h-8 w-px bg-white/20" />

              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200">People Ahead</span>
                <p className="text-2xl font-mono font-bold text-white">
                  {peopleAhead}
                </p>
              </div>

              <div className="h-8 w-px bg-white/20" />

              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200">Estimated Wait</span>
                <p className="text-2xl font-mono font-bold text-emerald-400">
                  ~{estimatedWait}m
                </p>
              </div>

              <div className="h-8 w-px bg-white/20" />

              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200">Now Serving</span>
                <p className="text-2xl font-mono font-bold text-indigo-100">
                  #{currentServing}
                </p>
              </div>

              <button
                onClick={() => {
                  setUserToken(null);
                  showToast('You have cancelled / left the queue.');
                }}
                className="ml-2 text-xs text-red-300 hover:text-red-100 underline cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nationwide Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian cities, hospitals, temples, metro lines..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white text-slate-900"
            />
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            <span className="font-semibold text-slate-500 whitespace-nowrap">City:</span>
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCity === c
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pan-India Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredHubs.map((hub) => {
          const isSelected = activeHub.id === hub.id;
          return (
            <div
              key={hub.id}
              className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {hub.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {hub.city}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {hub.name}
                </h3>

                <p className="text-[11px] text-slate-500">
                  {hub.state} · Footfall: {hub.activeVisitors} people
                </p>

                <div className="bg-slate-50 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-center border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Serving</span>
                    <p className="text-base font-mono font-bold text-emerald-700">#{currentServing}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Wait</span>
                    <p className="text-base font-mono font-bold text-amber-700">
                      ~{(lastIssued - currentServing) * avgPaceMinutes}m
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleTakeTicket(hub)}
                  className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  Generate Token
                </button>
                <button
                  onClick={() => {
                    setActiveHub(hub);
                    setQrModalOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  title="View Door QR Poster"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                SmartCrowd Entry Kiosk
              </span>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 bg-slate-50 space-y-3">
              <p className="text-sm font-bold text-slate-900">{activeHub.name}</p>
              <p className="text-xs text-slate-500">{activeHub.city}, {activeHub.state}</p>

              <div className="mx-auto w-36 h-36 bg-white border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center shadow-inner">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="text-[9px] font-mono text-slate-500">SCAN FOR TOKEN</span>
              </div>

              <p className="text-[11px] text-slate-600">
                Visitors can scan this QR code with any mobile camera to take a token without standing in line.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Poster</span>
              </button>
              <button
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
