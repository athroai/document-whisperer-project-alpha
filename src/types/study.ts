
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
