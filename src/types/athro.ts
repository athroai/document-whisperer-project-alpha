
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
  shortDescription?: string;
  avatarUrl?: string;
  topics?: string[];
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: string[];
  referencedResources?: string[];
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
  grade: string;
  text: string;
}

export interface PastPaper {
  id: string;
  question: string;
  markScheme: string;
  year: number;
  subject: string;
  board: string;
}
