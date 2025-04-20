
import { parseISO, format, addMinutes, isWithinInterval } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';

export const formatGMTTime = (timeString: string): string => {
  try {
    if (!timeString) return '??:??';
    
    const date = parseISO(timeString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string provided to formatGMTTime:', timeString);
      return '??:??';
    }
    
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting GMT time:', error, timeString);
    return '??:??';
  }
};

export const formatDateAndTime = (timeString: string): string => {
  try {
    if (!timeString) return 'Unknown date/time';
    
    const date = parseISO(timeString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Date format error';
  }
};

// Convert a local Date object to an ISO string
export const toGMTString = (date: Date): string => {
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date to GMT string:', error);
    return new Date().toISOString();
  }
};

// Find available time slots between startDate and endDate
export const findAvailableTimeSlots = (
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  existingEvents: CalendarEvent[]
): { start: Date; end: Date }[] => {
  // Convert all existing events to Date objects for comparison
  const busySlots = existingEvents.map(event => ({
    start: new Date(event.start_time),
    end: new Date(event.end_time)
  }));

  // Set up parameters for checking available slots
  const availableSlots: { start: Date; end: Date }[] = [];
  const startHour = 8; // 8 AM
  const endHour = 21; // 9 PM
  
  let currentDate = new Date(startDate);
  currentDate.setHours(startHour, 0, 0, 0);
  
  // Process each day until we reach the endDate
  while (currentDate < endDate) {
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(endHour, 0, 0, 0);
    
    // Skip if we're past the day's study hours
    if (currentDate.getHours() >= endHour) {
      // Move to the next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(startHour, 0, 0, 0);
      continue;
    }
    
    // Check if this timeslot is available
    const slotEnd = addMinutes(currentDate, durationMinutes);
    
    // Check if this slot conflicts with any existing events
    const hasConflict = busySlots.some(busySlot => 
      // Check if start time is within a busy slot
      isWithinInterval(currentDate, { start: busySlot.start, end: busySlot.end }) ||
      // Check if end time is within a busy slot
      isWithinInterval(slotEnd, { start: busySlot.start, end: busySlot.end }) ||
      // Check if slot completely contains a busy slot
      (currentDate <= busySlot.start && slotEnd >= busySlot.end)
    );
    
    // If no conflict and the slot ends before the day end, add it to available slots
    if (!hasConflict && slotEnd <= dayEnd) {
      availableSlots.push({
        start: new Date(currentDate),
        end: slotEnd
      });
      
      // If we have enough slots, return them
      if (availableSlots.length >= 5) {
        return availableSlots;
      }
    }
    
    // Move the current time forward by 30 minutes for the next slot check
    currentDate = addMinutes(currentDate, 30);
  }
  
  return availableSlots;
};
