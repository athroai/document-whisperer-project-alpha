
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SubjectPreference } from '@/types/study';

export type { UserSubject } from '@/types/study';

export function useUserSubjects() {
  const { state } = useAuth();
  const [userSubjects, setUserSubjects] = useState<SubjectPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserSubjects = async () => {
      if (!state.user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', state.user.id);

        if (error) {
          setError(error);
        } else {
          setUserSubjects(data || []);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSubjects();
  }, [state.user]);

  // Ensure we're returning the expected properties
  return { 
    userSubjects,
    subjects: userSubjects, // Add this for compatibility
    isLoading, 
    error,
    refetch: async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', state.user?.id);

        if (error) {
          setError(error);
        } else {
          setUserSubjects(data || []);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
  };
}
