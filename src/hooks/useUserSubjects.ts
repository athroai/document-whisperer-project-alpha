
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SubjectPreference } from '@/types/study';

export interface UserSubject {
  subject: string;
  confidence: string | number;
  priority?: number;
}

export const useUserSubjects = () => {
  const [subjects, setSubjects] = useState<UserSubject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();
  const userId = authState.user?.id;

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (userId) {
          const { data, error: fetchError } = await supabase
            .from('student_subject_preferences')
            .select('*')
            .eq('student_id', userId);
          
          if (fetchError) {
            throw fetchError;
          }
          
          if (data && data.length > 0) {
            const mappedSubjects = data.map(preference => ({
              subject: preference.subject,
              confidence: preference.confidence_level,
              priority: preference.priority
            }));
            
            setSubjects(mappedSubjects);
            return;
          }
        }
        
        // Try to get subjects from localStorage as fallback
        const storedSubjects = localStorage.getItem('selected_subjects');
        if (storedSubjects) {
          try {
            const parsedSubjects = JSON.parse(storedSubjects);
            if (Array.isArray(parsedSubjects) && parsedSubjects.length > 0) {
              setSubjects(parsedSubjects);
              return;
            }
          } catch (e) {
            console.error('Error parsing stored subjects:', e);
          }
        }
        
        setSubjects([]);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects');
        setSubjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjects();
  }, [userId]);

  const addSubject = async (subject: string, confidence: string | number) => {
    if (!userId) return false;
    
    try {
      const newSubject = {
        subject,
        confidence,
        priority: subjects.length + 1
      };
      
      // Update local state
      setSubjects(prev => [...prev, newSubject]);
      
      // Save to database
      const { error } = await supabase
        .from('student_subject_preferences')
        .upsert({
          student_id: userId,
          subject,
          confidence_level: confidence,
          priority: subjects.length + 1
        });
        
      if (error) {
        console.error('Error saving subject:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error adding subject:', err);
      return false;
    }
  };

  const removeSubject = async (subject: string) => {
    if (!userId) return false;
    
    try {
      // Update local state
      setSubjects(prev => prev.filter(s => s.subject !== subject));
      
      // Remove from database
      const { error } = await supabase
        .from('student_subject_preferences')
        .delete()
        .eq('student_id', userId)
        .eq('subject', subject);
        
      if (error) {
        console.error('Error removing subject:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error removing subject:', err);
      return false;
    }
  };

  return {
    subjects,
    isLoading,
    error,
    addSubject,
    removeSubject
  };
};
