
export type AthroSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography' | 'Languages' | 'Religious Education' | 'Welsh' | 'French' | 'German' | 'Spanish';

export type ExamBoard = 'WJEC' | 'AQA' | 'OCR' | 'Edexcel' | 'Cambridge' | 'CCEA';

export interface AthroCharacter {
  id: string;
  name?: string;
  subject: AthroSubject;
  avatar?: string;
  avatarUrl?: string; // For backwards compatibility
  description?: string;
  shortDescription?: string; // For backwards compatibility 
  greeting?: string;
  imageUrl?: string; // For backwards compatibility
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: string[];
  topics?: string[];
  examBoards?: ExamBoard[];
}

export interface AthroTheme {
  primary: string;
  secondary: string;
  primaryHex: string;
  secondaryHex: string;
}

export interface AthroMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  senderId?: string;
  citations?: any[];
}

export interface PastPaper {
  id: string;
  examBoard: ExamBoard;
  subject: AthroSubject;
  year: number;
  season: 'Summer' | 'Winter' | 'Autumn';
  fileUrl: string;
  markSchemeUrl?: string;
  unit?: string;
  title?: string;
  questions?: any[];
}

export interface ModelAnswer {
  id: string;
  question: string; // Note: This is the expected field, not questionId
  answer: string;
  examBoard: ExamBoard;
  grade: 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';
  marks: number;
  totalMarks?: number;
  workingSteps?: string[];
  markScheme?: string;
  latexNotation?: string;
  translation?: string;
  grammarExplanation?: string;
  culturalNote?: string;
}

// Import and re-export FeedbackSummary from feedback.ts to maintain compatibility
import { FeedbackSummary as FeedbackSummaryType } from './feedback';
export type FeedbackSummary = FeedbackSummaryType;

export interface AthroLanguage {
  code: string;
  name: string;
  nativeName: string;
  supported: boolean;
}
