import { useState, useEffect } from 'react';
import { useUserSubjects } from './useUserSubjects';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const { subjects: userSubjects, isLoading: isLoadingUserSubjects } = useUserSubjects();
  
  useEffect(() => {
    if (!isLoadingUserSubjects) {
      if (userSubjects && userSubjects.length > 0) {
        setSubjects(userSubjects.map(s => s.subject));
      } else {
        setSubjects(['Mathematics', 'English', 'Science']);
      }
    }
  }, [userSubjects, isLoadingUserSubjects]);
  
  return { subjects, isLoading: isLoadingUserSubjects };
};
