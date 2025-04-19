
import { format, parseISO } from 'date-fns';

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
