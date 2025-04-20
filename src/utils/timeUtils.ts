import { parseISO, format, addMinutes, isWithinInterval } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';

export const formatGMTTime = (timeString: string): string => {
  try {
    if (!timeString) return '??:??';
    
    const date = parseISO(timeString);
    
    if (isNaN(date.getTime())) {
      return '??:??';
    }
    
    return format(date, 'h:mm a');
  } catch (error) {
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

export const toGMTString = (date: Date): string => {
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date to GMT string:', error);
    return new Date().toISOString();
  }
};

export const findAvailableTimeSlots = (
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  existingEvents: CalendarEvent[]
): { start: Date; end: Date }[] => {
  const busySlots = existingEvents.map(event => ({
    start: new Date(event.start_time),
    end: new Date(event.end_time)
  }));

  const availableSlots: { start: Date; end: Date }[] = [];
  const startHour = 8;
  const endHour = 21;

  let currentDate = new Date(startDate);
  currentDate.setHours(startHour, 0, 0, 0);

  while (currentDate < endDate) {
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(endHour, 0, 0, 0);

    if (currentDate.getHours() >= endHour) {
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(startHour, 0, 0, 0);
      continue;
    }

    const slotEnd = addMinutes(currentDate, durationMinutes);

    const hasConflict = busySlots.some(busySlot => 
      isWithinInterval(currentDate, { start: busySlot.start, end: busySlot.end }) ||
      isWithinInterval(slotEnd, { start: busySlot.start, end: busySlot.end }) ||
      (currentDate <= busySlot.start && slotEnd >= busySlot.end)
    );

    if (!hasConflict && slotEnd <= dayEnd) {
      availableSlots.push({
        start: new Date(currentDate),
        end: slotEnd
      });

      if (availableSlots.length >= 5) {
        return availableSlots;
      }
    }

    currentDate = addMinutes(currentDate, 30);
  }

  return availableSlots;
};
