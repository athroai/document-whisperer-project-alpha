
import { format, parseISO } from 'date-fns';

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
