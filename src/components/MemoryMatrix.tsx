import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  History,
  Info
} from 'lucide-react';
import { CognitiveMemory, MemoryCategory, MemoryState, CognitiveConfig } from '../types/memory';
import { getHalfLifeHours, formatSimulatedTime } from '../utils/cognitiveModel';

interface MemoryMatrixProps {
  memories: CognitiveMemory[];
  simulatedTimeHours: number;
  config: CognitiveConfig;
  onReinforceMemory: (id: string) => void;
  onDeleteMemory: (id: string) => void;
  onOpenAddModal: () => void;
  onSelectMemoryForDetail: (memory: CognitiveMemory) => void;
}

export const MemoryMatrix: React.FC<MemoryMatrixProps> = ({
  memories,
  simulatedTimeHours,
  config,
  onReinforceMemory,
  onDeleteMemory,
  onOpenAddModal,
  onSelectMemoryForDetail,
}) => {
  const [filterState, setFilterState] = useState<'all' | MemoryState>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | MemoryCategory>('all');

  const filteredMemories = memories.filter((mem) => {
    const matchesState = filterState === 'all' || mem.state === filterState;
    const matchesCategory = selectedCategory === 'all' || mem.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      mem.fact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesState && matchesCategory && matchesSearch;
  });

  const getStateColor = (state: MemoryState) => {
    switch (state) {
      case 'vivid':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'fading':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'faint':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      case 'forgotten':
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
            Cognitive Memory Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time inspection of active synaptic traces, retention decay metrics, and spaced stability indices.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Memory Trace</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
        {/* State Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterState === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({memories.length})
          </button>
          <button
            onClick={() => setFilterState('vivid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterState === 'vivid'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vivid (≥ 70%)
          </button>
          <button
            onClick={() => setFilterState('fading')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterState === 'fading'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fading (40–69%)
          </button>
          <button
            onClick={() => setFilterState('faint')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterState === 'faint'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Faint (15–39%)
          </button>
          <button
            onClick={() => setFilterState('forgotten')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterState === 'forgotten'
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forgotten (&lt; 15%)
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory facts or tags..."
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Memory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            No memories match the selected filters.
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const retention = mem.currentRetention ?? 1;
            const pct = (retention * 100).toFixed(0);
            const state = mem.state || 'vivid';
            const halfLife = getHalfLifeHours(mem, config);
            const daysSinceReview = ((simulatedTimeHours - mem.lastReviewedAtHours) / 24).toFixed(1);

            return (
              <div
                key={mem.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
              >
                <div>
                  {/* Category and State Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {mem.category}
                    </span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium border ${getStateColor(
                        state
                      )}`}
                    >
                      {state.toUpperCase()} · {pct}%
                    </span>
                  </div>

                  {/* Fact statement */}
                  <h3
                    onClick={() => onSelectMemoryForDetail(mem)}
                    className="text-sm font-medium text-slate-100 hover:text-indigo-300 cursor-pointer leading-snug mb-3"
                  >
                    {mem.fact}
                  </h3>

                  {/* Retention Visual Progress Meter */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-4 border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        state === 'vivid'
                          ? 'bg-emerald-400'
                          : state === 'fading'
                          ? 'bg-amber-400'
                          : state === 'faint'
                          ? 'bg-rose-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Cognitive Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div>
                      <span className="text-slate-500 block">Stability (S):</span>
                      <span className="text-slate-200 font-semibold">{mem.stability} hours</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Half-Life (t₁/₂):</span>
                      <span className="text-slate-200 font-semibold">
                        {(halfLife / 24).toFixed(1)} days
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Spaced Reviews:</span>
                      <span className="text-slate-200 font-semibold">
                        {mem.reinforcementCount}x reinforced
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Last Refreshed:</span>
                      <span className="text-slate-200 font-semibold">{daysSinceReview}d ago</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onReinforceMemory(mem.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/40 rounded-lg transition-colors"
                    title="Reinforce and boost memory stability"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reinforce (Relearn)</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectMemoryForDetail(mem)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Inspect memory details & history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Prune / delete trace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
