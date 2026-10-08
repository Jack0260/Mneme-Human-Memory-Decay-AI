import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { CognitiveMemory, CognitiveConfig } from './src/types/memory';
import { calculateRetention, getMemoryState, DEFAULT_COGNITIVE_CONFIG } from './src/utils/cognitiveModel';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client with aistudio-build telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatRequestBody {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  memories: CognitiveMemory[];
  simulatedTimeHours: number;
  config?: CognitiveConfig;
  sessionNumber: number;
}

// Fallback cognitive response generator for offline or key-less scenarios
function generateLocalCognitiveResponse(
  message: string,
  memoriesWithRetention: Array<{ memory: CognitiveMemory; retention: number; state: string }>,
  timeHours: number,
  sessionNumber: number
) {
  const lowerMsg = message.toLowerCase();
  
  // Look for memory topics mentioned in the query
  const relevantMemories = memoriesWithRetention.filter(item => {
    const fLower = item.memory.fact.toLowerCase();
    const words = item.memory.tags.concat(fLower.split(/[\s,.;]+/)).filter(w => w.length > 3);
    return words.some(w => lowerMsg.includes(w.toLowerCase()));
  });

  const relearnedMemoryIds: string[] = [];
  const cognitiveNotes: string[] = [];

  // Check if user is reminding or asking about specific items
  let reply = '';
  let standardAiReply = '';

  if (relevantMemories.length > 0) {
    const target = relevantMemories[0];
    const { memory, retention, state } = target;

    if (state === 'vivid') {
      reply = `I remember that clearly! Regarding your ${memory.category} detail: ${memory.fact}. How is everything going with that currently?`;
      standardAiReply = `As recorded in our prior session notes: "${memory.fact}". Proceeding with strict recall.`;
      cognitiveNotes.push(`Memory '${memory.id}' recalled vividly (${(retention * 100).toFixed(0)}% retention). Synaptic trace is strong.`);
      relearnedMemoryIds.push(memory.id);
    } else if (state === 'fading') {
      reply = `Wait, that sounds familiar... I recall you mentioned something related to that—was it about ${memory.tags.slice(0, 2).join(' or ')}? The exact specifics feel a little hazy right now, but I know it mattered to you. Did I get the gist right?`;
      standardAiReply = `Exact match retrieved: "${memory.fact}". No degradation detected in standard system.`;
      cognitiveNotes.push(`Memory '${memory.id}' experienced partial retrieval degradation (${(retention * 100).toFixed(0)}% retention). Demonstrating natural tip-of-the-tongue phenomenon.`);
      relearnedMemoryIds.push(memory.id);
    } else if (state === 'faint') {
      reply = `That feels vaguely familiar, almost like deja vu, but I honestly can't piece together the details anymore. Could you refresh my memory on that?`;
      standardAiReply = `Fact retrieved from permanent database: "${memory.fact}".`;
      cognitiveNotes.push(`Memory '${memory.id}' is near extinction (${(retention * 100).toFixed(0)}% retention). Subconscious trace detected, awaiting user relearning cue.`);
      // If user provided the detail in their message, mark relearned
      if (lowerMsg.length > 20) {
        relearnedMemoryIds.push(memory.id);
      }
    } else {
      // Forgotten
      reply = `I don't think you've told me about that before! Tell me more—I'd love to learn about it.`;
      standardAiReply = `Record ID ${memory.id} exists in persistent store: "${memory.fact}". Standard AI retains all user data indefinitely.`;
      cognitiveNotes.push(`Memory '${memory.id}' has fully decayed below retrieval threshold (${(retention * 100).toFixed(0)}%). Responding as novel stimulus.`);
      if (lowerMsg.length > 20) {
        relearnedMemoryIds.push(memory.id);
        cognitiveNotes.push(`Savings effect active: Re-encountering forgotten memory '${memory.id}' primes rapid relearning.`);
      }
    }
  } else {
    // General conversational response reflecting session context
    reply = `Good to connect with you in Session ${sessionNumber}! At this point in our journey (${(timeHours / 24).toFixed(1)} days elapsed), my working memory adapts to our pace. What's on your mind today?`;
    standardAiReply = `Session ${sessionNumber} initialized. All previous conversational tokens retained in persistent context memory. Ready for input.`;
    cognitiveNotes.push(`General query processed. Memory decay baseline active at ${(timeHours / 24).toFixed(1)} elapsed days.`);
  }

  // Detect potential new memories
  const newMemories: Array<{ fact: string; category: string; emotionalSalience: number; tags: string[] }> = [];
  if (lowerMsg.includes('i am') || lowerMsg.includes('my favorite') || lowerMsg.includes('i love') || lowerMsg.includes('i work on')) {
    newMemories.push({
      fact: message.replace(/^(hey|hi|hello|by the way),?\s*/i, ''),
      category: lowerMsg.includes('work') ? 'work' : lowerMsg.includes('favorite') ? 'preference' : 'personal',
      emotionalSalience: 1.2,
      tags: ['chat-extracted'],
    });
    cognitiveNotes.push('Detected new personal attribute during conversation. Forming new synaptic trace.');
  }

  return {
    reply,
    standardAiReply,
    cognitiveNotes: cognitiveNotes.join(' '),
    relearnedMemoryIds,
    newMemories,
  };
}

