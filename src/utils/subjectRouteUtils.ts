
import { AthroSubject } from '@/types/athro';

/**
 * Maps subject names to URL-friendly route paths
 * @param subject The subject to convert to a route path
 * @returns A URL-friendly path string
 */
export const getSubjectPath = (subject: string): string => {
  const pathMap: Record<string, string> = {
    'Mathematics': 'maths',
    'Religious Education': 're',
    'Study Skills': 'study-skills',
    'Computer Science': 'computer-science'
  };
  
  return pathMap[subject] || subject.toLowerCase();
};

/**
 * Maps URL paths back to subject names
 * @param path The URL path to convert back to a subject name
 * @returns The formal subject name
 */
export const getSubjectFromPath = (path: string): string => {
  const subjectMap: Record<string, string> = {
    'maths': 'Mathematics',
    're': 'Religious Education',
    'study-skills': 'Study Skills',
    'computer-science': 'Computer Science'
  };
  
  return subjectMap[path.toLowerCase()] || 
    path.charAt(0).toUpperCase() + path.slice(1).toLowerCase();
};
