
import { LucideIcon } from 'lucide-react';

export interface SlotOption {
  name: string;
  count: number;
  duration: number;
  icon: LucideIcon;
  color: string;
}

export interface DayPreference {
  dayOfWeek: number;
  slotOption: number | null;
  preferredStartHour: number;
}

export interface StudySession {
  id: string;
  student_id: string;
  subject: string;
  topic?: string;
  confidence_before?: number;
  confidence_after?: number;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  summary?: string;
  created_at: string;
}

export interface PreferredStudySlot {
  id: string;
  user_id: string;
  day_of_week: number;
  slot_duration_minutes: number;
  slot_count: number;
  preferred_start_hour: number;
  created_at?: string;
  updated_at?: string;
}
