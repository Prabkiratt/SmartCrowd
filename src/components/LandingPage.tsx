import React from 'react';
import {
  Activity,
  Users,
  ShieldAlert,
  UserCheck,
  BarChart3,
  Lightbulb,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onViewDemo }) => {
  const features = [
    {
      title: 'Real-Time Monitoring',
      description:
        'Track live occupancy counts, zone capacity ratios, and inflow rates across entrances, waiting lounges, and service halls without external hardware dependencies.',
      icon: Activity,
      metric: '6 Active Zones · 2.5s Telemetry Refresh',
    },
    {
      title: 'Smart Queue Management',
      description:
        'Dynamically control active service counters, adjust queue thresholds, and monitor average visitor waiting time across ticketing and registration desks.',
      icon: Sliders,
      metric: '4 Live Queues · Instant Counter Scaling',
    },
    {
      title: 'Safety Alerts',
      description:
        'Automated multi-tier threshold checks trigger Info, Warning, and Critical notifications when occupancy surpasses 80% or 90% capacity limits.',
      icon: ShieldAlert,
      metric: '80% Warning · 90% Critical Thresholds',
    },
    {
      title: 'Staff Optimization',
      description:
        'View real-time staff availability and reassign security officers, floor coordinators, and counter operators directly to bottlenecked zones.',
      icon: UserCheck,
      metric: 'Role-Based Dispatch · Live Task Tracking',
    },
    {
      title: 'Analytics & Reports',
      description:
        'Inspect historical crowd trends, queue length curves, peak hour windows (5:00 PM – 7:00 PM), and zone-wise distribution with interactive time filters.',
      icon: BarChart3,
      metric: 'Today · 7-Day · 30-Day Reporting',
    },
    {
      title: 'Smart Recommendations',
      description:
        'Rule-based decision engine analyzes live queue lengths and zone density to prescribe concrete actions such as opening backup counters or redirecting gates.',
      icon: Lightbulb,
      metric: 'Automated Action Prescriptions',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Crowd Monitoring',
      detail: 'Simulated CCTV / sensor streams capture visitor entry and zone counts.',
    },
    {
      step: '02',
      title: 'Data Processing',
      detail: 'Real-time state engine normalizes headcount against zone capacity limits.',
    },
    {
      step: '03',
      title: 'Crowd & Queue Analysis',
      detail: 'Calculates occupancy percentages, wait times, and service throughput.',
    },
    {
      step: '04',
      title: 'Alerts & Recommendations',
      detail: 'Rule-based engine flags bottlenecks and suggests counter or staff shifts.',
    },
    {
      step: '05',
      title: 'Manager Action',
      detail: 'Admin opens counters, reassigns staff, or adjusts zone thresholds.',
    },
    {
      step: '06',
      title: 'Improved Crowd Flow',
      detail: 'Reduced waiting times, balanced zone density, and verified visitor safety.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 Zones (Brand, 4-5 Nav Links, 1-2 Actions) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 lg:px-12 py-4 flex items-center justify-between">
        <a href="#top" className="text-xl font-bold tracking-tight text-indigo-950 whitespace-nowrap">
          SmartCrowd
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors whitespace-nowrap">
            Capabilities
          </a>
          <a href="#workflow" className="hover:text-indigo-600 transition-colors whitespace-nowrap">
            System Workflow
          </a>
          <a href="#live-preview" className="hover:text-indigo-600 transition-colors whitespace-nowrap">
            Live Telemetry
          </a>
          <a href="#architecture" className="hover:text-indigo-600 transition-colors whitespace-nowrap">
            Project Scope
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onViewDemo}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            View Demo
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-medium text-indigo-700 tracking-wide">
              Real-Time Crowd Queue &amp; Crowd Management System · BCA Academic Demonstration
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Real-Time Crowd Management Made Smarter
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Monitor crowd density, manage queues, reduce waiting time, and improve safety with
              real-time insights. Built to help organizations optimize staff allocation and visitor
              experience across high-traffic venues.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onViewDemo}
                className="px-6 py-3 text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                View Demo (Instant Access)
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span>Role-Based Access: Admin, Staff &amp; Visitors</span>
              <span aria-hidden="true">·</span>
              <span>Simulated Sensor &amp; Queue Engine</span>
              <span aria-hidden="true">·</span>
              <span>Zero External Hardware Required</span>
            </div>
          </div>

          {/* Interactive Live Preview Snapshot Card */}
          <div id="live-preview" className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Live Venue Telemetry Preview
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time zone occupancy &amp; queue status
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-xs text-slate-500">Total People in Area</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    600 <span className="text-xs font-normal text-slate-500">/ 920</span>
                  </div>
                  <div className="text-xs text-amber-700 mt-1">65% Overall Occupancy</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-xs text-slate-500">Average Waiting Time</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    14.5 <span className="text-xs font-normal text-slate-500">min</span>
                  </div>
                  <div className="text-xs text-indigo-700 mt-1">4 Active Service Queues</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">
                  Zone Density Visualization
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-800">Main Entrance</span>
                      <span className="font-mono tabular-nums text-orange-700">
                        145 / 200 · 73% · High
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '73%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-800">Waiting Area</span>
                      <span className="font-mono tabular-nums text-red-700">
                        175 / 200 · 88% · Critical
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-800">Food Court</span>
                      <span className="font-mono tabular-nums text-emerald-700">
                        60 / 150 · 40% · Low
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Recommendation: Open Service Counter 3</span>
                <button
                  onClick={onViewDemo}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Launch Full Console →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="bg-white border-y border-slate-200 py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Core Capabilities for Crowd &amp; Queue Control
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Designed for administrators, floor staff, and visitors to coordinate safe, low-latency
              movement across busy service facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200/80 text-xs font-mono text-slate-500">
                    {item.metric}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-10">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            End-to-End Crowd Management Workflow
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            How SmartCrowd transforms raw occupancy counts into actionable floor decisions in real
            time.
          </p>
        </div>

        {/* Vertical & Horizontal Responsive Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {workflowSteps.map((wf, index) => (
            <div key={wf.step} className="flex flex-col items-stretch">
              <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between relative">
                <div className="space-y-2">
                  <div className="text-xs font-mono font-semibold text-indigo-600">
                    STEP {wf.step}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{wf.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{wf.detail}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="flex lg:hidden justify-center pt-3 text-slate-400">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Viva Architecture Callout Banner */}
        <div
          id="architecture"
          className="bg-indigo-950 text-white rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-indigo-300">
              System Architecture · Ready for Live Demonstration
            </div>
            <h3 className="text-xl font-bold">
              Explore the Interactive Real-Time Crowd Simulation
            </h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Test live crowd fluctuations, open or close service counters, reassign staff across
              zones, and inspect rule-based recommendations with one click.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onViewDemo}
              className="px-5 py-2.5 text-xs font-semibold bg-white text-indigo-950 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Launch Demo Dashboard
            </button>
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-xs font-semibold bg-indigo-800 text-white hover:bg-indigo-700 border border-indigo-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">SmartCrowd</span>
            <span>·</span>
            <span>Real-Time Crowd Queue &amp; Crowd Management System</span>
          </div>
          <div>
            BCA College Project Demonstration · React + TypeScript + Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
};
