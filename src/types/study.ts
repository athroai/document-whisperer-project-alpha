
import type { ConfidenceLevel, ConfidenceLabel } from './confidence';

export interface PreferredStudySlot {
  id: string;
  user_id: string;
  day_of_week: number;
  slot_count: number;
  slot_duration_minutes: number;
  preferred_start_hour: number;
  subject: string;
  created_at?: string;
}

export interface StudyPlanGenerationResult {
  isGenerating: boolean;
  isGenerationComplete: boolean;
  studyPlan: any[];
  calendarEvents: any[];
  error?: string;
  authVerified: boolean;
  generationProgress: number;
}

// Re-export confidence types for backwards compatibility
export type { ConfidenceLevel, ConfidenceLabel };
