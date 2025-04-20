
import { PreferredStudySlot } from '@/types/study';

export const generateDefaultStudySlots = (userId: string): PreferredStudySlot[] => {
  // Generate a default set of study slots for weekdays
  const weekdaySlots: PreferredStudySlot[] = [1, 2, 3, 4, 5].map(dayOfWeek => ({
    id: `default-${dayOfWeek}`,
    user_id: userId,
    day_of_week: dayOfWeek,
    slot_duration_minutes: 45,
    slot_count: 2,
    preferred_start_hour: 15, // 3 PM
  }));

  // Add weekend slots with different timing
  const weekendSlots: PreferredStudySlot[] = [6, 7].map(dayOfWeek => ({
    id: `default-${dayOfWeek}`,
    user_id: userId,
    day_of_week: dayOfWeek,
    slot_duration_minutes: 90,
    slot_count: 1,
    preferred_start_hour: 10, // 10 AM for weekends
  }));

  return [...weekdaySlots, ...weekendSlots];
};

export const calculateStudySessionsPerWeek = (
  subjectCount: number,
  maxSessionsPerWeek = 14
): number => {
  if (subjectCount <= 0) {
    return 0;
  }
  
  // Allocate sessions evenly, minimum 1 per subject
  const baseSessionsPerSubject = Math.max(1, Math.floor(maxSessionsPerWeek / subjectCount));
  
  // Cap at 3 sessions per subject per week
  return Math.min(3, baseSessionsPerSubject);
};
