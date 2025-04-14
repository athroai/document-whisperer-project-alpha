
export interface DailyAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // 24h format "HH:MM"
  endTime: string; // 24h format "HH:MM"
  available: boolean;
}

export interface StudyRoutine {
  userId: string;
  preferredSessionLength: 15 | 25 | 45 | 60; // minutes
  availability: DailyAvailability[];
  doNotDisturbRanges?: Array<{
    startTime: string;
    endTime: string;
    days: number[]; // 0-6 for days of week
    reason?: string;
  }>;
  lastUpdated: string;
}

export interface TimetableSession {
  id: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  date: string; // YYYY-MM-DD
  startTime: string; // 24h format
  endTime: string; // 24h format
  subject: string;
  topic?: string;
  sessionType: 'study' | 'quiz' | 'assignment' | 'revision';
  priority: 'high' | 'medium' | 'low';
  linkedGoalId?: string;
  linkedAssignmentId?: string;
  completed: boolean;
}

export interface WeeklyTimetable {
  userId: string;
  weekStartDate: string; // YYYY-MM-DD of Sunday
  weekEndDate: string; // YYYY-MM-DD of Saturday
  generatedAt: string;
  sessions: TimetableSession[];
}

export interface TimetableGenerationOptions {
  rebalanceSubjects?: boolean;
  includeWeakestSubjects?: boolean;
  prioritizeUpcomingExams?: boolean;
  respectDoNotDisturb?: boolean;
  sessionLengthOverride?: 15 | 25 | 45 | 60;
}
