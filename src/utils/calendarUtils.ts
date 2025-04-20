
interface ColorStyle {
  bg: string;
  text: string;
}

export const getEventColor = (subject?: string): ColorStyle => {
  if (!subject) return { bg: 'bg-gray-100', text: 'text-gray-800' };
  
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('math') || subjectLower === 'mathematics') {
    return { bg: 'bg-purple-100', text: 'text-purple-800' };
  }
  
  if (subjectLower.includes('science') || subjectLower.includes('physics') || 
      subjectLower.includes('chemistry') || subjectLower.includes('biology')) {
    return { bg: 'bg-blue-100', text: 'text-blue-800' };
  }
  
  if (subjectLower.includes('english') || subjectLower.includes('language')) {
    return { bg: 'bg-green-100', text: 'text-green-800' };
  }
  
  if (subjectLower.includes('history')) {
    return { bg: 'bg-amber-100', text: 'text-amber-800' };
  }
  
  if (subjectLower.includes('geography')) {
    return { bg: 'bg-teal-100', text: 'text-teal-800' };
  }
  
  // Default color for other subjects
  return { bg: 'bg-gray-100', text: 'text-gray-800' };
};
