
export interface StudentSession {
  id: string;
  studentId: string;
  studentName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  class: string;
  subject: string;
  activityType: 'Quiz' | 'Study Session' | 'AthroChat' | 'Practice';
  activityName: string;
  startTime: string; // ISO string
  lastActiveTime: string; // ISO string
  sessionDurationSeconds: number;
  confidence: number; // 1-10
  engagementStatus: 'active' | 'semi-active' | 'idle';
  recentActions?: SessionAction[];
}

export interface SessionAction {
  timestamp: string;
  actionType: 'question' | 'answer' | 'navigation' | 'quiz-submission' | 'message';
  content: string;
}

export interface SessionFilters {
  subject?: string | null;
  activityType?: string | null;
  engagementStatus?: 'active' | 'semi-active' | 'idle' | null;
  classId?: string | null;
}

export interface ActivitySummary {
  subject: string;
  activeStudents: number;
  averageConfidence: number;
  averageSessionTime: number;
}
