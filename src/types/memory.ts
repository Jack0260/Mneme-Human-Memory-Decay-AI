export type MemoryCategory = 'personal' | 'preference' | 'work' | 'trivia' | 'emotional';

export type MemoryState = 'vivid' | 'fading' | 'faint' | 'forgotten';

export interface RelearningEvent {
  timeHours: number;
  retentionBefore: number;
  stabilityAfter: number;
  note: string;
}

export interface CognitiveMemory {
  id: string;
  fact: string;
  category: MemoryCategory;
  emotionalSalience: number; // 1.0 (neutral) to 2.2 (high emotional weight)
  stability: number; // Stability S in simulated hours
  initialStrength: number; // 1.0
  firstLearnedAtHours: number; // Simulated time hours
  lastReviewedAtHours: number; // Simulated time hours
  reinforcementCount: number; // Number of times learned/reinforced
  accessCount: number;
  relearningHistory: RelearningEvent[];
  tags: string[];
  // Calculated dynamically
  currentRetention?: number; // 0.0 to 1.0
  state?: MemoryState;
}

export interface CognitiveConfig {
  decayRateMultiplier: number; // 1.0 = normal human, 0.5 = slow decay, 2.0 = fast decay
  relearningBoostFactor: number; // ~2.2x stability multiplier upon recall
  vividThreshold: number; // >= 0.70
  fadingThreshold: number; // >= 0.40
  faintThreshold: number; // >= 0.15
  emotionalResistanceFactor: number; // 1.3x resistance to decay
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  simulatedTimeHours: number;
  sessionNumber: number;
  // Metadata for AI response:
  cognitiveStateSnapshot?: {
    activeMemories: Array<{
      id: string;
      fact: string;
      retention: number;
      state: MemoryState;
    }>;
    relearnedMemoryIds?: string[];
    newMemoryIds?: string[];
    retrievalCognitionNote?: string;
  };
  standardAiComparison?: string;
}

export interface SimulationSession {
  sessionNumber: number;
  startHours: number;
  name: string;
  summary?: string;
}
