
// If this file doesn't exist, create it
export interface PreferredStudySlot {
  id: string;
  user_id: string;
  day_of_week: number;
  slot_count: number;
  slot_duration_minutes: number;
  preferred_start_hour: number;
  subject?: string; // Add subject field to store which subject this slot is for
  created_at?: string;
}

export interface SlotOption {
  name: string;
  count: number;
  duration: number;
  color: string;
  icon: React.ComponentType<any>;
}

export interface StudySession {
  id: string;
  subject: string;
  topic?: string;
  start_time: string;
  end_time: string;
  status?: string;
  duration_minutes?: number;
  confidence_before?: number;
  confidence_after?: number;
  student_id?: string;
  created_at?: string;
  notes?: string;
  summary?: string;
}

export interface Availability {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}
