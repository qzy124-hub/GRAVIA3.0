import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, MoodType, User, Connection, VisualAttributes } from '../types';
import { getVisualAttributes } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeEntry = async (text: string, manualMoods?: MoodType[], manualSubMoods?: string[]): Promise<AIAnalysisResult> => {
  const modelId = 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze this journal entry: "${text}".
      
      1. Identify the top 1 to 3 emotions experienced, ordered by intensity, from this list: [Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation].
      2. If the user provided manual emotions (${manualMoods?.join(', ')}), prioritize them but feel free to add a third if strongly implied.
      3. Identify 2-3 specific sub-emotions (e.g., for Anger: 'Frustrated', 'Critical').
      4. Extract 3 key topics.
      5. Generate visual attributes for a 3D blob representing this feeling:
         - Shape: 'smooth' (positive/calm), 'spiky' (intense/negative), 'distorted' (complex/confused), or 'cloud' (soft/trust).
         - Speed: 0.1 (slow) to 3.0 (fast/erratic).
         - Roughness: 0.0 (glossy shampoo) to 1.0 (matte).
      6. Provide a short summary.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moods: { type: Type.ARRAY, items: { type: Type.STRING } },
            subMoods: { type: Type.ARRAY, items: { type: Type.STRING } },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentimentScore: { type: Type.NUMBER },
            visuals: {
              type: Type.OBJECT,
              properties: {
                shape: { type: Type.STRING },
                speed: { type: Type.NUMBER },
                roughness: { type: Type.NUMBER }
              }
            },
            shortSummary: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Fallback logic
    const moods = (manualMoods && manualMoods.length > 0) ? manualMoods : (result.moods?.map((m: string) => m as MoodType) || [MoodType.JOY]);
    const primaryMood = moods[0] || MoodType.JOY;
    const defaultVisuals = getVisualAttributes(primaryMood);

    return {
      moods: moods,
      subMoods: manualSubMoods && manualSubMoods.length > 0 ? manualSubMoods : (result.subMoods || []),
      topics: result.topics || [],
      sentimentScore: result.sentimentScore || 0.5,
      visuals: {
        ...defaultVisuals,
        shape: result.visuals?.shape || defaultVisuals.shape,
        speed: result.visuals?.speed || defaultVisuals.speed,
        roughness: result.visuals?.roughness || defaultVisuals.roughness,
      },
      shortSummary: result.shortSummary || "An emotional moment."
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    const fallbackMood = manualMoods?.[0] || MoodType.JOY;
    return {
      moods: [fallbackMood],
      subMoods: [],
      topics: ['life'],
      sentimentScore: 0.5,
      visuals: getVisualAttributes(fallbackMood),
      shortSummary: "A moment of reflection."
    };
  }
};

export const findMatches = async (
  currentUserEntry: string, 
  currentUserAnalysis: AIAnalysisResult, 
  potentialMatches: User[]
): Promise<Connection[]> => {
  const currentMoodSet = new Set(currentUserAnalysis.moods);

  // Match based on overlapping moods
  const matches = potentialMatches.map(u => {
      // Intersection of moods
      const overlap = u.currentMoods.filter(m => currentMoodSet.has(m));
      const score = overlap.length * 0.4 + Math.random() * 0.2; // Weighted by how many moods match
      return { user: u, score, overlap };
  })
  .filter(m => m.overlap.length > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 10); // Return top 10 matches

  return matches.map(m => ({
      fromUserId: 'current-user',
      toUserId: m.user.id,
      strength: 0.7 + (m.score * 0.1), // Normalize roughly
      reason: `Shared resonance: ${m.overlap.join(', ')}`
  }));
};