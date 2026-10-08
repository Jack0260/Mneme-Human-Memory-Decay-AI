import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  History,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Flame,
  ArrowRight,
  Split,
  MessageSquare,
  Clock,
  Volume2
} from 'lucide-react';
import { ChatMessage, CognitiveMemory, MemoryState } from '../types/memory';
import { formatSimulatedTime } from '../utils/cognitiveModel';

interface ChatStageProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  memories: CognitiveMemory[];
  simulatedTimeHours: number;
  sessionNumber: number;
  onAdvanceTime: (hours: number) => void;
  onReinforceMemory: (id: string) => void;
  onSelectMemoryForDetail: (memory: CognitiveMemory) => void;
}

export const ChatStage: React.FC<ChatStageProps> = ({
  messages,
  onSendMessage,
  isLoading,
  memories,
  simulatedTimeHours,
  sessionNumber,
  onAdvanceTime,
  onReinforceMemory,
  onSelectMemoryForDetail,
}) => {
  const [inputText, setInputText] = useState('');
  const [showComparisonFor, setShowComparisonFor] = useState<Record<string, boolean>>({});
  const [expandedTraceFor, setExpandedTraceFor] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText;
    setInputText('');
    await onSendMessage(msg);
  };

  const handlePresetClick = (prompt: string) => {
    setInputText(prompt);
  };

  const toggleComparison = (id: string) => {
    setShowComparisonFor((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTrace = (id: string) => {
    setExpandedTraceFor((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStateBadge = (state: MemoryState, retention: number) => {
    const pct = (retention * 100).toFixed(0);
    switch (state) {
      case 'vivid':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Vivid Recall ({pct}%)</span>
          </span>
        );
      case 'fading':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Tip-of-Tongue / Fading ({pct}%)</span>
          </span>
        );
      case 'faint':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Faint Latent Trace ({pct}%)</span>
          </span>
        );
      case 'forgotten':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span>Extinct / Forgotten ({pct}%)</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-7.5rem)] overflow-hidden">
      {/* Left / Center Zone: Main Conversation Stage */}
      <div className="flex-1 flex flex-col bg-slate-950 border-r border-slate-800/80 overflow-hidden">
        {/* Stage Header Info Banner */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-200">
              Session {sessionNumber} Stage
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">
              T={simulatedTimeHours}h ({formatSimulatedTime(simulatedTimeHours).label})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdvanceTime(24)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              Skip +24h to observe decay →
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-400 mb-4">
                <Brain className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-white mb-2">
                Converse with a Biologically Decaying AI
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Unlike conventional AI that keeps flawless, infinite context forever, Mneme
                simulates human synaptic memory decay. As simulated time passes, memories fade into
                the tip-of-the-tongue state and eventually require re-learning.
              </p>
              <div className="w-full text-left bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Recommended Test Prompts
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handlePresetClick('What was my childhood violin teacher’s name?')}
                    className="text-left text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/40 p-2 rounded border border-indigo-900/40 transition-colors"
                  >
                    • "What was my childhood violin teacher's name?" (Test low-stability trivia recall)
                  </button>
                  <button
                    onClick={() => handlePresetClick('Can I safely eat this pastry containing macadamia nuts?')}
                    className="text-left text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/40 p-2 rounded border border-indigo-900/40 transition-colors"
                  >
                    • "Can I safely eat this pastry containing macadamia nuts?" (Test high-salience allergy memory)
                  </button>
                  <button
                    onClick={() => handlePresetClick('Remind me where my sister lives and about her pet?')}
                    className="text-left text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/40 p-2 rounded border border-indigo-900/40 transition-colors"
                  >
                    • "Remind me where my sister lives and about her pet?" (Test fading personal detail)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const showComparison = showComparisonFor[msg.id] || false;
              const showTrace = expandedTraceFor[msg.id] || false;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                    isUser ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  {/* Speaker Label */}
                  <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400 font-mono">
                    <span>{isUser ? 'You' : 'Mneme (Decay-Modeled AI)'}</span>
                    <span aria-hidden="true">·</span>
                    <span>Session {msg.sessionNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>T={msg.simulatedTimeHours}h</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Assistant Metadata & Footprints */}
                    {!isUser && msg.cognitiveStateSnapshot && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                        {/* Cognitive Note */}
                        {msg.cognitiveStateSnapshot.retrievalCognitionNote && (
                          <div className="text-xs text-indigo-300/90 font-mono flex items-start gap-1.5 bg-indigo-950/30 p-2 rounded border border-indigo-900/30">
                            <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{msg.cognitiveStateSnapshot.retrievalCognitionNote}</span>
                          </div>
                        )}

                        {/* Expandable Footprints & Conventional AI comparison */}
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                          <button
                            onClick={() => toggleTrace(msg.id)}
                            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                          >
                            <span>Cognitive Trace Details</span>
                            {showTrace ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {msg.standardAiComparison && (
                            <button
                              onClick={() => toggleComparison(msg.id)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                                showComparison
                                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                                  : 'text-slate-400 hover:text-slate-200 border-slate-800'
                              }`}
                            >
                              <Split className="w-3 h-3" />
                              <span>{showComparison ? 'Hide Contrast' : 'Compare with Standard AI'}</span>
                            </button>
                          )}
                        </div>

                        {/* Expanded Trace Breakdown */}
                        {showTrace && (
                          <div className="mt-2 bg-slate-950/90 rounded-lg p-3 border border-slate-800 text-xs space-y-2">
                            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                              Activated Synaptic Memories at Query Time:
                            </div>
                            {msg.cognitiveStateSnapshot.activeMemories.map((act) => (
                              <div
                                key={act.id}
                                className="flex items-start justify-between gap-2 p-2 bg-slate-900/60 rounded border border-slate-800/60"
                              >
                                <span className="text-slate-300 font-sans flex-1">
                                  {act.fact}
                                </span>
                                <div className="shrink-0">
                                  {getStateBadge(act.state, act.retention)}
                                </div>
                              </div>
                            ))}

                            {msg.cognitiveStateSnapshot.relearnedMemoryIds &&
                              msg.cognitiveStateSnapshot.relearnedMemoryIds.length > 0 && (
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono pt-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>
                                    Spaced Relearning Triggered: Stability boosted for {msg.cognitiveStateSnapshot.relearnedMemoryIds.length} trace(s)
                                  </span>
                                </div>
                              )}
                          </div>
                        )}

                        {/* Conventional AI Comparison Box */}
                        {showComparison && msg.standardAiComparison && (
                          <div className="mt-2 bg-slate-950 border border-slate-700/60 rounded-xl p-3 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5" />
                                Conventional AI (Zero Memory Decay)
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Indefinite Context
                              </span>
                            </div>
                            <p className="text-slate-300 italic mb-2 leading-relaxed">
                              "{msg.standardAiComparison}"
                            </p>
                            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
                              Analysis: The standard model maintains 100% eternal trivia recall with no
                              temporal awareness, leading to conversational stiffness and unrealistic cognitive dynamics.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-indigo-400 font-mono bg-slate-900/60 border border-slate-800 rounded-xl p-3 w-fit">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing query through Ebbinghaus retrieval network...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          {/* Quick preset pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 text-xs">
            <span className="text-slate-500 text-[11px] font-mono shrink-0">Test queries:</span>
            <button
              onClick={() => handlePresetClick('What kind of coffee do I like?')}
              className="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors shrink-0"
            >
              Coffee preference?
            </button>
            <button
              onClick={() => handlePresetClick('What was my violin teacher’s name?')}
              className="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors shrink-0"
            >
              Violin teacher?
            </button>
            <button
              onClick={() => handlePresetClick('Can you remind me about my nut allergy?')}
              className="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors shrink-0"
            >
              Nut allergy?
            </button>
            <button
              onClick={() => handlePresetClick('Hey, just reminding you: My violin teacher was Mr. Albrecht!')}
              className="text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/40 px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Re-teach violin teacher</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Talk with Mneme, inquire about past facts, or re-teach forgotten knowledge..."
              className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Zone: Live Synaptic Memory Sidebar */}
      <div className="w-full lg:w-80 bg-slate-900/60 border-t lg:border-t-0 border-slate-800/80 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Synaptic Traces ({memories.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Live Retention
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {memories.map((mem) => {
            const retention = mem.currentRetention ?? 1;
            const pct = (retention * 100).toFixed(0);
            const state = mem.state || 'vivid';

            return (
              <div
                key={mem.id}
                onClick={() => onSelectMemoryForDetail(mem)}
                className="bg-slate-950/80 hover:bg-slate-800/80 cursor-pointer p-3 rounded-xl border border-slate-800/80 transition-all hover:border-slate-700 group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs text-slate-200 line-clamp-2 font-medium">
                    {mem.fact}
                  </span>
                  <span className="font-mono text-xs font-semibold text-white tabular-nums shrink-0">
                    {pct}%
                  </span>
                </div>

                {/* Linear Retention Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
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

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="capitalize">{mem.category}</span>
                  <div className="flex items-center gap-2">
                    <span>{mem.reinforcementCount}x reinforced</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReinforceMemory(mem.id);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 underline"
                      title="Reinforce now (boost stability)"
                    >
                      Boost
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Fast-forward action */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="text-[11px] text-slate-400 mb-2 leading-tight">
            Fast forward time to watch these traces decay according to the Ebbinghaus curve:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAdvanceTime(24)}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition-colors text-center border border-slate-700"
            >
              +1 Day (24h)
            </button>
            <button
              onClick={() => onAdvanceTime(72)}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition-colors text-center border border-slate-700"
            >
              +3 Days (72h)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
