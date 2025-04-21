
import { ConfidenceLabel } from './confidence';

export interface StudySession {
  id: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  confidence?: ConfidenceLabel;
}

export interface StudyPlan {
  id: string;
  name: string;
  sessions: StudySession[];
  startDate: Date;
  endDate: Date;
}

export interface SlotOption {
  name: string;
  count: number;
  duration: number;
  color: string;
  icon: React.ComponentType;
}

export interface PreferredStudySlot {
  id: string;
  user_id: string;
  day_of_week: number;
  slot_count: number;
  slot_duration_minutes: number;
  preferred_start_hour: number;
  created_at?: string;
}
