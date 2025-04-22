
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSubject {
  subject: string;
  confidence_level: 'low' | 'medium' | 'high';
}

export const useUserSubjects = () => {
  const [subjects, setSubjects] = useState<UserSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { state: authState } = useAuth();

  const fetchUserSubjects = async () => {
    if (!authState.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('student_subject_preferences')
        .select('subject, confidence_level')
        .eq('student_id', authState.user.id);

      if (error) throw error;

      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching user subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubjects();
  }, [authState.user?.id]);

  return { subjects, isLoading, refetch: fetchUserSubjects };
};
