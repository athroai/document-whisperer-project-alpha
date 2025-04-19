
import { format, parseISO, addMinutes, differenceInMinutes, isWithinInterval } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';

// Convert a Date object to GMT string
export const toGMTString = (date: Date): string => {
  return date.toISOString();
};

// Parse a GMT string to a local Date object
export const fromGMTString = (dateString: string): Date => {
  try {
    return parseISO(dateString);
  } catch (err) {
    console.error('Error parsing GMT string:', err);
    return new Date();
  }
};

// Format GMT time string to readable time
export const formatGMTTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch (err) {
    console.error('Error formatting GMT time:', err);
    return '—';
  }
};

// Format GMT date and time string to readable format
export const formatGMTDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, h:mm a');
  } catch (err) {
    console.error('Error formatting GMT date time:', err);
    return '—';
  }
};

// Interface to represent a time slot
export interface TimeSlot {
  start: Date;
  end: Date;
}

/**
 * Find available time slots between start and end dates,
 * considering existing calendar events
 */
export const findAvailableTimeSlots = (
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  existingEvents: CalendarEvent[]
): TimeSlot[] => {
  const availableSlots: TimeSlot[] = [];
  
  // Convert existing events to TimeSlot format for easier processing
  const existingSlots = existingEvents.map(event => ({
    start: fromGMTString(event.start_time),
    end: fromGMTString(event.end_time)
  }));
  
  // Start with standard study hours (9am to 8pm)
  const startHour = 9; // 9am
  const endHour = 20; // 8pm
  
  // Loop through each day in the range
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Set the day's boundaries (9am to 8pm)
    const dayStart = new Date(currentDate);
    dayStart.setHours(startHour, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(endHour, 0, 0, 0);
    
    // Skip if the current day is already past
    if (dayStart < new Date()) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // Check for available slots at 30-minute intervals
    let slotStart = new Date(dayStart);
    while (addMinutes(slotStart, durationMinutes) <= dayEnd) {
      const slotEnd = addMinutes(slotStart, durationMinutes);
      
      // Check if this slot overlaps with any existing event
      const isOverlapping = existingSlots.some(existingSlot => 
        (slotStart >= existingSlot.start && slotStart < existingSlot.end) || 
        (slotEnd > existingSlot.start && slotEnd <= existingSlot.end) ||
        (slotStart <= existingSlot.start && slotEnd >= existingSlot.end)
      );
      
      if (!isOverlapping) {
        availableSlots.push({
          start: new Date(slotStart),
          end: new Date(slotEnd)
        });
      }
      
      // Advance by 30 minutes for the next potential slot
      slotStart = addMinutes(slotStart, 30);
    }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return availableSlots;
};
