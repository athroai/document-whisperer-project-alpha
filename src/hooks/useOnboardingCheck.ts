
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
        
        // Skip localstorage check for recently created users
        // to force checking with the database
        const sessionAge = localStorage.getItem('auth_session_created');
        const isNewLogin = sessionAge && (Date.now() - parseInt(sessionAge)) < 10000; // 10 seconds
        
        const onboardingCompleted = !isNewLogin && localStorage.getItem('onboarding_completed') === 'true';
        if (onboardingCompleted) {
          setNeedsOnboarding(false);
          setIsLoading(false);
          return;
        }
        
        // Force a small delay to ensure database has had time to propagate
        if (isNewLogin) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const { data: progress, error } = await supabase
          .from('onboarding_progress')
          .select('completed_at')
          .eq('student_id', state.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking onboarding status:", error);
          toast({
            title: "Error checking onboarding status",
            description: "We'll redirect you to onboarding to be safe",
            variant: "destructive"
          });
          setNeedsOnboarding(true);
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
            console.log("Redirecting to onboarding from useOnboardingCheck");
            
            // No need to navigate directly for new users, signupAction already navigates
            if (!isNewLogin) {
              toast({
                title: "Welcome to Athro",
                description: "Let's set up your study plan",
              });
              navigate('/onboarding', { replace: true });
            }
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
  }, [state.user, state.isLoading, navigate, redirectOnNeeded, isOnboardingPage, hasFromSetupParam, toast]);
  
  return { needsOnboarding, isLoading };
};
