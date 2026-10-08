import React from 'react';
import {
  FlaskConical,
  Sparkles,
  Sliders,
  BookOpen,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Brain,
  Shield,
  Layers
} from 'lucide-react';
import { CognitiveConfig } from '../types/memory';
import { DEFAULT_COGNITIVE_CONFIG } from '../utils/cognitiveModel';

interface CognitiveLabProps {
  config: CognitiveConfig;
  onUpdateConfig: (newConfig: CognitiveConfig) => void;
  onRunExperiment: (experimentId: string) => void;
}

export const CognitiveLab: React.FC<CognitiveLabProps> = ({
  config,
  onUpdateConfig,
  onRunExperiment,
}) => {
  const handleResetDefaults = () => {
    onUpdateConfig(DEFAULT_COGNITIVE_CONFIG);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Hero Intro */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-2">
          <FlaskConical className="w-4 h-4" />
          <span>Interactive Cognitive Laboratory</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Cognitive Architecture & Spaced Repetition Experiments
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Explore how biological memory principles—such as the Ebbinghaus forgetting curve,
          Robert Bjork's desirable difficulty, and emotional salience shields—transform AI behavior
          from rigid database storage into authentic human cognition.
        </p>
      </div>

      {/* Guided Cognitive Experiments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Guided Cognitive Experiments</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Click "Launch Experiment" to auto-configure simulation state
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Experiment 1 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                  Experiment 01
                </span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-mono">
                  Spaced Repetition
                </span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-white mb-2">
                The Spaced Repetition Phenomenon
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Compares a fact learned only once (Mr. Albrecht violin teacher) versus a fact
                reinforced across 3 spaced sessions (Severe nut allergy). Fast-forwards clock to
                Day 10 so you can observe why the reinforced trace stays vivid while trivia vanishes.
              </p>
            </div>
            <button
              onClick={() => onRunExperiment('spaced-repetition')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Experiment (Advance to Day 10)</span>
            </button>
          </div>

          {/* Experiment 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                  Experiment 02
                </span>
                <span className="text-[11px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded font-mono">
                  Tip-of-the-Tongue
                </span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-white mb-2">
                Partial Memory & Tip-of-the-Tongue State
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Pushes the simulation to Day 4 to put personal memories (like your sister's puppy in
                Seattle) into the 40%–60% fading window. Experience how Mneme recalls the general gist
                with human hesitation without hallucinating false facts.
              </p>
            </div>
            <button
              onClick={() => onRunExperiment('tip-of-tongue')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Experiment (Advance to Day 4)</span>
            </button>
          </div>

          {/* Experiment 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-rose-400 font-semibold uppercase">
                  Experiment 03
                </span>
                <span className="text-[11px] text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded font-mono">
                  Savings Effect
                </span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-white mb-2">
                The Savings Effect (Relearning Forgotten Info)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Advances to Day 25 until low-stability memories are completely forgotten (&lt; 15%).
                When you re-teach the forgotten fact in chat, witness the cognitive savings effect:
                latent pathways reactivate with 3x higher stability!
              </p>
            </div>
            <button
              onClick={() => onRunExperiment('savings-effect')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Experiment (Advance to Day 25)</span>
            </button>
          </div>

          {/* Experiment 4 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-purple-400 font-semibold uppercase">
                  Experiment 04
                </span>
                <span className="text-[11px] text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded font-mono">
                  Salience Shield
                </span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-white mb-2">
                Emotional Salience & Evolutionary Prioritization
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Examines how high emotional salience (critical allergies or health safeguards) resists
                decay 1.35x longer than neutral details, mirroring how the human amygdala modulates
                hippocampal memory consolidation.
              </p>
            </div>
            <button
              onClick={() => onRunExperiment('salience-shield')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Experiment (Advance to Day 7)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cognitive Parameter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="font-serif text-lg font-bold text-white">
              Mathematical Cognitive Parameters
            </h2>
          </div>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Biological Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Decay Rate Multiplier */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Decay Rate Multiplier (k)</span>
              <span className="font-mono text-indigo-400 font-bold tabular-nums">
                {config.decayRateMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.decayRateMultiplier}
              onChange={(e) =>
                onUpdateConfig({ ...config, decayRateMultiplier: parseFloat(e.target.value) })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Higher values cause memories to fade faster; lower values model eidetic / photographic retention.
            </p>
          </div>

          {/* Relearning Boost Factor */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Relearning Boost Factor (α)</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {config.relearningBoostFactor.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="1.4"
              max="3.5"
              step="0.1"
              value={config.relearningBoostFactor}
              onChange={(e) =>
                onUpdateConfig({ ...config, relearningBoostFactor: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Multiplier applied to stability S when a memory is reviewed or retrieved in conversation.
            </p>
          </div>

          {/* Emotional Resistance Factor */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Emotional Shield Multiplier</span>
              <span className="font-mono text-purple-400 font-bold tabular-nums">
                {config.emotionalResistanceFactor.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={config.emotionalResistanceFactor}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  emotionalResistanceFactor: parseFloat(e.target.value),
                })
              }
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Protective buffer that slows decay for high-salience emotional and critical facts.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Reference Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Why Biological Memory Decay Matters in Artificial Intelligence</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-white text-sm">1. Natural Relational Rhythm</h3>
            <p>
              Human relationships thrive on the cadence of remembering and catching up. An AI that
              remembers mundane pizza toppings from 4 years ago feels eerie and mechanical; an AI
              that remembers what you reinforced yesterday feels authentically present.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-white text-sm">2. Preventing Context Clutter</h3>
            <p>
              In conventional LLMs, every past turn stays in context forever, causing retrieval dilution,
              higher latency, and confusion over outdated habits. Human forgetting naturally prunes
              irrelevant synaptic traces.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-white text-sm">3. The Power of Re-Learning</h3>
            <p>
              When a user re-explains or updates a preference, the savings effect allows the AI to
              consolidate the new understanding faster than treating it as a conflicting contradiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
