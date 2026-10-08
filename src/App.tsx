import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TimeControls } from './components/TimeControls';
import { ChatStage } from './components/ChatStage';
import { DecayVisualizer } from './components/DecayVisualizer';
import { MemoryMatrix } from './components/MemoryMatrix';
import { CognitiveLab } from './components/CognitiveLab';
import { MemoryDetailModal } from './components/MemoryDetailModal';
import { AddMemoryModal } from './components/AddMemoryModal';

import {
  CognitiveMemory,
  CognitiveConfig,
  ChatMessage,
  MemoryState,
} from './types/memory';
import {
  DEFAULT_COGNITIVE_CONFIG,
  SEED_MEMORIES,
  hydrateMemories,
  reinforceMemory,
  calculateRetention,
  getMemoryState,
} from './utils/cognitiveModel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualizer' | 'matrix' | 'lab'>('chat');
  const [simulatedTimeHours, setSimulatedTimeHours] = useState<number>(0);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [rawMemories, setRawMemories] = useState<CognitiveMemory[]>(SEED_MEMORIES);
  const [config, setConfig] = useState<CognitiveConfig>(DEFAULT_COGNITIVE_CONFIG);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [selectedMemoryForDetail, setSelectedMemoryForDetail] = useState<CognitiveMemory | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Live hydrated memories (recalculated whenever simulatedTimeHours or rawMemories or config changes)
  const hydratedMemories = useMemo(() => {
    return hydrateMemories(rawMemories, simulatedTimeHours, config);
  }, [rawMemories, simulatedTimeHours, config]);

  // Keep detail modal updated with latest hydrated state
  useEffect(() => {
    if (selectedMemoryForDetail) {
      const updated = hydratedMemories.find((m) => m.id === selectedMemoryForDetail.id);
      if (updated) setSelectedMemoryForDetail(updated);
    }
  }, [hydratedMemories, selectedMemoryForDetail]);

  // Advance time
  const handleAdvanceTime = useCallback((hours: number) => {
    setSimulatedTimeHours((prev) => prev + hours);
  }, []);

  // Set explicit time
  const handleSetTime = useCallback((hours: number) => {
    setSimulatedTimeHours(hours);
  }, []);

  // Start a new session
  const handleNewSession = useCallback(() => {
    const nextSession = sessionNumber + 1;
    setSessionNumber(nextSession);
    setSimulatedTimeHours((prev) => prev + 24); // Each session advances at least 1 day

    // Add session break marker in chat
    const sessionMarker: ChatMessage = {
      id: `session-marker-${Date.now()}`,
      sender: 'assistant',
      content: `Welcome to Session ${nextSession}! Approximately 24 hours have passed since our last conversation. Some synaptic traces have naturally decayed into lower retention thresholds, while consolidated memories remain steady. What would you like to explore today?`,
      timestamp: Date.now(),
      simulatedTimeHours: simulatedTimeHours + 24,
      sessionNumber: nextSession,
      cognitiveStateSnapshot: {
        activeMemories: hydratedMemories.map((m) => ({
          id: m.id,
          fact: m.fact,
          retention: m.currentRetention ?? 1,
          state: m.state ?? 'vivid',
        })),
        retrievalCognitionNote: `Session transition complete. Biological decay recalculated across all ${hydratedMemories.length} traces.`,
      },
    };
    setMessages((prev) => [...prev, sessionMarker]);
  }, [sessionNumber, simulatedTimeHours, hydratedMemories]);

  // Reset simulation
  const handleResetSimulation = useCallback(() => {
    setSimulatedTimeHours(0);
    setSessionNumber(1);
    setRawMemories(SEED_MEMORIES);
    setMessages([]);
    setConfig(DEFAULT_COGNITIVE_CONFIG);
  }, []);

  // Reinforce a specific memory trace
  const handleReinforceMemory = useCallback((id: string) => {
    setRawMemories((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return reinforceMemory(m, simulatedTimeHours, config, 'Manual interactive review');
        }
        return m;
      })
    );
  }, [simulatedTimeHours, config]);

  // Delete a memory
  const handleDeleteMemory = useCallback((id: string) => {
    setRawMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Add custom memory
  const handleAddMemory = useCallback(
    (newMem: Omit<CognitiveMemory, 'id' | 'currentRetention' | 'state'>) => {
      const fullMemory: CognitiveMemory = {
        ...newMem,
        id: `mem-custom-${Date.now()}`,
      };
      setRawMemories((prev) => [fullMemory, ...prev]);
    },
    []
  );

  // Send message to backend
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: Date.now(),
      simulatedTimeHours,
      sessionNumber,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.sender as 'user' | 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: historyPayload,
          memories: hydratedMemories,
          simulatedTimeHours,
          config,
          sessionNumber,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      // Handle relearned memories
      if (Array.isArray(data.relearnedMemoryIds) && data.relearnedMemoryIds.length > 0) {
        setRawMemories((prev) =>
          prev.map((mem) => {
            if (data.relearnedMemoryIds.includes(mem.id)) {
              return reinforceMemory(
                mem,
                simulatedTimeHours,
                config,
                'Relearned via conversational context'
              );
            }
            return mem;
          })
        );
      }

      // Handle new memories extracted by AI
      if (Array.isArray(data.newMemories) && data.newMemories.length > 0) {
        const newlyCreated: CognitiveMemory[] = data.newMemories.map(
          (nm: { fact: string; category?: string; emotionalSalience?: number; tags?: string[] }, i: number) => ({
            id: `mem-extracted-${Date.now()}-${i}`,
            fact: nm.fact,
            category: (nm.category || 'personal') as CognitiveMemory['category'],
            emotionalSalience: nm.emotionalSalience || 1.2,
            stability: 36,
            initialStrength: 1.0,
            firstLearnedAtHours: simulatedTimeHours,
            lastReviewedAtHours: simulatedTimeHours,
            reinforcementCount: 1,
            accessCount: 1,
            tags: nm.tags || ['extracted'],
            relearningHistory: [],
          })
        );
        setRawMemories((prev) => [...newlyCreated, ...prev]);
      }

      // Snapshot active memory states at query time
      const activeSnapshot = hydratedMemories.map((m) => ({
        id: m.id,
        fact: m.fact,
        retention: m.currentRetention ?? 1,
        state: m.state ?? 'vivid',
      }));

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: data.reply || "I'm listening closely.",
        timestamp: Date.now(),
        simulatedTimeHours,
        sessionNumber,
        standardAiComparison: data.standardAiReply,
        cognitiveStateSnapshot: {
          activeMemories: activeSnapshot,
          relearnedMemoryIds: data.relearnedMemoryIds || [],
          newMemoryIds: data.newMemories ? data.newMemories.map((_: any, i: number) => `new-${i}`) : [],
          retrievalCognitionNote: data.cognitiveNotes,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Resilient local fallback in case network hiccup occurs
      const assistantMsg: ChatMessage = {
        id: `assistant-fallback-${Date.now()}`,
        sender: 'assistant',
        content: `I'm tracking your thoughts closely. Given our elapsed time (${(simulatedTimeHours / 24).toFixed(1)} days), my biological decay algorithms are actively adjusting trace retentions.`,
        timestamp: Date.now(),
        simulatedTimeHours,
        sessionNumber,
        cognitiveStateSnapshot: {
          activeMemories: hydratedMemories.map((m) => ({
            id: m.id,
            fact: m.fact,
            retention: m.currentRetention ?? 1,
            state: m.state ?? 'vivid',
          })),
          retrievalCognitionNote: 'Local cognitive heuristic fallback executed.',
        },
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run guided experiment presets
  const handleRunExperiment = useCallback((experimentId: string) => {
    if (experimentId === 'spaced-repetition') {
      // Day 10 (240h).
      // Nut allergy reinforced 3 times (stability ~250h); violin teacher 1 time (stability 20h).
      setSimulatedTimeHours(240);
      setSessionNumber(4);
      setRawMemories((prev) =>
        prev.map((m) => {
          if (m.id === 'mem-allergy') {
            return {
              ...m,
              stability: 280,
              lastReviewedAtHours: 192, // Day 8
              reinforcementCount: 3,
            };
          }
          if (m.id === 'mem-violin-teacher') {
            return {
              ...m,
              stability: 20,
              lastReviewedAtHours: 0,
              reinforcementCount: 1,
            };
          }
          return m;
        })
      );
      setActiveTab('chat');
    } else if (experimentId === 'tip-of-tongue') {
      // Day 4 (96h).
      // Sister puppy memory is at ~45% (fading window).
      setSimulatedTimeHours(96);
      setSessionNumber(2);
      setActiveTab('chat');
    } else if (experimentId === 'savings-effect') {
      // Day 25 (600h).
      // Violin teacher is extinct (< 15%). Re-learning will trigger savings effect.
      setSimulatedTimeHours(600);
      setSessionNumber(5);
      setActiveTab('chat');
    } else if (experimentId === 'salience-shield') {
      // Day 7 (168h).
      // Demonstrates allergy (high salience) remaining vivid while neutral items decay.
      setSimulatedTimeHours(168);
      setSessionNumber(3);
      setActiveTab('visualizer');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased">
      {/* 3-Zone Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionNumber={sessionNumber}
        simulatedTimeHours={simulatedTimeHours}
        onAdvanceTime={handleAdvanceTime}
        onNewSession={handleNewSession}
        onResetSimulation={handleResetSimulation}
      />

      {/* Global Simulation Time & Retention Status Ribbon */}
      <TimeControls
        simulatedTimeHours={simulatedTimeHours}
        sessionNumber={sessionNumber}
        onSetTime={handleSetTime}
        onAdvanceTime={handleAdvanceTime}
        memories={hydratedMemories}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'chat' && (
          <ChatStage
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            memories={hydratedMemories}
            simulatedTimeHours={simulatedTimeHours}
            sessionNumber={sessionNumber}
            onAdvanceTime={handleAdvanceTime}
            onReinforceMemory={handleReinforceMemory}
            onSelectMemoryForDetail={setSelectedMemoryForDetail}
          />
        )}

        {activeTab === 'visualizer' && (
          <DecayVisualizer
            memories={hydratedMemories}
            simulatedTimeHours={simulatedTimeHours}
            config={config}
            onAdvanceTime={handleAdvanceTime}
            onSetTime={handleSetTime}
            onReinforceMemory={handleReinforceMemory}
          />
        )}

        {activeTab === 'matrix' && (
          <MemoryMatrix
            memories={hydratedMemories}
            simulatedTimeHours={simulatedTimeHours}
            config={config}
            onReinforceMemory={handleReinforceMemory}
            onDeleteMemory={handleDeleteMemory}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectMemoryForDetail={setSelectedMemoryForDetail}
          />
        )}

        {activeTab === 'lab' && (
          <CognitiveLab
            config={config}
            onUpdateConfig={setConfig}
            onRunExperiment={handleRunExperiment}
          />
        )}
      </main>

      {/* Modals */}
      <MemoryDetailModal
        memory={selectedMemoryForDetail}
        simulatedTimeHours={simulatedTimeHours}
        config={config}
        onClose={() => setSelectedMemoryForDetail(null)}
        onReinforce={handleReinforceMemory}
      />

      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMemory={handleAddMemory}
        currentSimulatedTimeHours={simulatedTimeHours}
      />
    </div>
  );
}
