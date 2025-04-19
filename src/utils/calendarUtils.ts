import { format } from 'date-fns';
import { toGMTString, formatGMTDateTime, formatGMTTime } from './timeUtils';
import { CalendarEvent, BlockedTimePreference, UserTimePreference } from '@/types/calendar';

// Function to get event background color based on subject
export const getEventColor = (subject?: string, isBlocked?: boolean) => {
  if (isBlocked) {
    return { bg: 'bg-red-100', text: 'text-red-800' };
  }

  const subjectColorMap: Record<string, { bg: string, text: string }> = {
    'Mathematics': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'Science': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'English': { bg: 'bg-green-100', text: 'text-green-800' },
    'History': { bg: 'bg-amber-100', text: 'text-amber-800' },
    'Geography': { bg: 'bg-teal-100', text: 'text-teal-800' },
    'Welsh': { bg: 'bg-red-100', text: 'text-red-800' },
    'Languages': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'Religious Education': { bg: 'bg-pink-100', text: 'text-pink-800' },
    'maths': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'science': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'english': { bg: 'bg-green-100', text: 'text-green-800' },
    'history': { bg: 'bg-amber-100', text: 'text-amber-800' }
  };
  
  return subject && subjectColorMap[subject] 
    ? subjectColorMap[subject] 
    : { bg: 'bg-gray-100', text: 'text-gray-800' };
};

// Format date range (for event display)
export const formatDateRange = (start: Date, end: Date) => {
  const gmtStart = toGMTString(start);
  const gmtEnd = toGMTString(end);
  return `${formatGMTDateTime(gmtStart)} - ${formatGMTTime(gmtEnd)}`;
};

// Get the recurrence pattern description
export const getRecurrenceDescription = (event: CalendarEvent): string => {
  if (!event.recurrence) return 'One-time event';
  
  const { pattern, interval, days_of_week } = event.recurrence;
  
  let description = '';
  
  switch (pattern) {
    case 'daily':
      description = interval === 1 ? 'Daily' : `Every ${interval} days`;
      break;
    case 'weekly':
      if (days_of_week && days_of_week.length > 0) {
        const dayNames = days_of_week.map(day => {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return days[day];
        }).join(', ');
        
        description = interval === 1 
          ? `Weekly on ${dayNames}` 
          : `Every ${interval} weeks on ${dayNames}`;
      } else {
        description = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      }
      break;
    case 'monthly':
      description = interval === 1 ? 'Monthly' : `Every ${interval} months`;
      break;
  }
  
  if (event.recurrence.end_date) {
    description += ` until ${format(new Date(event.recurrence.end_date), 'MMM d, yyyy')}`;
  }
  
  return description;
};

// Create an event series from a recurring event template
export const createEventSeries = (event: CalendarEvent, occurrences: number = 10): CalendarEvent[] => {
  if (!event.recurrence) return [event];
  
  const series: CalendarEvent[] = [];
  let currentDate = new Date(event.start_time);
  const duration = new Date(event.end_time).getTime() - new Date(event.start_time).getTime();
  
  for (let i = 0; i < occurrences; i++) {
    if (i === 0) {
      series.push(event);
    } else {
      const newStart = new Date(currentDate);
      const newEnd = new Date(newStart.getTime() + duration);
      
      series.push({
        ...event,
        id: `${event.id}-${i}`,
        start_time: toGMTString(newStart),
        end_time: toGMTString(newEnd)
      });
    }
    
    // Move to next occurrence
    switch (event.recurrence.pattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + event.recurrence.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * event.recurrence.interval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + event.recurrence.interval);
        break;
    }
  }
  
  return series;
};

// Find optimal time to schedule a study session
export const findOptimalStudyTime = (
  user_id: string,
  subject: string,
  durationMinutes: number = 60,
  existingEvents: CalendarEvent[],
  blockedTimes: BlockedTimePreference[],
  timePreferences: UserTimePreference
): Date | null => {
  const now = new Date();
  
  // Start searching from tomorrow at the preferred time of day
  const startSearch = new Date(now);
  startSearch.setDate(now.getDate() + 1);
  
  // Set preferred starting hour based on time preference
  let preferredHour = 9; // Default to morning
  
  switch (timePreferences.preferred_study_time_of_day) {
    case 'morning':
      preferredHour = 9;
      break;
    case 'afternoon':
      preferredHour = 13;
      break;
    case 'evening':
      preferredHour = 17;
      break;
    case 'night':
      preferredHour = 20;
      break;
  }
  
  startSearch.setHours(preferredHour, 0, 0, 0);
  
  return findNextAvailableTimeSlot(startSearch, durationMinutes, existingEvents, blockedTimes, timePreferences);
};

// Helper function to identify blocked time conflicts
export const getBlockedTimeConflicts = (
  startTime: Date,
  endTime: Date,
  blockedTimes: BlockedTimePreference[]
): BlockedTimePreference[] => {
  const conflicts: BlockedTimePreference[] = [];
  const dayOfWeek = startTime.getDay();
  const startTimeString = format(startTime, 'HH:mm');
  const endTimeString = format(endTime, 'HH:mm');
  
  for (const blockedTime of blockedTimes) {
    if (blockedTime.day_of_week === dayOfWeek) {
      if (
        (startTimeString >= blockedTime.start_time && startTimeString < blockedTime.end_time) ||
        (endTimeString > blockedTime.start_time && endTimeString <= blockedTime.end_time) ||
        (startTimeString <= blockedTime.start_time && endTimeString >= blockedTime.end_time)
      ) {
        conflicts.push(blockedTime);
      }
    }
  }
  
  return conflicts;
};

// Function to find next available time slot from preference
export const findNextAvailableTimeSlot = (
  startTime: Date,
  durationMinutes: number,
  existingEvents: CalendarEvent[],
  blockedTimes: BlockedTimePreference[]
): Date | null => {
  // Check against existing calendar events
  for (const event of existingEvents) {
    const eventStart = fromGMTString(event.start_time);
    const eventEnd = fromGMTString(event.end_time);
    
    if (
      (startTime >= eventStart && startTime < eventEnd) || // Start time is within an existing event
      (endTime > eventStart && endTime <= eventEnd) || // End time is within an existing event
      (startTime <= eventStart && endTime >= eventEnd) // New event completely encompasses an existing event
    ) {
      return null;
    }
  }
  
  // Check against blocked times
  const dayOfWeek = startTime.getDay();
  const startTimeString = format(startTime, 'HH:mm');
  const endTimeString = format(endTime, 'HH:mm');
  
  for (const blockedTime of blockedTimes) {
    if (blockedTime.day_of_week === dayOfWeek) {
      if (
        (startTimeString >= blockedTime.start_time && startTimeString < blockedTime.end_time) ||
        (endTimeString > blockedTime.start_time && endTimeString <= blockedTime.end_time) ||
        (startTimeString <= blockedTime.start_time && endTimeString >= blockedTime.end_time)
      ) {
        return null;
      }
    }
  }
  
  return startTime;
};
