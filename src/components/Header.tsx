import React from 'react';
import { FastForward, RefreshCw, Calendar, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'visualizer' | 'matrix' | 'lab';
  setActiveTab: (tab: 'chat' | 'visualizer' | 'matrix' | 'lab') => void;
  sessionNumber: number;
  simulatedTimeHours: number;
  onAdvanceTime: (hours: number) => void;
  onNewSession: () => void;
  onResetSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sessionNumber,
  simulatedTimeHours,
  onAdvanceTime,
  onNewSession,
  onResetSimulation,
}) => {
  const daysElapsed = (simulatedTimeHours / 24).toFixed(1);

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-serif font-bold text-lg">
            M
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-white block leading-none">
              Mneme
            </span>
            <span className="text-[11px] text-slate-400 font-mono tracking-wider">
              COGNITIVE DECAY AI
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Assistant Stage
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'visualizer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Decay Visualizer
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Memory Matrix
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'lab'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cognitive Lab
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Quick session info */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1.5 rounded-md border border-slate-800 tabular-nums">
            <span className="text-indigo-400 font-semibold">Session {sessionNumber}</span>
            <span aria-hidden="true">·</span>
            <span>+{daysElapsed}d</span>
          </div>

          <button
            onClick={() => onAdvanceTime(24)}
            title="Fast forward simulated time by 24 hours"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
          >
            <FastForward className="w-3.5 h-3.5 text-indigo-400" />
            <span>+24h</span>
          </button>

          <button
            onClick={onNewSession}
            title="Conclude current session and start Session N+1"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>

          <button
            onClick={onResetSimulation}
            title="Reset simulation to initial state"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
