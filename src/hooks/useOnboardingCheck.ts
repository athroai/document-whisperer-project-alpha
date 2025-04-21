
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboardingCheck = (redirectOnNeeded = true) => {
  const { state } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnboardingPage = location.pathname.includes('onboarding');
  const hasFromSetupParam = new URLSearchParams(location.search).get('fromSetup') === 'true';
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isOnboardingPage || hasFromSetupParam) {
        setNeedsOnboarding(false);
        setIsLoading(false);
        return;
      }
      
      if (!state.user || state.isLoading) {
        setIsLoading(true);
        return;
      }

      try {
        const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
        if (onboardingCompleted) {
          setNeedsOnboarding(false);
          setIsLoading(false);
          return;
        }
        
        const { data: progress, error } = await supabase
          .from('onboarding_progress')
          .select('completed_at')
          .eq('student_id', state.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking onboarding status:", error);
          setNeedsOnboarding(false);
        } else {
          const onboardingNeeded = !progress?.completed_at;
          setNeedsOnboarding(onboardingNeeded);
          
          if (!onboardingNeeded) {
            localStorage.setItem('onboarding_completed', 'true');
          }
          
          if (onboardingNeeded && redirectOnNeeded && !isOnboardingPage) {
            navigate('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setNeedsOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [state.user, state.isLoading, navigate, redirectOnNeeded, isOnboardingPage, hasFromSetupParam]);
  
  return { needsOnboarding, isLoading };
};
