
import { useState, useEffect } from 'react';
import { useUserSubjects } from './useUserSubjects';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const { subjects: userSubjects, isLoading: isLoadingUserSubjects } = useUserSubjects();
  
  useEffect(() => {
    if (!isLoadingUserSubjects) {
      setSubjects(userSubjects.map(s => s.subject));
    }
  }, [userSubjects, isLoadingUserSubjects]);
  
  return { subjects, isLoading: isLoadingUserSubjects };
};
