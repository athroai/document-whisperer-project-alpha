
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StudySession } from '@/types/study';

export function useStudySessions(userId?: string) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStudySessions() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Fetch completed study sessions for the current user
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('student_id', userId)
          .eq('status', 'completed')
          .order('start_time', { ascending: false });
          
        if (error) throw error;
        
        setSessions(data as StudySession[]);
        
        // Extract unique subjects
        const uniqueSubjects = [...new Set(data.map(session => session.subject))];
        setSubjects(uniqueSubjects);
        
      } catch (err) {
        console.error('Error fetching study sessions:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStudySessions();
  }, [userId]);
  
  return { sessions, subjects, isLoading, error };
}
