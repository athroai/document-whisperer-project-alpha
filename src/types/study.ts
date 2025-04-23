
/**
 * Study-related type definitions
 */

// Import necessary types
import { ConfidenceLevel, ConfidenceLabel } from './confidence';

// Subject types
export interface SubjectPreference {
  subject: string;
  confidence: ConfidenceLabel | ConfidenceLevel;
  priority?: number;
}

export type UserSubject = SubjectPreference;

// Study schedule types
export interface Availability {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

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

export interface StudyPlanSession {
  id: string;
  subject: string;
  topic?: string;
  start_time: string;
  end_time: string;
  is_pomodoro?: boolean;
  pomodoro_work_minutes?: number;
  pomodoro_break_minutes?: number;
}

export interface StudyPlan {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  student_id: string;
  is_active?: boolean;
  sessions?: StudyPlanSession[];
}

// Calendar event types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string; 
  end_time: string;
  event_type: 'study_session' | 'assignment' | 'exam' | 'other';
  user_id?: string;
  student_id?: string;
  subject?: string;
  topic?: string;
}

// Study session types
export interface StudySession {
  id?: string;
  subject: string;
  topic?: string;
  start_time: string;
  end_time?: string;
  student_id?: string;
  confidence_before?: number;
  confidence_after?: number;
  duration_minutes?: number;
  status?: 'planned' | 'in_progress' | 'completed' | 'canceled';
  notes?: string;
  summary?: string;
}

// Slot option type
export interface SlotOption {
  name: string;
  count: number;
  duration: number;
  color: string;
  icon: React.ComponentType<any>;
}

// Re-export confidence types
export { ConfidenceLevel, ConfidenceLabel };
