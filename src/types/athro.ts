
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
}

export interface AthroMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  citations?: Citation[];
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
