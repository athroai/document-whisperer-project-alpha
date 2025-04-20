
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboardingCheck = (redirectOnNeeded = true) => {
  const { state } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!state.user || state.isLoading) {
        setIsLoading(true);
        return;
      }

      try {
        // Check if onboarding was completed via localStorage flag
        const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
        if (onboardingCompleted) {
          setNeedsOnboarding(false);
          setIsLoading(false);
          return;
        }
        
        // Check if user has any subjects in the student_subjects table
        const { data: subjects, error: subjectsError } = await supabase
          .from('student_subjects')
          .select('id')
          .eq('student_id', state.user.id)
          .limit(1);
          
        if (subjectsError) throw subjectsError;
        
        // If no subjects, user needs onboarding
        const onboardingNeeded = !subjects || subjects.length === 0;
        setNeedsOnboarding(onboardingNeeded);
        
        // Redirect if needed
        if (onboardingNeeded && redirectOnNeeded) {
          navigate('/athro-onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to not needing onboarding on error
        setNeedsOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [state.user, state.isLoading, navigate, redirectOnNeeded]);
  
  return { needsOnboarding, isLoading };
};
