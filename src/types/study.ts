
export interface PreferredStudySlot {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  slot_count: number;
  slot_duration_minutes: number;
  preferred_start_hour?: number;
  subject?: string; // Added subject field
}

export interface DayPreference {
  dayIndex: number;
  sessionTimes: {
    startHour: number;
    durationMinutes: number;
  }[];
}

export interface SubjectPreference {
  subject: string;
  confidence: string | number;
}
