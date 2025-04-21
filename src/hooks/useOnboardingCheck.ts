
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingCheckOptions {
  redirectOnNeeded?: boolean;
}

export const useOnboardingCheck = (redirectOnNeeded = true) => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { state } = useAuth();
  const navigate = useNavigate();

  const checkOnboardingStatus = useCallback(async () => {
    if (!state.user) {
      setNeedsOnboarding(false);
      setIsLoading(false);
      return;
    }

    try {
      // First check local storage
      const localCompletionFlag = localStorage.getItem('onboarding_completed');
      
      if (localCompletionFlag === 'true') {
        setNeedsOnboarding(false);
        setIsLoading(false);
        return;
      }
      
      // Then check database
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('completed_at, current_step')
        .eq('student_id', state.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking onboarding status:', error);
        throw error;
      }
      
      const hasCompletedOnboarding = !!data?.completed_at;
      
      if (hasCompletedOnboarding) {
        // If completed in database but not in local storage, update local storage
        localStorage.setItem('onboarding_completed', 'true');
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
        
        // If redirectOnNeeded flag is true, redirect to onboarding
        if (redirectOnNeeded) {
          navigate('/onboarding');
        }
      }
    } catch (err) {
      console.error('Error in onboarding check:', err);
      // In case of error, assume onboarding is needed
      setNeedsOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  }, [state.user, navigate, redirectOnNeeded]);

  const restartOnboarding = useCallback(() => {
    if (!state.user) {
      console.error('User must be authenticated to restart onboarding');
      return;
    }
    
    setIsLoading(true);
    
    // Clear local storage flags
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('athro_study_slots');
    localStorage.removeItem('cached_calendar_events');
    
    // Reset onboarding progress in database
    const resetOnboarding = async () => {
      try {
        // First, clear calendar events
        const { error: clearEventsError } = await supabase
          .from('calendar_events')
          .delete()
          .eq('user_id', state.user!.id);
        
        if (clearEventsError) {
          console.error('Error clearing calendar events:', clearEventsError);
        } else {
          console.log('Cleared existing calendar events for restart');
        }
        
        // Then, reset onboarding progress
        const { error: resetError } = await supabase
          .from('onboarding_progress')
          .update({
            current_step: 'welcome',
            has_completed_subjects: false,
            has_completed_availability: false,
            has_generated_plan: false,
            has_connected_calendar: false,
            completed_at: null
          })
          .eq('student_id', state.user!.id);
        
        if (resetError) {
          console.error('Error resetting onboarding progress:', resetError);
        }
        
        // Force a refresh of the onboarding status
        setNeedsOnboarding(true);
        
        // Redirect to onboarding page with restart flag
        navigate('/onboarding?restart=true', { replace: true });
      } catch (err) {
        console.error('Error restarting onboarding:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    resetOnboarding();
  }, [state.user, navigate]);

  useEffect(() => {
    if (!state.isLoading) {
      checkOnboardingStatus();
    }
  }, [state.isLoading, checkOnboardingStatus]);

  return { needsOnboarding, isLoading, restartOnboarding, checkOnboardingStatus };
};
