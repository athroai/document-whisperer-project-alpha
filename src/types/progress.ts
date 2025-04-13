
export interface ScoreHistoryEntry {
  date: string;
  score: number;
}

export interface SubjectProgress {
  subject: string;
  completionRate: number;
  averageScore: number;
  recentActivity: string;
  scoreHistory: ScoreHistoryEntry[];
  assignmentsCompleted: number;
  assignmentsIncomplete: number;
  strengthAreas?: string[];
  weaknessAreas?: string[];
  studyTimeMinutes?: number;
}

export interface StudentProgress {
  userId: string;
  subjects: SubjectProgress[];
  lastUpdated: string;
}
