
export interface StudyGoal {
  id: string;
  userId: string;
  subject: string;
  title: string;
  description: string;
  createdAt: string;
  targetDate: string;
  status: 'active' | 'completed' | 'expired';
  completionRate?: number; // AI-estimated progress percentage
  aiSuggestions?: string[]; // Generated support tips
}

export type GoalStatus = 'active' | 'completed' | 'expired';

// Used for creating new goals
export interface NewGoalData {
  subject: string;
  title: string;
  description: string;
  targetDate: string;
  motivation?: string;
}

// Used for managing goals
export interface GoalUpdateData {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: GoalStatus;
  completionRate?: number;
  aiSuggestions?: string[];
}
