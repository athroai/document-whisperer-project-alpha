
import { useState, useEffect } from 'react';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Load available GCSE subjects with separated science subjects
    const gcseSubjects = [
      'Mathematics',
      'English Language',
      'English Literature',
      'Biology',
      'Chemistry',
      'Physics',
      'Computer Science',
      'History',
      'Geography',
      'French',
      'Spanish',
      'German',
      'Religious Studies',
      'Art & Design',
      'Music',
      'Physical Education',
      'Business Studies',
      'Economics',
      'Sociology',
      'Psychology'
    ];
    
    setSubjects(gcseSubjects);
    setIsLoading(false);
  }, []);
  
  return { subjects, isLoading };
};
