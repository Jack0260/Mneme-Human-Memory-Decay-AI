import React from 'react';
import { Clock, Play, FastForward, RotateCcw, Brain, ShieldAlert } from 'lucide-react';
import { CognitiveMemory, MemoryState } from '../types/memory';
import { formatSimulatedTime } from '../utils/cognitiveModel';

interface TimeControlsProps {
  simulatedTimeHours: number;
  sessionNumber: number;
  onSetTime: (hours: number) => void;
  onAdvanceTime: (hours: number) => void;
  memories: CognitiveMemory[];
}

export const TimeControls: React.FC<TimeControlsProps> = ({
  simulatedTimeHours,
  sessionNumber,
  onSetTime,
  onAdvanceTime,
  memories,
}) => {
  const timeInfo = formatSimulatedTime(simulatedTimeHours);

  // Calculate memory distribution
  const stateCounts = memories.reduce(
    (acc, m) => {
      const state = (m.state || 'vivid') as MemoryState;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    },
    { vivid: 0, fading: 0, faint: 0, forgotten: 0 } as Record<MemoryState, number>
  );

  const avgRetention =
    memories.length > 0
      ? (
          memories.reduce((acc, m) => acc + (m.currentRetention || 0), 0) /
          memories.length
        ) * 100
      : 100;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Time and Session Readout */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono font-semibold text-white">
              {timeInfo.label}
            </span>
            <span className="text-slate-500">
              ({simulatedTimeHours}h total)
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Retention health strip */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">Mean Retention:</span>
            <span className="font-mono font-semibold text-emerald-400 tabular-nums">
              {avgRetention.toFixed(0)}%
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Cognitive states summary */}
          <div className="hidden lg:flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{stateCounts.vivid} Vivid</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{stateCounts.fading} Fading</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>{stateCounts.faint} Faint</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>{stateCounts.forgotten} Forgotten</span>
            </span>
          </div>
        </div>

        {/* Right: Quick Time Advances & Scrubber */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onAdvanceTime(1)}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Advance 1 hour"
            >
              +1h
            </button>
            <button
              onClick={() => onAdvanceTime(6)}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Advance 6 hours"
            >
              +6h
            </button>
            <button
              onClick={() => onAdvanceTime(24)}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Advance 1 day"
            >
              +1d
            </button>
            <button
              onClick={() => onAdvanceTime(72)}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Advance 3 days"
            >
              +3d
            </button>
            <button
              onClick={() => onAdvanceTime(168)}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Advance 1 week (7 days)"
            >
              +1w
            </button>
            <button
              onClick={() => onAdvanceTime(720)}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Advance 1 month (30 days)"
            >
              +1mo
            </button>
          </div>

          <button
            onClick={() => onSetTime(0)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="Reset clock to 0h (Session 1 Start)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
