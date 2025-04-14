
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
  id: string;
  questionId: string;
  answer: string;
  translation?: string;
  workingSteps?: string[];
  markScheme?: string;
  marks?: number;
  latexNotation?: string;
  grammarExplanation?: string;
  culturalNote?: string;
  grade?: string;
  text?: string; // For backward compatibility
}

export interface PastPaper {
  id: string;
  subject: string;
  unit?: string;
  title?: string;
  examBoard?: string;
  year: number;
  season?: string;
  questions?: {
    id: string;
    topic: string;
    subtopic: string;
    text: string;
    marks: number;
    difficulty: string;
  }[];
  difficulty?: string;
  topics?: string[];
  // These fields are kept for backward compatibility
  question?: string;
  markScheme?: string;
  board?: string;
}
