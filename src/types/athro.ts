
import { Citation } from './citations';

export type ExamBoard = 'wjec' | 'aqa' | 'ocr' | 'edexcel';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: string;
  examBoards: ExamBoard[];
  imageUrl?: string;
  bio?: string;
  description?: string;
  fullDescription?: string;
  shortDescription?: string;
  avatarUrl?: string;
  topics?: string[];
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: string[];
  referencedResources?: string[];
  avatar?: string; // For backward compatibility
  tone?: string;
}

export interface AthroMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  citations?: Citation[];
  referencedResources?: string[];
  markScheme?: string;
}

export interface FeedbackSummary {
  score: number;
  feedback: string;
  encouragement: string;
  activityType: 'goal' | 'assignment' | 'quiz' | 'exam';
  activityId: string;
  activityName: string;
  submittedAt: string;
  subject: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  teacherComments?: string;
  confidence: number;
}

export type AthroSubject = 
  | 'Mathematics' 
  | 'Science' 
  | 'English' 
  | 'Languages' 
  | 'Welsh' 
  | 'History' 
  | 'Geography' 
  | 'Religious Education';

export interface AthroLanguage {
  code: string;
  name: string;
  flagEmoji?: string;
}

export interface ModelAnswer {
  id?: string;       // Making id optional to fix existing code
  questionId?: string;
  grade: string;
  text?: string;
  answer?: string;   // Adding answer as an alternative to text
  workingSteps?: string[];
  markScheme?: string;
  marks?: number;
  latexNotation?: string;
}

export interface PastPaper {
  id: string;
  question: string;
  markScheme: string;
  year: number;
  subject: string;
  board: string;
  title?: string;    // Making title optional to fix existing code
  unit?: string;     // Making unit optional to fix existing code
  examBoard?: string;
  questions?: any[];
  difficulty?: string;
  topics?: string[];
  season?: 'Summer' | 'Winter' | 'Autumn' | 'Spring' | string;
}
