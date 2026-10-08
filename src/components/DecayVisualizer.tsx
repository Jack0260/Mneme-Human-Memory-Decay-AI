import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { CognitiveMemory, CognitiveConfig } from '../types/memory';
import {
  calculateRetention,
  getHalfLifeHours,
  formatSimulatedTime,
} from '../utils/cognitiveModel';

interface DecayVisualizerProps {
  memories: CognitiveMemory[];
  simulatedTimeHours: number;
  config: CognitiveConfig;
  onAdvanceTime: (hours: number) => void;
  onSetTime: (hours: number) => void;
  onReinforceMemory: (id: string) => void;
}

export const DecayVisualizer: React.FC<DecayVisualizerProps> = ({
  memories,
  simulatedTimeHours,
  config,
  onAdvanceTime,
  onSetTime,
  onReinforceMemory,
}) => {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(
    memories[0]?.id || null
  );
  const [showSpacedComparison, setShowSpacedComparison] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; retention: number } | null>(
    null
  );

  const maxDays = 21; // 3 weeks window
  const maxHours = maxDays * 24;

  const selectedMemory = useMemo(
    () => memories.find((m) => m.id === selectedMemoryId) || memories[0],
    [memories, selectedMemoryId]
  );

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 360;
  const padding = { top: 30, right: 30, bottom: 45, left: 60 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Scale helpers
  const getX = (hours: number) => padding.left + (hours / maxHours) * graphWidth;
  const getY = (retention: number) => padding.top + (1 - retention) * graphHeight;

  // Curve generation for selected memory
  const primaryCurvePoints = useMemo(() => {
    if (!selectedMemory) return [];
    const pts: Array<{ x: number; y: number; hours: number; r: number }> = [];
    const steps = 60;
    const effS =
      (selectedMemory.stability *
        (1 + (selectedMemory.emotionalSalience - 1) * config.emotionalResistanceFactor)) /
      config.decayRateMultiplier;

    for (let i = 0; i <= steps; i++) {
      const hours = (i / steps) * maxHours;
      const r = Math.exp(-hours / effS);
      pts.push({
        hours,
        r,
        x: getX(hours),
        y: getY(r),
      });
    }
    return pts;
  }, [selectedMemory, config, maxHours]);

  // Spaced repetition comparison curves (Review 1, Review 2, Review 3)
  const spacedCurves = useMemo(() => {
    if (!selectedMemory || !showSpacedComparison) return [];
    const baseS =
      (selectedMemory.stability *
        (1 + (selectedMemory.emotionalSalience - 1) * config.emotionalResistanceFactor)) /
      config.decayRateMultiplier;

    // Review 1 at day 2 (48h)
    const s1 = baseS * config.relearningBoostFactor;
    // Review 2 at day 7 (168h)
    const s2 = s1 * config.relearningBoostFactor;

    const generatePts = (startH: number, stab: number) => {
      const pts: Array<{ x: number; y: number; hours: number; r: number }> = [];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const h = startH + (i / steps) * (maxHours - startH);
        const r = Math.exp(-(h - startH) / stab);
        pts.push({ hours: h, r, x: getX(h), y: getY(r) });
      }
      return pts;
    };

    return [
      { label: 'After Review 1 (Day 2)', color: '#38bdf8', pts: generatePts(48, s1) },
      { label: 'After Review 2 (Day 7)', color: '#34d399', pts: generatePts(168, s2) },
    ];
  }, [selectedMemory, showSpacedComparison, config, maxHours]);

  const primaryPathD = useMemo(() => {
    if (primaryCurvePoints.length === 0) return '';
    return primaryCurvePoints.reduce(
      (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
      ''
    );
  }, [primaryCurvePoints]);

  const currentHourX = getX(Math.min(simulatedTimeHours, maxHours));
  const currentMemoryR = selectedMemory
    ? calculateRetention(selectedMemory, simulatedTimeHours, config)
    : 1.0;
  const currentMemoryY = getY(currentMemoryR);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Educational Banner with diagram illustration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <TrendingDown className="w-4 h-4" />
            <span>The Hermann Ebbinghaus Mathematical Model (1885)</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Retention R(t) = e^{`{-t / S}`}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Human memory retention decays exponentially over elapsed time <span className="font-mono text-indigo-300">t</span> unless
            stabilized by cognitive review. Each time a memory is reinforced at a spaced interval, its stability{' '}
            <span className="font-mono text-indigo-300">S</span> multiplies, dramatically flattening the curve into permanent long-term storage.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-mono">
            <span>Vivid: ≥ 70%</span>
            <span aria-hidden="true">·</span>
            <span>Tip-of-Tongue: 40%–69%</span>
            <span aria-hidden="true">·</span>
            <span>Faint Trace: 15%–39%</span>
            <span aria-hidden="true">·</span>
            <span>Forgotten: &lt; 15%</span>
          </div>
        </div>

        {/* Cognitive Illustration Asset */}
        <div className="lg:col-span-4 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 aspect-[16/9]">
          <img
            src="/src/assets/images/cognitive_memory_decay_1791463093167.jpg"
            alt="Cognitive memory decay scientific illustration"
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
            <span className="text-[11px] font-mono text-slate-300">
              Synaptic Decay & Spaced Reinforcement
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Memory Selection Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Active Memory Traces
            </h2>
            <span className="text-xs text-slate-500 font-mono">{memories.length} traces</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
            {memories.map((mem) => {
              const isSelected = mem.id === selectedMemoryId;
              const r = mem.currentRetention ?? 1;
              const halfLife = getHalfLifeHours(mem, config);

              return (
                <button
                  key={mem.id}
                  onClick={() => setSelectedMemoryId(mem.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="text-xs font-medium line-clamp-2 mb-1.5">{mem.fact}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="capitalize">{mem.category}</span>
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      {(r * 100).toFixed(0)}% R
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/60">
                    <span>t₁/₂ = {(halfLife / 24).toFixed(1)}d</span>
                    <span>{mem.reinforcementCount}x learned</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedMemory && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => onReinforceMemory(selectedMemory.id)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reinforce Selected Trace Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Right / Center: Interactive Graph Canvas */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-white">
                  {selectedMemory?.fact || 'Synaptic Decay Curve'}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span>Category: {selectedMemory?.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Emotional Salience: {selectedMemory?.emotionalSalience}x</span>
                  <span aria-hidden="true">·</span>
                  <span>Stability S: {selectedMemory?.stability}h</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSpacedComparison(!showSpacedComparison)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                    showSpacedComparison
                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                      : 'text-slate-400 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {showSpacedComparison ? '✓ Spaced Reviews Overlay' : '+ Show Spaced Reviews'}
                </button>
              </div>
            </div>

            {/* SVG Graph */}
            <div className="w-full overflow-x-auto bg-slate-950 rounded-xl p-2 border border-slate-800/80">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[680px]"
              >
                {/* Threshold bands */}
                {/* Vivid band (70% - 100%) */}
                <rect
                  x={padding.left}
                  y={getY(1.0)}
                  width={graphWidth}
                  height={getY(config.vividThreshold) - getY(1.0)}
                  fill="#059669"
                  fillOpacity="0.06"
                />
                {/* Fading band (40% - 70%) */}
                <rect
                  x={padding.left}
                  y={getY(config.vividThreshold)}
                  width={graphWidth}
                  height={getY(config.fadingThreshold) - getY(config.vividThreshold)}
                  fill="#d97706"
                  fillOpacity="0.06"
                />
                {/* Faint band (15% - 40%) */}
                <rect
                  x={padding.left}
                  y={getY(config.fadingThreshold)}
                  width={graphWidth}
                  height={getY(config.faintThreshold) - getY(config.fadingThreshold)}
                  fill="#e11d48"
                  fillOpacity="0.06"
                />

                {/* Horizontal Grid lines */}
                {[1.0, 0.7, 0.4, 0.15, 0.0].map((rVal) => (
                  <g key={rVal}>
                    <line
                      x1={padding.left}
                      y1={getY(rVal)}
                      x2={svgWidth - padding.right}
                      y2={getY(rVal)}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray={rVal === 0.7 || rVal === 0.4 || rVal === 0.15 ? '4 4' : 'none'}
                    />
                    <text
                      x={padding.left - 8}
                      y={getY(rVal) + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {(rVal * 100).toFixed(0)}%
                    </text>
                  </g>
                ))}

                {/* Vertical Day lines */}
                {Array.from({ length: 8 }, (_, i) => i * 3).map((d) => {
                  const h = d * 24;
                  return (
                    <g key={d}>
                      <line
                        x1={getX(h)}
                        y1={padding.top}
                        x2={getX(h)}
                        y2={svgHeight - padding.bottom}
                        stroke="#1e293b"
                        strokeWidth="1"
                      />
                      <text
                        x={getX(h)}
                        y={svgHeight - padding.bottom + 16}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {d === 0 ? 'Start' : `Day ${d}`}
                      </text>
                    </g>
                  );
                })}

                {/* Spaced repetition comparison paths */}
                {spacedCurves.map((sc) => {
                  const pathStr = sc.pts.reduce(
                    (acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
                    ''
                  );
                  return (
                    <path
                      key={sc.label}
                      d={pathStr}
                      fill="none"
                      stroke={sc.color}
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                  );
                })}

                {/* Primary Memory Curve */}
                <path
                  d={primaryPathD}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="3"
                />

                {/* Current Time Cursor Line */}
                {simulatedTimeHours <= maxHours && (
                  <g>
                    <line
                      x1={currentHourX}
                      y1={padding.top}
                      x2={currentHourX}
                      y2={svgHeight - padding.bottom}
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    {/* Current Retention Point Node */}
                    <circle
                      cx={currentHourX}
                      cy={currentMemoryY}
                      r="6"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={currentHourX}
                      y={padding.top - 8}
                      fill="#f43f5e"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      Now: T={(simulatedTimeHours / 24).toFixed(1)}d ({(currentMemoryR * 100).toFixed(0)}%)
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Interactive Legend & Time Scrubber */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-400 inline-block"></span>
                  <span className="text-slate-200">Current Decay Curve</span>
                </span>
                {showSpacedComparison && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-sky-400 border-dashed inline-block"></span>
                      <span>Review 1 (Day 2)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-emerald-400 border-dashed inline-block"></span>
                      <span>Review 2 (Day 7)</span>
                    </span>
                  </>
                )}
              </div>

              <div className="text-slate-400">
                Current Time:{' '}
                <span className="text-white font-semibold tabular-nums">
                  {formatSimulatedTime(simulatedTimeHours).label}
                </span>
              </div>
            </div>

            {/* Time scrub slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Drag to Scrub Simulation Clock:</span>
                <span>Max: {maxDays} Days (504 hours)</span>
              </div>
              <input
                type="range"
                min="0"
                max={maxHours}
                value={simulatedTimeHours}
                onChange={(e) => onSetTime(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
