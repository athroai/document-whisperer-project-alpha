
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserSubject, ConfidenceLabel, ConfidenceLevel } from '@/types/study';
import { mapLabelToConfidence } from '@/types/confidence';

export interface UseUserSubjectsReturn {
  subjects: UserSubject[];
  isLoading: boolean;
  error: string | null;
  addSubject: (subject: string, confidence: string | number) => Promise<boolean>;
  removeSubject: (subject: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  updateSubjectConfidence: (subject: string, confidence: ConfidenceLabel | ConfidenceLevel) => Promise<boolean>;
}

export const useUserSubjects = (): UseUserSubjectsReturn => {
  const [subjects, setSubjects] = useState<UserSubject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();
  const userId = authState.user?.id;

  const fetchSubjects = useCallback(async () => {
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
  }, [userId]);
  
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const addSubject = async (subject: string, confidence: string | number): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // Normalize confidence value
      const normalizedConfidence = typeof confidence === 'string' 
        ? mapLabelToConfidence(confidence as ConfidenceLabel) 
        : Number(confidence);
      
      const newSubject: UserSubject = {
        subject,
        confidence: normalizedConfidence,
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
          confidence_level: normalizedConfidence,
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

  const removeSubject = async (subject: string): Promise<boolean> => {
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

  const updateSubjectConfidence = async (subject: string, confidence: ConfidenceLabel | ConfidenceLevel): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // Normalize confidence value
      const normalizedConfidence = typeof confidence === 'string' 
        ? mapLabelToConfidence(confidence as ConfidenceLabel) 
        : Number(confidence);
      
      // Update local state
      setSubjects(prev => 
        prev.map(s => 
          s.subject === subject 
            ? { ...s, confidence: normalizedConfidence } 
            : s
        )
      );
      
      // Save to database
      const { error } = await supabase
        .from('student_subject_preferences')
        .update({ confidence_level: normalizedConfidence })
        .eq('student_id', userId)
        .eq('subject', subject);
        
      if (error) {
        console.error('Error updating subject confidence:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error updating subject confidence:', err);
      return false;
    }
  };

  // Explicitly define refetch as a function to refresh subjects
  const refetch = async (): Promise<void> => {
    await fetchSubjects();
  };

  return {
    subjects,
    isLoading,
    error,
    addSubject,
    removeSubject,
    refetch,
    updateSubjectConfidence
  };
};