// POST /api/chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      conversationHistory = [],
      memories = [],
      simulatedTimeHours = 0,
      config = DEFAULT_COGNITIVE_CONFIG,
      sessionNumber = 1,
    } = req.body as ChatRequestBody;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Calculate live retention and state for all memories
    const memoriesWithRetention = memories.map((mem) => {
      const retention = calculateRetention(mem, simulatedTimeHours, config);
      const state = getMemoryState(retention, config);
      return { memory: mem, retention, state };
    });

    // 2. Prepare cognitive memory prompt instructions
    const memoryTracesDescription = memoriesWithRetention
      .map((item, idx) => {
        const pct = (item.retention * 100).toFixed(0);
        const daysAgo = ((simulatedTimeHours - item.memory.lastReviewedAtHours) / 24).toFixed(1);
        return `[Trace #${idx + 1}] ID: "${item.memory.id}" | Fact: "${item.memory.fact}" | Category: ${item.memory.category} | State: ${item.state.toUpperCase()} (${pct}% retention, last reinforced ${daysAgo} days ago, reinforcement count: ${item.memory.reinforcementCount})`;
      })
      .join('\n');

    const systemInstruction = `You are "Mneme" (named after the Greek muse of memory), an AI assistant designed with a biological cognitive memory architecture that deliberately mimics human memory decay, retention half-lives, and spaced relearning across sessions.

CURRENT SIMULATION STATE:
- Session Number: ${sessionNumber}
- Total Elapsed Simulated Time: ${simulatedTimeHours} hours (${(simulatedTimeHours / 24).toFixed(1)} days)
- Forgetting Curve Multiplier: ${config.decayRateMultiplier}x

YOUR COGNITIVE MEMORY TRACES:
${memoryTracesDescription || 'No prior memories established.'}

STRICT COGNITIVE RULES:
1. VIVID (retention >= 70%): You remember this fact clearly and effortlessly, just like a human whose memory was recently refreshed or strongly reinforced. Speak about it naturally and accurately.
2. FADING (retention 40% - 69%): You suffer from natural "tip-of-the-tongue" or partial memory decay. You remember the general gist, but specific details (names, dates, exact numbers) are slightly blurred or hesitant (e.g., "I know you mentioned your sister's dog... Buster or something like that, right?"). DO NOT state it with robotic 100% precision!
3. FAINT (retention 15% - 39%): The memory trace is near extinction. You DO NOT proactively remember the details. If asked directly, you feel a faint, intuitive deja-vu ("That sounds vaguely familiar, but the details are escaping me... Could you remind me?").
4. FORGOTTEN (retention < 15%): The synaptic trace has completely decayed. You have NO conscious recall of this information! If asked about it, you honestly treat it as new information. BUT if the user reminds or re-teaches you, you show the "Savings Effect"—eagerly re-learning it with gratitude.
5. RELEARNING: Whenever a user reminds you, corrects you, or reinforces any fading/faint/forgotten memory trace in this conversation, mark that memory ID as relearned so your stability can increase via spaced repetition!
6. NEW MEMORIES: If the user shares new personal details, preferences, or important goals, extract them so we can form a new synaptic trace.

You MUST respond in valid JSON matching this schema:
{
  "reply": "Your conversational response as Mneme, adhering strictly to your cognitive memory retention states",
  "standardAiReply": "How a conventional rigid AI (which stores everything indefinitely with 0% decay, no human vulnerability, and robotic perfection) would answer the exact same prompt",
  "cognitiveNotes": "A brief 1-2 sentence cognitive science explanation of what memory phenomena occurred in this turn (e.g., 'Tip-of-the-tongue degradation on Sister's pet trace; relearning triggered on macadamia allergy')",
  "relearnedMemoryIds": ["list of memory IDs that were reinforced or reminded in this exchange"],
  "newMemories": [
    {
      "fact": "Clear factual statement",
      "category": "personal | preference | work | trivia | emotional",
      "emotionalSalience": 1.0 to 2.0,
      "tags": ["relevant", "keywords"]
    }
  ]
}`;

    // If Gemini API key is available, call Gemini 3.8 Flash
    if (process.env.GEMINI_API_KEY) {
      try {
        const contentsPayload = [
          ...conversationHistory.slice(-8).map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsPayload,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const rawText = response.text?.trim() || '';
        try {
          const parsed = JSON.parse(rawText);
          return res.json({
            reply: parsed.reply || "I'm listening closely.",
            standardAiReply: parsed.standardAiReply || 'Standard retrieval completed.',
            cognitiveNotes: parsed.cognitiveNotes || 'Cognitive state processed.',
            relearnedMemoryIds: parsed.relearnedMemoryIds || [],
            newMemories: parsed.newMemories || [],
          });
        } catch {
          // If JSON parse failed, clean and fallback
          const cleanedText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          const parsed = JSON.parse(cleanedText);
          return res.json(parsed);
        }
      } catch (geminiError: unknown) {
        console.warn('Gemini API call failed or encountered error, falling back to local cognitive simulator:', geminiError);
        const fallback = generateLocalCognitiveResponse(
          message,
          memoriesWithRetention,
          simulatedTimeHours,
          sessionNumber
        );
        return res.json(fallback);
      }
    } else {
      // Local fallback simulator
      const fallback = generateLocalCognitiveResponse(
        message,
        memoriesWithRetention,
        simulatedTimeHours,
        sessionNumber
      );
      return res.json(fallback);
    }
  } catch (err: unknown) {
    console.error('Server error handling chat:', err);
    return res.status(500).json({ error: 'Internal cognitive engine error' });
  }
});

// Mount Vite in development or serve static assets in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Mneme Cognitive AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
