
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
  const [noSubjectsFound, setNoSubjectsFound] = useState(false);
  const { state: authState } = useAuth();

  const fetchUserSubjects = async () => {
    if (!authState.user?.id) return;

    try {
      setIsLoading(true);
      setNoSubjectsFound(false);
      
      console.log("Fetching user subjects for user ID:", authState.user.id);
      
      // First try to get subjects from student_subject_preferences
      const { data: prefData, error: prefError } = await supabase
        .from('student_subject_preferences')
        .select('subject, confidence_level')
        .eq('student_id', authState.user.id);

      if (prefError) {
        console.error('Error fetching user subject preferences:', prefError);
      }
      
      if (prefData && prefData.length > 0) {
        console.log("Found subjects in student_subject_preferences:", prefData.length);
        // Convert numeric confidence_level to low/medium/high
        const mappedSubjects = prefData.map(subj => ({
          subject: subj.subject,
          confidence_level: mapConfidenceLevel(subj.confidence_level)
        }));
        
        setSubjects(mappedSubjects);
        setIsLoading(false);
        return;
      }
      
      // If no subjects found in preferences, try student_subjects
      console.log("No subjects found in preferences, checking student_subjects");
      const { data: subjData, error: subjError } = await supabase
        .from('student_subjects')
        .select('subject_name, help_level')
        .eq('student_id', authState.user.id);
        
      if (subjError) {
        console.error('Error fetching student subjects:', subjError);
      }
      
      if (subjData && subjData.length > 0) {
        console.log("Found subjects in student_subjects:", subjData.length);
        const mappedSubjects = subjData.map(subj => ({
          subject: subj.subject_name,
          confidence_level: mapHelpLevel(subj.help_level)
        }));
        
        setSubjects(mappedSubjects);
        setIsLoading(false);
        return;
      }
      
      // Only if no subjects found in both tables, set flag
      console.log("No subjects found in either table, marking noSubjectsFound as true");
      setNoSubjectsFound(true);
      
      // Don't set default subjects here, let the consuming components decide
      setSubjects([]);
      
    } catch (error) {
      console.error('Error in fetchUserSubjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to map numeric confidence level to string
  const mapConfidenceLevel = (level: number | string): 'low' | 'medium' | 'high' => {
    if (typeof level === 'number') {
      if (level <= 3) return 'low';
      if (level <= 7) return 'medium';
      return 'high';
    }
    
    // If it's already a string, validate and return
    if (level === 'low' || level === 'medium' || level === 'high') {
      return level;
    }
    
    return 'medium';
  };
  
  // Helper function to map help level to confidence level
  const mapHelpLevel = (helpLevel: string): 'low' | 'medium' | 'high' => {
    switch (helpLevel) {
      case 'high': return 'low';
      case 'medium': return 'medium';
      case 'low': return 'high';
      default: return 'medium';
    }
  };

  useEffect(() => {
    fetchUserSubjects();
  }, [authState.user?.id]);

  return { 
    subjects, 
    isLoading, 
    noSubjectsFound, 
    refetch: fetchUserSubjects 
  };
};
