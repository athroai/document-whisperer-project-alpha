
import { format } from 'date-fns';

// Function to get event background color based on subject
export const getEventColor = (subject?: string) => {
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
  return `${format(start, 'EEEE, h:mm a')} - ${format(end, 'h:mm a')}`;
};
