import React from 'react';
import { X, Sparkles, Brain, Clock, Shield, History, ArrowRight } from 'lucide-react';
import { CognitiveMemory, CognitiveConfig } from '../types/memory';
import { getHalfLifeHours, calculateRetention, formatSimulatedTime } from '../utils/cognitiveModel';

interface MemoryDetailModalProps {
  memory: CognitiveMemory | null;
  simulatedTimeHours: number;
  config: CognitiveConfig;
  onClose: () => void;
  onReinforce: (id: string) => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  simulatedTimeHours,
  config,
  onClose,
  onReinforce,
}) => {
  if (!memory) return null;

  const currentR = calculateRetention(memory, simulatedTimeHours, config);
  const pct = (currentR * 100).toFixed(0);
  const halfLife = getHalfLifeHours(memory, config);
  const daysSinceReviewed = ((simulatedTimeHours - memory.lastReviewedAtHours) / 24).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2 className="font-serif text-lg font-bold text-white">
              Synaptic Trace Inspector
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Fact Display */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Encrypted Synaptic Fact
            </div>
            <p className="font-medium text-white text-base leading-snug">
              {memory.fact}
            </p>
          </div>

          {/* Retention Gauge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-mono">Current Retention Score</span>
              <span className="font-mono text-base font-bold text-white tabular-nums">
                {pct}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentR >= 0.7
                    ? 'bg-emerald-400'
                    : currentR >= 0.4
                    ? 'bg-amber-400'
                    : currentR >= 0.15
                    ? 'bg-rose-400'
                    : 'bg-slate-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
              <span>Retrieval State: <strong className="uppercase text-slate-200">{memory.state}</strong></span>
              <span>Last active: {daysSinceReviewed}d ago</span>
            </div>
          </div>

          {/* Mathematical Parameters Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Stability S:</span>
              <span className="text-white font-semibold text-sm">{memory.stability} hours</span>
              <span className="text-slate-500 block text-[10px] mt-0.5">
                ({(memory.stability / 24).toFixed(1)} days)
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Half-Life t₁/₂:</span>
              <span className="text-white font-semibold text-sm">
                {(halfLife / 24).toFixed(1)} days
              </span>
              <span className="text-slate-500 block text-[10px] mt-0.5">Time to reach 50%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Emotional Salience:</span>
              <span className="text-white font-semibold text-sm">
                {memory.emotionalSalience.toFixed(1)}x
              </span>
              <span className="text-slate-500 block text-[10px] mt-0.5">Decay shield multiplier</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Spaced Reviews:</span>
              <span className="text-white font-semibold text-sm">
                {memory.reinforcementCount}x reinforced
              </span>
              <span className="text-slate-500 block text-[10px] mt-0.5">Consolidation index</span>
            </div>
          </div>

          {/* Relearning History Log */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Synaptic Consolidation History</span>
            </div>

            {memory.relearningHistory.length === 0 ? (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-500 italic">
                No spaced repetition reviews recorded yet. Initial learning state only.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {memory.relearningHistory.map((evt, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-indigo-400">
                      <span>Event #{i + 1} at T={evt.timeHours}h</span>
                      <span className="text-emerald-400">S → {evt.stabilityAfter}h</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{evt.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              onReinforce(memory.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reinforce & Boost Stability</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
