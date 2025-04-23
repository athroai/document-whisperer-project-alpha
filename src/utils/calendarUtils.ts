
import { ColorStyle } from '@/types/calendar';

const subjectColors: { [key: string]: ColorStyle } = {
  default: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800',
    color: '#8E9196'
  }
};

const colorPalette: ColorStyle[] = [
  { bg: 'bg-purple-100', text: 'text-purple-800', color: '#9b87f5' },
  { bg: 'bg-blue-100', text: 'text-blue-800', color: '#0ea5e9' },
  { bg: 'bg-green-100', text: 'text-green-800', color: '#10b981' },
  { bg: 'bg-amber-100', text: 'text-amber-800', color: '#f59e0b' },
  { bg: 'bg-teal-100', text: 'text-teal-800', color: '#14b8a6' },
  { bg: 'bg-pink-100', text: 'text-pink-800', color: '#ec4899' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', color: '#6366f1' },
  { bg: 'bg-red-100', text: 'text-red-800', color: '#ef4444' },
  { bg: 'bg-sky-100', text: 'text-sky-800', color: '#0284c7' },
  { bg: 'bg-orange-100', text: 'text-orange-800', color: '#f97316' }
];

export const getEventColor = (subject: string): ColorStyle => {
  const normalizedSubject = subject?.toLowerCase().trim() || '';
  
  if (!subjectColors[normalizedSubject]) {
    // Assign a color from the palette based on the subject name's hash
    const hash = normalizedSubject.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash) % colorPalette.length;
    subjectColors[normalizedSubject] = colorPalette[index];
  }
  
  return subjectColors[normalizedSubject] || subjectColors.default;
};
