import { FeedbackSummary } from './feedback';

export interface AthroMessage {
  id: string;
  senderId: 'user' | 'ai';
  content: string;
  timestamp: string;
  attachments?: AttachmentType[];
  isTyping?: boolean;
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

// Re-export the FeedbackSummary type
export type { FeedbackSummary };
