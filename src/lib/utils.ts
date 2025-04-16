
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return format(date, 'PPP'); // Format: Jan 1, 2021
}
