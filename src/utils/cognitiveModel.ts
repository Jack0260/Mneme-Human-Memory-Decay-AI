import { CognitiveMemory, CognitiveConfig, MemoryState, RelearningEvent } from '../types/memory';

export const DEFAULT_COGNITIVE_CONFIG: CognitiveConfig = {
  decayRateMultiplier: 1.0,
  relearningBoostFactor: 2.1,
  vividThreshold: 0.70,
  fadingThreshold: 0.40,
  faintThreshold: 0.15,
  emotionalResistanceFactor: 1.35,
};

/**
 * Calculates current retention R(t) = e^(-Δt / S_eff) based on the Ebbinghaus forgetting curve
 */
export function calculateRetention(
  memory: CognitiveMemory,
  currentHours: number,
  config: CognitiveConfig = DEFAULT_COGNITIVE_CONFIG
): number {
  const deltaHours = Math.max(0, currentHours - memory.lastReviewedAtHours);
  
  // Emotional salience acts as cognitive reinforcement shield
  const emotionalBonus = 1 + (memory.emotionalSalience - 1) * config.emotionalResistanceFactor;
  const effectiveStability = (memory.stability * emotionalBonus) / Math.max(0.1, config.decayRateMultiplier);
  
  // Ebbinghaus exponential decay formula: R = e^(-t / S)
  const retention = Math.exp(-deltaHours / effectiveStability);
  return Math.min(1.0, Math.max(0.0, Number(retention.toFixed(4))));
}

/**
 * Categorizes retention score into cognitive retrieval state
 */
export function getMemoryState(
  retention: number,
  config: CognitiveConfig = DEFAULT_COGNITIVE_CONFIG
): MemoryState {
  if (retention >= config.vividThreshold) return 'vivid';
  if (retention >= config.fadingThreshold) return 'fading';
  if (retention >= config.faintThreshold) return 'faint';
  return 'forgotten';
}

/**
 * Calculates the memory half-life in hours: t_1/2 = S * ln(2)
 */
export function getHalfLifeHours(
  memory: CognitiveMemory,
  config: CognitiveConfig = DEFAULT_COGNITIVE_CONFIG
): number {
  const emotionalBonus = 1 + (memory.emotionalSalience - 1) * config.emotionalResistanceFactor;
  const effectiveStability = (memory.stability * emotionalBonus) / Math.max(0.1, config.decayRateMultiplier);
  return effectiveStability * Math.LN2;
}

/**
 * Relearning / consolidation function (Bjork's Desirable Difficulty & Spaced Repetition)
 * Memory retrieved when near forgetting gets a massive stability multiplier compared to reviewing fresh memory.
 */
export function reinforceMemory(
  memory: CognitiveMemory,
  currentHours: number,
  config: CognitiveConfig = DEFAULT_COGNITIVE_CONFIG,
  note = 'Conversational reinforcement'
): CognitiveMemory {
  const currentR = calculateRetention(memory, currentHours, config);
  
  // Desirable difficulty: lower retention at retrieval moment yields higher consolidation gain
  const difficultyMultiplier = 1.0 + 0.6 * (1.0 - currentR);
  const stabilityMultiplier = config.relearningBoostFactor * difficultyMultiplier;
  
  const newStability = Number((memory.stability * stabilityMultiplier).toFixed(2));
  
  const event: RelearningEvent = {
    timeHours: currentHours,
    retentionBefore: currentR,
    stabilityAfter: newStability,
    note,
  };

  return {
    ...memory,
    stability: newStability,
    lastReviewedAtHours: currentHours,
    reinforcementCount: memory.reinforcementCount + 1,
    accessCount: memory.accessCount + 1,
    relearningHistory: [...memory.relearningHistory, event],
    currentRetention: 1.0,
    state: 'vivid',
  };
}

/**
 * Hydrates all memories with their live calculated retention and state
 */
export function hydrateMemories(
  memories: CognitiveMemory[],
  currentHours: number,
  config: CognitiveConfig = DEFAULT_COGNITIVE_CONFIG
): CognitiveMemory[] {
  return memories.map((mem) => {
    const retention = calculateRetention(mem, currentHours, config);
    const state = getMemoryState(retention, config);
    return {
      ...mem,
      currentRetention: retention,
      state,
    };
  });
}

