import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { GCSE_SUBJECTS } from './useSubjects';

export interface UserSubject {
  subject: string;
  confidence?: string | number;
}

export const useUserSubjects = () => {
  const [subjects, setSubjects] = useState<UserSubject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();
  const userId = authState.user?.id;

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get subjects from database if user is authenticated
      if (userId) {
        const { data, error } = await supabase
          .from('student_subject_preferences')
          .select('subject, confidence_level')
          .eq('student_id', userId);
        
        if (error) {
          console.error('Error fetching user subjects:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedSubjects = data.map(row => ({
            subject: row.subject,
            confidence: row.confidence_level
          }));
          
          console.log('Fetched user subjects from database:', formattedSubjects);
          setSubjects(formattedSubjects);
          return;
        }
      }
      
      // Try to get subjects from localStorage
      const storedSubjects = localStorage.getItem('athro_selected_subjects');
      if (storedSubjects) {
        try {
          const parsedSubjects = JSON.parse(storedSubjects);
          if (Array.isArray(parsedSubjects) && parsedSubjects.length > 0) {
            console.log('Using subjects from localStorage:', parsedSubjects);
            setSubjects(parsedSubjects);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored subjects:', e);
        }
      }
      
      // Fallback to onboarding subjects in localStorage
      const onboardingSubjects = localStorage.getItem('selected_subjects');
      if (onboardingSubjects) {
        try {
          const parsedOnboardingSubjects = JSON.parse(onboardingSubjects);
          if (Array.isArray(parsedOnboardingSubjects) && parsedOnboardingSubjects.length > 0) {
            console.log('Using subjects from onboarding:', parsedOnboardingSubjects);
            setSubjects(parsedOnboardingSubjects.map((subject: string) => ({ subject })));
            return;
          }
        } catch (e) {
          console.error('Error parsing onboarding subjects:', e);
        }
      }
      
      // Final fallback - just use default subjects
      setSubjects(GCSE_SUBJECTS.slice(0, 3).map(subject => ({ subject })));
      
    } catch (err) {
      console.error('Error in useUserSubjects:', err);
      setError('Failed to load user subjects');
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const refetch = useCallback(() => {
    return fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    isLoading,
    error,
    refetch
  };
};
