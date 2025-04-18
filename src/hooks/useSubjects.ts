
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface SubjectWithConfidence {
  subject: string;
  confidence: number;
}

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectsWithConfidence, setSubjectsWithConfidence] = useState<SubjectWithConfidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!state.user?.id) {
        console.log('No authenticated user, skipping subject fetch');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First try to get subjects from student_subject_preferences
        const { data: preferences, error: preferencesError } = await supabase
          .from('student_subject_preferences')
          .select('subject, confidence_level')
          .eq('student_id', state.user.id);

        if (preferencesError && preferencesError.code !== 'PGRST116') {
          console.error('Error fetching subject preferences:', preferencesError);
          throw preferencesError;
        }

        if (preferences && preferences.length > 0) {
          // Use subject preferences if available
          const subjectList = preferences.map(pref => pref.subject);
          const subjectsWithConfidenceList = preferences.map(pref => ({
            subject: pref.subject,
            confidence: pref.confidence_level
          }));
          
          console.log('Fetched subjects from preferences:', subjectList);
          setSubjects(subjectList);
          setSubjectsWithConfidence(subjectsWithConfidenceList);
          setIsLoading(false);
          return;
        }

        // Fall back to student_subjects if preferences not available
        const { data: subjectData, error: subjectsError } = await supabase
          .from('student_subjects')
          .select('subject_name')
          .eq('student_id', state.user.id);

        if (subjectsError && subjectsError.code !== 'PGRST116') {
          console.error('Error fetching subjects:', subjectsError);
          throw subjectsError;
        }

        if (subjectData && subjectData.length > 0) {
          // Use student_subjects if available
          const subjectList = subjectData.map(subject => subject.subject_name);
          const subjectsWithConfidenceList = subjectList.map(subject => ({
            subject,
            confidence: 5 // Default confidence
          }));
          
          console.log('Fetched subjects from student_subjects:', subjectList);
          setSubjects(subjectList);
          setSubjectsWithConfidence(subjectsWithConfidenceList);
          setIsLoading(false);
          return;
        }

        // Use default GCSE subjects if no user-specific subjects are found
        const defaultSubjects = [
          'Mathematics', 'Science', 'English', 'History', 
          'Geography', 'Welsh', 'Languages', 'Religious Education'
        ];
        const defaultSubjectsWithConfidence = defaultSubjects.map(subject => ({
          subject,
          confidence: 5 // Default confidence
        }));
        
        console.log('Using default subject list:', defaultSubjects);
        setSubjects(defaultSubjects);
        setSubjectsWithConfidence(defaultSubjectsWithConfidenceList);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        setError('Failed to fetch subjects');
        // Fall back to default subjects on error
        const defaultSubjects = [
          'Mathematics', 'Science', 'English', 'History', 
          'Geography', 'Welsh', 'Languages', 'Religious Education'
        ];
        const defaultSubjectsWithConfidence = defaultSubjects.map(subject => ({
          subject,
          confidence: 5 // Default confidence
        }));
        
        setSubjects(defaultSubjects);
        setSubjectsWithConfidence(defaultSubjectsWithConfidence);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [state.user?.id]);

  return { 
    subjects, 
    subjectsWithConfidence,
    isLoading, 
    error 
  };
};
