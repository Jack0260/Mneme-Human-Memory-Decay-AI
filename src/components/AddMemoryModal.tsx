import React, { useState } from 'react';
import { X, Plus, Brain } from 'lucide-react';
import { CognitiveMemory, MemoryCategory } from '../types/memory';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (memory: Omit<CognitiveMemory, 'id' | 'currentRetention' | 'state'>) => void;
  currentSimulatedTimeHours: number;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onAddMemory,
  currentSimulatedTimeHours,
}) => {
  const [fact, setFact] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('personal');
  const [stabilityHours, setStabilityHours] = useState(48);
  const [emotionalSalience, setEmotionalSalience] = useState(1.2);
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fact.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onAddMemory({
      fact: fact.trim(),
      category,
      stability: stabilityHours,
      emotionalSalience,
      initialStrength: 1.0,
      firstLearnedAtHours: currentSimulatedTimeHours,
      lastReviewedAtHours: currentSimulatedTimeHours,
      reinforcementCount: 1,
      accessCount: 1,
      tags: tags.length > 0 ? tags : ['custom-memory'],
      relearningHistory: [],
    });

    onClose();
    setFact('');
    setTagInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2 className="font-serif text-lg font-bold text-white">
              Seed New Cognitive Trace
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Factual Memory Statement:
            </label>
            <textarea
              rows={3}
              required
              value={fact}
              onChange={(e) => setFact(e.target.value)}
              placeholder="e.g. User is training for a marathon in Chicago this October..."
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="personal">Personal</option>
                <option value="preference">Preference</option>
                <option value="work">Work</option>
                <option value="trivia">Trivia</option>
                <option value="emotional">Emotional</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Initial Stability S:
              </label>
              <select
                value={stabilityHours}
                onChange={(e) => setStabilityHours(Number(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value={12}>12h (Transient trivia)</option>
                <option value={24}>24h (1 Day baseline)</option>
                <option value={48}>48h (2 Days)</option>
                <option value={96}>96h (4 Days)</option>
                <option value={168}>168h (1 Week)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">Emotional Salience:</label>
              <span className="font-mono text-indigo-400 font-bold">{emotionalSalience}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.2"
              step="0.1"
              value={emotionalSalience}
              onChange={(e) => setEmotionalSalience(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Tags (comma separated):
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. running, sports, chicago"
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              Seed Memory Trace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
