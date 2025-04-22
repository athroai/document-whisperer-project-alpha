
import { useState, useEffect } from 'react';
import { useUserSubjects } from './useUserSubjects';

const DEFAULT_SUBJECTS = [
  'Mathematics', 
  'English', 
  'Science', 
  'History', 
  'Geography',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education'
];

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [usingDefaultSubjects, setUsingDefaultSubjects] = useState(false);
  const { 
    subjects: userSubjects, 
    isLoading: isLoadingUserSubjects,
    noSubjectsFound
  } = useUserSubjects();
  
  useEffect(() => {
    if (!isLoadingUserSubjects) {
      if (userSubjects && userSubjects.length > 0) {
        console.log("Setting subjects from user subjects:", userSubjects.map(s => s.subject));
        setSubjects(userSubjects.map(s => s.subject));
        setUsingDefaultSubjects(false);
      } else if (noSubjectsFound) {
        console.log("No user subjects found, using default subjects");
        setSubjects(DEFAULT_SUBJECTS);
        setUsingDefaultSubjects(true);
      }
    }
  }, [userSubjects, isLoadingUserSubjects, noSubjectsFound]);
  
  return { 
    subjects, 
    isLoading: isLoadingUserSubjects,
    usingDefaultSubjects
  };
};
