
import { PreferredStudySlot } from '@/types/study';

export const generateDefaultStudySlots = (userId: string): PreferredStudySlot[] => {
  return [1, 2, 3, 4, 5].map(dayOfWeek => ({
    id: `default-${dayOfWeek}`,
    user_id: userId,
    day_of_week: dayOfWeek,
    slot_count: 1,
    slot_duration_minutes: 45,
    preferred_start_hour: 16,
    subject: 'Mathematics' // Add default subject
  }));
};
