
import { parseISO, format } from 'date-fns';

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
