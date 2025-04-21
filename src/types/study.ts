
export interface SlotOption {
  name: string;
  count: number;
  duration: number;
  color: string;
  icon: any;
}

export interface PreferredStudySlot {
  id: string;
  user_id: string;
  day_of_week: number;
  slot_count: number;
  slot_duration_minutes: number;
  preferred_start_hour?: number;
  created_at?: string;
}

// Add StudySession type for the progress components
export interface StudySession {
  id: string;
  subject: string;
  topic?: string;
  student_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  confidence_before?: number;
  confidence_after?: number;
  status?: 'in_progress' | 'completed' | 'cancelled';
  summary?: string;
  notes?: string;
  transcript?: any;
  needs_review?: boolean;
  created_at: string;
}

// Add Availability type for the availability selector
export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startHour: number;
  endHour: number;
}
