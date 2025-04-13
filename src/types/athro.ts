
import { FeedbackSummary } from './feedback';

// Define missing type for attachments
export type AttachmentType = {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  name: string;
};

export interface AthroMessage {
  id: string;
  senderId: string; // Changed from 'user' | 'ai' to string to allow character IDs
  content: string;
  timestamp: string;
  attachments?: AttachmentType[];
  isTyping?: boolean;
  markScheme?: string; // Add missing property
  referencedResources?: string[]; // Add missing property
}

export type AthroLanguage = 'english' | 'welsh' | 'french' | 'german' | 'spanish';

export type AthroSubject = 
  'Mathematics' | 
  'Science' | 
  'English' | 
  'Welsh' | 
  'Languages' | 
  'History' | 
  'Geography';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: AthroSubject;
  avatarUrl: string;
  shortDescription: string;
  fullDescription: string;
  tone: string;
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: AthroLanguage[];
  topics: string[];
  examBoards: ExamBoard[];
}

export interface TopicScore {
  topic: string;
  avgScore: number;
}

export interface SubmissionOverTime {
  date: string;
  submitted: number;
}

export interface AnalyticsOverview {
  subject: string;
  set: string;
  students: number;
  avgScore: number;
  completionRate: number;
  submissionsOverTime: SubmissionOverTime[];
  topicScores: TopicScore[];
}

export interface AnalyticsSummary {
  totalStudents: number;
  totalAssignments: number;
  averageCompletionRate: number;
  averageScore: number;
}

export interface AnalyticsFilter {
  subject: string | null;
  set: string | null;
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export type SetPerformance = {
  set: string;
  avgScore: number;
  completionRate: number;
  students: number;
};

export type SubjectPerformance = {
  subject: string;
  avgScore: number;
  completionRate: number;
  students: number;
};

export type ExamBoard = 'wjec' | 'aqa' | 'ocr' | 'edexcel';

// Adding PastPaper type for the language modules
export interface PastPaper {
  id: string;
  subject: string;
  unit: string;
  title: string;
  examBoard: ExamBoard;
  year: string;
  season: string;
  questions: {
    id: string;
    topic: string;
    subtopic: string;
    text: string;
    marks: number;
    difficulty: number;
  }[];
}

// Adding ModelAnswer type for the model answer modules
export interface ModelAnswer {
  questionId: string;
  workingSteps: string[];
  markScheme: string;
  marks: number;
  latexNotation: string;
  translation?: string;
  grammarExplanation?: string;
  culturalNote?: string;
}

// Re-export the FeedbackSummary type
export type { FeedbackSummary };
