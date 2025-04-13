
export interface HistoryEntry {
  id: string;
  type: 'goal' | 'assignment' | 'quiz' | 'session';
  subject: string;
  topic?: string;
  dateCompleted: string;
  score?: number;
  feedback?: string;
  encouragement?: string;
  activityName?: string;
  activityId?: string;
}
