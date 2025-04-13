
export interface FeedbackSummary {
  score: number;
  feedback: string;
  encouragement: string;
  teacherComments?: string;
  submittedAt?: string;
  activityType: 'goal' | 'assignment' | 'quiz' | 'exam';
  activityId: string;
  activityName: string;
  subject: string;
  // Optional fields from the athro.ts FeedbackSummary
  strengths?: string[];
  improvements?: string[];
  nextSteps?: string[];
  confidence?: number;
}
