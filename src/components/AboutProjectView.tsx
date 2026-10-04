import React from 'react';
import {
  Info,
  Code2,
  Cpu,
  Layers,
  ArrowDown,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  const technologies = [
    { name: 'React', detail: 'Component-based declarative UI architecture & hooks state' },
    { name: 'JavaScript / TypeScript', detail: 'Simulation timer engine, threshold rules, and data modeling' },
    { name: 'HTML5', detail: 'Semantic layout structure & accessible tables' },
    { name: 'CSS / Tailwind CSS', detail: 'Responsive dashboard styling, status themes, and grid layout' },
    { name: 'Chart Visualization', detail: 'Interactive time-series and zone occupancy analytics charts' },
    { name: 'Local / Mock Data', detail: 'Self-contained realistic state for offline demonstration' },
  ];

  const futureScopeList = [
    {
      title: 'CCTV Integration',
      desc: 'Connect RTSP video streams from overhead IP cameras at entrances and waiting halls.',
    },
    {
      title: 'Computer Vision',
      desc: 'Integrate OpenCV / YOLO object detection pipelines for real-time bounding-box headcount.',
    },
    {
      title: 'AI-Based Crowd Prediction',
      desc: 'Train time-series forecasting models on historical footfall, weather, and event schedules.',
    },
    {
      title: 'IoT Sensors',
      desc: 'Deploy infrared beam counters, LiDAR turnstiles, and Wi-Fi probe sensors at doorways.',
    },
    {
      title: 'Facial / Anonymous People Counting',
      desc: 'Privacy-preserving silhouette and head-shoulder tracking without storing biometric PII.',
    },
    {
      title: 'Cloud Deployment',
      desc: 'Multi-branch synchronization backed by Firebase Firestore or PostgreSQL in the cloud.',
    },
    {
      title: 'Mobile Application',
      desc: 'React Native / Flutter companion app for visitors to check queue wait times remotely.',
    },
    {
      title: 'Predictive Crowd Analytics',
      desc: 'Automated staff shift scheduling before predicted congestion waves occur.',
    },
  ];

  const vivaArchitectureSteps = [
    {
      step: 'Layer 01',
      title: 'CCTV / Sensors / Manual Data',
      desc: 'Simulated sensor feed and manual operator controls generate live footfall & queue events.',
    },
    {
      step: 'Layer 02',
      title: 'Data Collection',
      desc: 'Centralized React state store ingests zone headcounts, active counters, and staff rosters.',
    },
    {
      step: 'Layer 03',
      title: 'Crowd & Queue Processing',
      desc: 'Computes real-time occupancy percentages (current / capacity) and average wait times.',
    },
    {
      step: 'Layer 04',
      title: 'Crowd Density Analysis',
      desc: 'Classifies zones into Low (Green), Medium (Yellow), High (Orange), or Critical (Red).',
    },
    {
      step: 'Layer 05',
      title: 'Alert & Recommendation Engine',
      desc: 'Evaluates 80% / 90% capacity rules and >40 / >70 queue thresholds to prescribe actions.',
    },
    {
      step: 'Layer 06',
      title: 'Dashboard',
      desc: 'Renders live KPI cards, spatial heatmaps, queue tables, and historical analytics.',
    },
    {
      step: 'Layer 07',
      title: 'Admin / Staff Action',
      desc: 'Manager opens additional counters, reassigns available staff, or redirects visitor inflow.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          About Project &amp; Viva Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Academic project documentation, technology stack, conceptual system architecture, and
          future scope for BCA project presentation.
        </p>
      </div>

      {/* Project Overview Card (Requirement 17) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-indigo-600">
              BCA SOFTWARE ENGINEERING PROJECT
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Real-Time Crowd Queue and Crowd Management
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-100 px-3.5 py-2 rounded-lg w-fit">
            Application Name: SmartCrowd
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Project Objective</span>
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200/80">
            &ldquo;To develop a smart system that monitors crowd density and queue lengths in real
            time, helping organizations manage space, reduce wait times, and improve safety and
            customer experience.&rdquo;
          </p>
        </div>

        {/* Technology Stack Grid */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Technology Stack Used</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-1"
              >
                <div className="text-xs font-bold text-slate-900">{tech.name}</div>
                <div className="text-xs text-slate-600">{tech.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Viva-Friendly Conceptual Architecture (Requirement 19) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Viva-Friendly Conceptual System Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Step-by-step data flow from simulated sensor collection to manager floor intervention
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-2">
          {vivaArchitectureSteps.map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-indigo-600 text-white rounded">
                    {item.step}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{item.title}</span>
                </div>
                <span className="text-xs text-slate-600 sm:text-right max-w-md">{item.desc}</span>
              </div>
              {idx < vivaArchitectureSteps.length - 1 && (
                <div className="flex justify-center py-0.5 text-indigo-500">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Future Scope Section (Requirement 17) & Backend Integration Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Future Scope &amp; Enhancements</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {futureScopeList.map((scope) => (
              <div
                key={scope.title}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{scope.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{scope.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              How to Connect Firebase or Real Backend Later
            </h2>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              Currently, all state is managed cleanly inside <code className="font-mono text-indigo-700">src/data/mockData.ts</code> and <code className="font-mono text-indigo-700">src/App.tsx</code> so the application works reliably offline during college viva demonstrations.
            </p>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="font-semibold text-slate-900">3-Step Backend Upgrade Path:</div>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>
                  <span className="font-medium text-slate-800">Firestore Collections:</span> Replace{' '}
                  <code className="font-mono">INITIAL_ZONES</code>,{' '}
                  <code className="font-mono">INITIAL_QUEUES</code>, and{' '}
                  <code className="font-mono">INITIAL_STAFF</code> with Firebase{' '}
                  <code className="font-mono">onSnapshot()</code> listeners.
                </li>
                <li>
                  <span className="font-medium text-slate-800">IoT / Camera Webhook:</span> Replace
                  the <code className="font-mono">setInterval</code> simulation loop in{' '}
                  <code className="font-mono">App.tsx</code> with a WebSocket or REST endpoint
                  receiving live headcounts from Python OpenCV scripts.
                </li>
                <li>
                  <span className="font-medium text-slate-800">Firebase Auth:</span> Connect{' '}
                  <code className="font-mono">LoginPage.tsx</code> to{' '}
                  <code className="font-mono">signInWithEmailAndPassword()</code> for multi-branch
                  manager logins.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
