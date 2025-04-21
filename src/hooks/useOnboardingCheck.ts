
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboardingCheck = (redirectOnNeeded = true) => {
  const { state } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);
  const hasRedirected = useRef(false);
  
  const isOnboardingPage = location.pathname.includes('onboarding');
  const hasFromSetupParam = new URLSearchParams(location.search).get('fromSetup') === 'true';
  
  useEffect(() => {
    // Only check once per component mount
    if (hasChecked.current) return;
    
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
        // Mark that we've checked
        hasChecked.current = true;
        
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
          
          // Only redirect once, and only if we should redirect
          if (onboardingNeeded && redirectOnNeeded && !isOnboardingPage && !hasRedirected.current) {
            hasRedirected.current = true;
            // Use setTimeout to prevent rapid navigation
            setTimeout(() => {
              navigate('/onboarding', { replace: true });
            }, 100);
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
