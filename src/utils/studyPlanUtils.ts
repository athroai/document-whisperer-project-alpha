
import { PreferredStudySlot } from '@/types/study';

export const generateDefaultStudySlots = (userId: string): PreferredStudySlot[] => {
  // Generate default study slots (weekdays, afternoon)
  const slots: PreferredStudySlot[] = [];
  
  // Monday through Friday (1-5)
  for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
    slots.push({
      id: `default-${dayOfWeek}`,
      user_id: userId,
      day_of_week: dayOfWeek,
      slot_count: 1,
      slot_duration_minutes: 45,
      preferred_start_hour: 16, // 4 PM
    });
  }
  
  return slots;
};
