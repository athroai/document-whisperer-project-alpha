import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// List of common GCSE subjects
export const GCSE_SUBJECTS = [
  'Mathematics',
  'English Language',
  'English Literature',
  'Biology',
  'Chemistry',
  'Physics',
  'Combined Science',
  'History',
  'Geography',
  'Computer Science',
  'Art & Design',
  'Business Studies',
  'Religious Studies',
  'French',
  'Spanish',
  'German',
  'Welsh'
];

// Common subjects for use in components that don't need the full list
export const COMMON_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Science',
  'History',
  'Geography'
];

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDefaultSubjects, setUsingDefaultSubjects] = useState<boolean>(false);
  const { state: authState } = useAuth();
  const userId = authState.user?.id;

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try to get subjects from database if user is authenticated
        if (userId) {
          const { data, error } = await supabase
            .from('student_subject_preferences')
            .select('subject')
            .eq('student_id', userId);
          
          if (error) {
            console.error('Error fetching subjects:', error);
            throw error;
          }
          
          if (data && data.length > 0) {
            const subjectList = data.map(row => row.subject);
            
            console.log('Fetched subjects from database:', subjectList);
            setSubjects(subjectList);
            setUsingDefaultSubjects(false);
            return;
          }
        }
        
        // Then try to get subjects from localStorage
        const storedSubjects = localStorage.getItem('selected_subjects');
        if (storedSubjects) {
          const parsedSubjects = JSON.parse(storedSubjects);
          
          if (Array.isArray(parsedSubjects) && parsedSubjects.length > 0) {
            console.log('Using subjects from localStorage:', parsedSubjects);
            setSubjects(parsedSubjects);
            setUsingDefaultSubjects(false);
            return;
          }
        }
        
        // Fallback to default subjects
        console.log('Using default subjects list');
        setSubjects([]);
        setUsingDefaultSubjects(true);
        
      } catch (err) {
        console.error('Error in useSubjects:', err);
        setError('Failed to load subjects');
        setSubjects([]);
        setUsingDefaultSubjects(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjects();
  }, [userId]);

  const refetch = async () => {
    setIsLoading(true);
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('student_subject_preferences')
          .select('subject')
          .eq('student_id', userId);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSubjects(data.map(row => row.subject));
          setUsingDefaultSubjects(false);
          return;
        }
      }
      
      setSubjects([]);
      setUsingDefaultSubjects(true);
    } catch (err) {
      console.error('Error refetching subjects:', err);
      setError('Failed to refresh subjects');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subjects,
    isLoading,
    error,
    usingDefaultSubjects,
    refetch,
    allSubjects: GCSE_SUBJECTS // Return all available subjects
  };
};
