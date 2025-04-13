// Updated Athro type definitions

export type AthroSubject = 
  | 'Mathematics' 
  | 'Science' 
  | 'English' 
  | 'Welsh' 
  | 'Languages' 
  | 'History' 
  | 'Geography' 
  | 'Religious Education';

export type AthroExamBoard = 'WJEC' | 'AQA' | 'OCR' | 'Edexcel' | 'CCEA';

// Use lowercase for actual data storage
export type ExamBoard = 'wjec' | 'aqa' | 'ocr' | 'edexcel' | 'ccea';

export type AthroLanguage = 'english' | 'welsh' | 'french' | 'spanish' | 'german';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: AthroSubject;
  avatar: string; // keep this for backward compatibility
  avatarUrl: string; // new - replace usages of 'avatar' with this
  shortDescription: string;
  fullDescription: string;
  tone: string;
  supportsMathNotation: boolean;
  supportsSpecialCharacters: boolean;
  supportedLanguages: AthroLanguage[];
  topics: string[];
  examBoards: ExamBoard[];
  description?: string; // For backward compatibility
}

export interface AthroMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: AthroAttachment[];
  markScheme?: string;
  referencedResources?: string[];
}

export interface AthroAttachment {
  id: string;
  type: 'image' | 'file' | 'audio';
  url: string;
  name: string;
  contentType?: string;
}

export interface AthroSession {
  id: string;
  studentId: string;
  subject: AthroSubject;
  messages: AthroMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface AthroContextData {
  activeCharacter: AthroCharacter | null;
  setActiveCharacter: (character: AthroCharacter) => void;
  characters: AthroCharacter[];
  currentScienceSubject?: string;
  setCurrentScienceSubject?: (subject: string) => void;
}

// This type can be used for mock data and other character-related functionality
export interface AthroConfig {
  id: string;
  name: string;
  subject: AthroSubject;
  description?: string;
  examBoards: ExamBoard[];
  avatar?: string;
  avatarUrl?: string;
  promptPersona?: string;
  feedback?: {
    style?: string;
    encouragementPhrases?: string[];
  };
  specializations?: string[];
}

// Add these types to fix import errors
export interface PastPaper {
  id: string;
  title: string;
  year: number;
  season: 'summer' | 'winter' | 'autumn';
  examBoard: ExamBoard;
  subject: string;
  tier?: 'foundation' | 'higher';
  questions: PastPaperQuestion[];
  unit?: string; // Added to match existing data
}

export interface PastPaperQuestion {
  id: string;
  topic: string;
  subtopic?: string; // Added subtopic field
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  imageUrl?: string;
  number?: number; // Added to match interface definition
}

export interface ModelAnswer {
  id: string;
  questionId: string;
  answer: string;
  workingSteps: string[];
  markScheme: string;
  latexNotation?: string;
  marks?: number;
  translation?: string;
  grammarExplanation?: string;
  culturalNote?: string;
}

export interface FeedbackSummary {
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  confidence: number;
  score: number; // Added for compatibility with feedback.ts
  feedback: string; // Added for compatibility with feedback.ts
  encouragement: string; // Added for compatibility with feedback.ts
  activityType: 'goal' | 'assignment' | 'quiz' | 'exam'; // Added for compatibility with feedback.ts
  activityId: string; // Added for compatibility with feedback.ts
  activityName: string; // Added for compatibility with feedback.ts
  subject: string; // Added for compatibility with feedback.ts
  submittedAt?: string; // Added for compatibility with feedback.ts
  teacherComments?: string; // Added for compatibility with feedback.ts
}
