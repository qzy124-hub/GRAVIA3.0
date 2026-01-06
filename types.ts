export enum MoodType {
  JOY = 'Joy',
  TRUST = 'Trust',
  FEAR = 'Fear',
  SURPRISE = 'Surprise',
  SADNESS = 'Sadness',
  DISGUST = 'Disgust',
  ANGER = 'Anger',
  ANTICIPATION = 'Anticipation'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface VisualAttributes {
  primaryColor: string;
  secondaryColor: string;
  shape: 'smooth' | 'spiky' | 'distorted' | 'cloud';
  roughness: number; // 0 (glossy/shampoo) to 1 (matte)
  metalness: number;
  speed: number; // Rotation/Pulse speed
}

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
  moods: MoodType[]; // Changed to array for multiple emotions
  subMoods: string[];
  isPublic: boolean;
  topics: string[];
  imageUrl?: string;
  audioUrl?: string;
  visuals: VisualAttributes;
  nebulaLocation: Coordinates; // Position on the personal nebula sphere
}

export interface User {
  id: string;
  name: string;
  location: Coordinates;
  currentMoods: MoodType[]; // Changed to array
  entries: JournalEntry[];
  color: string;
  friends: string[];
}

export interface Connection {
  fromUserId: string;
  toUserId: string;
  strength: number;
  reason: string;
}

export interface AIAnalysisResult {
  moods: MoodType[];
  subMoods: string[];
  topics: string[];
  sentimentScore: number;
  visuals: VisualAttributes;
  shortSummary: string;
}