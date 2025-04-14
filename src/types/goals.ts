
// Define proper types for the goals functionality

export interface StudyGoal {
  id: string;
  userId: string;
  subject: string;
  title: string;
  description: string;
  createdAt: string;
  targetDate: string;
  status: 'active' | 'completed' | 'abandoned' | 'expired';
  completionRate: number;
  aiSuggestions?: string[];
  motivation?: string;
}

export interface NewGoalData {
  subject: string;
  title: string;
  description: string;
  targetDate: string;
  motivation?: string;
}

export interface GoalUpdateData {
  subject?: string;
  title?: string;
  description?: string;
  targetDate?: string;
  status?: 'active' | 'completed' | 'abandoned' | 'expired';
  completionRate?: number;
  aiSuggestions?: string[];
  lastUpdated?: string;
}