/**
 * Generates an SVG path for the Ebbinghaus curve of a given memory over a time span
 */
export function generateDecayCurvePoints(
  memory: CognitiveMemory,
  maxHours: number,
  steps = 50,
  config: CognitiveConfig = DEFAULT_COGNITIVE_CONFIG
): Array<{ t: number; r: number }> {
  const points: Array<{ t: number; r: number }> = [];
  const start = memory.lastReviewedAtHours;
  const duration = Math.max(maxHours, start + 72);
  const stepSize = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const t = i * stepSize;
    if (t < start) {
      // Prior to this reinforcement, showed prior state or 0
      points.push({ t, r: 0 });
    } else {
      const delta = t - start;
      const emotionalBonus = 1 + (memory.emotionalSalience - 1) * config.emotionalResistanceFactor;
      const effS = (memory.stability * emotionalBonus) / Math.max(0.1, config.decayRateMultiplier);
      const r = Math.exp(-delta / effS);
      points.push({ t, r });
    }
  }
  return points;
}

/**
 * Format simulated hours into human readable duration or calendar point
 */
export function formatSimulatedTime(hours: number): {
  days: number;
  remainingHours: number;
  label: string;
} {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  if (days === 0) {
    return { days, remainingHours, label: `${remainingHours}h elapsed` };
  }
  return {
    days,
    remainingHours,
    label: remainingHours === 0 ? `Day ${days + 1}` : `Day ${days + 1}, +${remainingHours}h`,
  };
}

/**
 * Rich seed memories for immediate hands-on exploration
 */
export const SEED_MEMORIES: CognitiveMemory[] = [
  {
    id: 'mem-allergy',
    fact: 'Severe allergy to macadamia nuts; carries an epinephrine pen',
    category: 'personal',
    emotionalSalience: 2.0, // High survival salience
    stability: 96, // 4 days initial stability
    initialStrength: 1.0,
    firstLearnedAtHours: 0,
    lastReviewedAtHours: 0,
    reinforcementCount: 2,
    accessCount: 3,
    tags: ['health', 'dietary', 'critical'],
    relearningHistory: [
      {
        timeHours: 0,
        retentionBefore: 0.8,
        stabilityAfter: 96,
        note: 'Reinforced in Session 1 during dinner discussion',
      },
    ],
  },
  {
    id: 'mem-sister-dog',
    fact: "Sister lives in Seattle and adopted a golden retriever puppy named Barnaby",
    category: 'personal',
    emotionalSalience: 1.2,
    stability: 36, // 1.5 days initial stability
    initialStrength: 1.0,
    firstLearnedAtHours: 0,
    lastReviewedAtHours: 0,
    reinforcementCount: 1,
    accessCount: 1,
    tags: ['family', 'pets', 'seattle'],
    relearningHistory: [],
  },
  {
    id: 'mem-coffee',
    fact: 'Prefers light roast Ethiopian pour-over with oat milk, no sugar',
    category: 'preference',
    emotionalSalience: 1.1,
    stability: 28, // ~1.2 days
    initialStrength: 1.0,
    firstLearnedAtHours: 0,
    lastReviewedAtHours: 0,
    reinforcementCount: 1,
    accessCount: 1,
    tags: ['habits', 'coffee', 'morning'],
    relearningHistory: [],
  },
  {
    id: 'mem-violin-teacher',
    fact: 'Childhood violin teacher was named Mr. Albrecht; studied Suzuki method for 6 years',
    category: 'trivia',
    emotionalSalience: 1.0,
    stability: 20, // less than a day
    initialStrength: 1.0,
    firstLearnedAtHours: 0,
    lastReviewedAtHours: 0,
    reinforcementCount: 1,
    accessCount: 1,
    tags: ['childhood', 'music', 'trivia'],
    relearningHistory: [],
  },
  {
    id: 'mem-project-deadline',
    fact: 'Launching the Q3 robotics firmware release on Thursday morning',
    category: 'work',
    emotionalSalience: 1.5,
    stability: 48,
    initialStrength: 1.0,
    firstLearnedAtHours: 0,
    lastReviewedAtHours: 0,
    reinforcementCount: 1,
    accessCount: 2,
    tags: ['work', 'firmware', 'deadlines'],
    relearningHistory: [],
  },
];
