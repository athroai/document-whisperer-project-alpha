
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Try to fetch from Supabase first
        const { data: subjectData, error } = await supabase
          .from('athro_characters')
          .select('subject')
          .order('subject');

        if (!error && subjectData && subjectData.length > 0) {
          // Extract unique subjects
          const uniqueSubjects = Array.from(
            new Set(subjectData.map(item => item.subject))
          );
          setSubjects(uniqueSubjects);
        } else {
          // If no data in Supabase or error, use default list
          setSubjects([
            'Mathematics',
            'English Language',
            'English Literature',
            'Biology',
            'Chemistry',
            'Physics',
            'Combined Science',
            'Geography',
            'History',
            'Computer Science',
            'French',
            'Spanish',
            'German',
            'Art & Design',
            'Physical Education',
            'Religious Studies',
            'Drama',
            'Music',
            'Business Studies'
          ]);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        // Use default subjects as fallback
        setSubjects([
          'Mathematics',
          'English Language',
          'English Literature',
          'Science'
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return { subjects, isLoading };
};
