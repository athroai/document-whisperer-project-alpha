export interface CalendarEvent {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  user_id?: string;
  student_id?: string;
  local_only?: boolean;
  suggested?: boolean;
  timezone?: string;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_date?: string;
    days_of_week?: number[];
  };
  is_blocked_time?: boolean;
}

export interface BlockedTimePreference {
  id: string;
  user_id: string;
  title: string;
  day_of_week: number; // 0-6: Sunday-Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  reason?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UserTimePreference {
  id: string;
  user_id: string;
  preferred_study_duration: number; // minutes
  preferred_break_duration: number; // minutes
  preferred_study_time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  max_sessions_per_day: number;
  min_gap_between_sessions: number; // minutes
  avoided_days?: number[]; // 0-6: Sunday-Saturday
}

export interface ColorStyle {
  bg: string;
  text: string;
  color: string;
}
