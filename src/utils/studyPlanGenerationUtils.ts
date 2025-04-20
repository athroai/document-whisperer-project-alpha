
import { PreferredStudySlot } from '@/types/study';

export const generateDefaultStudySlots = (userId: string): PreferredStudySlot[] => {
  const defaultSlots: PreferredStudySlot[] = [];
  
  // Create default slots for weekdays (Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    defaultSlots.push({
      id: `default-${day}`,
      user_id: userId,
      day_of_week: day,
      slot_count: 1,
      slot_duration_minutes: 45,
      preferred_start_hour: 16 // 4pm default start time
    });
  }
  
  return defaultSlots;
};

export const getDayName = (dayIndex: number): string => {
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];
  return days[dayIndex] || '';
};

export const formatTime = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};
