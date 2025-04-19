
import { format, parseISO, addDays, addWeeks, addMonths, isSameDay, getDay } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';

export const toGMTString = (date: Date): string => {
  return date.toISOString().replace('Z', '+00:00');
};

export const fromGMTString = (dateString: string): Date => {
  return parseISO(dateString);
};

export const formatGMTDateTime = (dateString: string): string => {
  const date = fromGMTString(dateString);
  return format(date, 'EEEE, h:mm a');
};

export const formatGMTTime = (dateString: string): string => {
  const date = fromGMTString(dateString);
  return format(date, 'h:mm a');
};

export const formatGMTDate = (dateString: string): string => {
  const date = fromGMTString(dateString);
  return format(date, 'MMMM d, yyyy');
};

export const getDayOfWeek = (date: Date): number => {
  return getDay(date); // 0-6: Sunday-Saturday
};

export const getTimeString = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const generateRecurringEventInstances = (
  event: CalendarEvent, 
  startDate: Date, 
  endDate: Date
): CalendarEvent[] => {
  if (!event.recurrence) return [event];

  const instances: CalendarEvent[] = [];
  let currentDate = fromGMTString(event.start_time);
  const eventEndDate = event.recurrence.end_date 
    ? fromGMTString(event.recurrence.end_date) 
    : new Date(endDate);
  
  const startTime = format(fromGMTString(event.start_time), 'HH:mm');
  const endTime = format(fromGMTString(event.end_time), 'HH:mm');
  const eventDuration = fromGMTString(event.end_time).getTime() - fromGMTString(event.start_time).getTime();
  
  while (currentDate <= eventEndDate && currentDate <= endDate) {
    if (currentDate >= startDate && currentDate <= endDate) {
      // Check if this day should be included based on days_of_week
      let shouldInclude = true;
      if (event.recurrence.days_of_week && event.recurrence.days_of_week.length > 0) {
        const dayOfWeek = getDay(currentDate);
        shouldInclude = event.recurrence.days_of_week.includes(dayOfWeek);
      }
      
      if (shouldInclude) {
        const instanceStart = new Date(currentDate);
        const instanceEnd = new Date(instanceStart.getTime() + eventDuration);
        
        instances.push({
          ...event,
          id: `${event.id}-${format(currentDate, 'yyyyMMdd')}`,
          start_time: toGMTString(instanceStart),
          end_time: toGMTString(instanceEnd),
          original_event_id: event.id,
        });
      }
    }
    
    // Advance to next occurrence based on recurrence pattern
    switch (event.recurrence.pattern) {
      case 'daily':
        currentDate = addDays(currentDate, event.recurrence.interval);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, event.recurrence.interval);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, event.recurrence.interval);
        break;
    }
  }
  
  return instances;
};

export const isTimeSlotAvailable = (
  startTime: Date, 
  endTime: Date, 
  existingEvents: CalendarEvent[],
  blockedTimes: BlockedTimePreference[] = []
): boolean => {
  // Check against existing calendar events
  for (const event of existingEvents) {
    const eventStart = fromGMTString(event.start_time);
    const eventEnd = fromGMTString(event.end_time);
    
    if (
      (startTime >= eventStart && startTime < eventEnd) || // Start time is within an existing event
      (endTime > eventStart && endTime <= eventEnd) || // End time is within an existing event
      (startTime <= eventStart && endTime >= eventEnd) // New event completely encompasses an existing event
    ) {
      return false;
    }
  }
  
  // Check against blocked times
  const dayOfWeek = getDay(startTime);
  const startTimeString = format(startTime, 'HH:mm');
  const endTimeString = format(endTime, 'HH:mm');
  
  for (const blockedTime of blockedTimes) {
    if (blockedTime.day_of_week === dayOfWeek) {
      if (
        (startTimeString >= blockedTime.start_time && startTimeString < blockedTime.end_time) ||
        (endTimeString > blockedTime.start_time && endTimeString <= blockedTime.end_time) ||
        (startTimeString <= blockedTime.start_time && endTimeString >= blockedTime.end_time)
      ) {
        return false;
      }
    }
  }
  
  return true;
};

export const findNextAvailableTimeSlot = (
  preferredStartTime: Date,
  durationMinutes: number,
  existingEvents: CalendarEvent[],
  blockedTimes: BlockedTimePreference[] = [],
  timePreferences?: UserTimePreference
): Date | null => {
  const maxAttempts = 14 * 24 * 2; // Try for up to 2 weeks in 30-minute increments
  let currentStartTime = new Date(preferredStartTime);
  const endTime = new Date(currentStartTime.getTime() + durationMinutes * 60000);
  
  // First try the exact preferred time
  if (isTimeSlotAvailable(currentStartTime, endTime, existingEvents, blockedTimes)) {
    return currentStartTime;
  }
  
  // If not available, try incrementing by 30 minutes
  for (let i = 0; i < maxAttempts; i++) {
    currentStartTime = new Date(currentStartTime.getTime() + 30 * 60000);
    const currentEndTime = new Date(currentStartTime.getTime() + durationMinutes * 60000);
    
    if (isTimeSlotAvailable(currentStartTime, currentEndTime, existingEvents, blockedTimes)) {
      // If we have time preferences, check additional constraints
      if (timePreferences) {
        const dayOfWeek = getDay(currentStartTime);
        
        // Skip avoided days
        if (timePreferences.avoided_days?.includes(dayOfWeek)) {
          continue;
        }
        
        // Check max sessions per day
        const sessionsOnSameDay = existingEvents.filter(event => 
          isSameDay(fromGMTString(event.start_time), currentStartTime)
        ).length;
        
        if (sessionsOnSameDay >= timePreferences.max_sessions_per_day) {
          // Skip to next day
          currentStartTime = new Date(currentStartTime);
          currentStartTime.setDate(currentStartTime.getDate() + 1);
          currentStartTime.setHours(8, 0, 0, 0); // Reset to 8 AM
          continue;
        }
      }
      
      return currentStartTime;
    }
  }
  
  return null; // No available slot found within the search window
};

interface TimeSlot {
  start: Date;
  end: Date;
}

export const findAvailableTimeSlots = (
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  existingEvents: CalendarEvent[],
  blockedTimes: BlockedTimePreference[] = [],
  maxSlots: number = 5
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate && slots.length < maxSlots) {
    // Only consider times between 8 AM and 9 PM
    for (let hour = 8; hour < 21; hour++) {
      const slotStart = new Date(currentDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      // Don't check slots in the past
      if (slotStart < new Date()) {
        continue;
      }
      
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      
      if (isTimeSlotAvailable(slotStart, slotEnd, existingEvents, blockedTimes)) {
        slots.push({ start: slotStart, end: slotEnd });
        
        if (slots.length >= maxSlots) {
          break;
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }
  
  return slots;
};
