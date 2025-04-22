
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
  const isRestartingOnboarding = new URLSearchParams(location.search).get('restart') === 'true';
  
  useEffect(() => {
    if (isRestartingOnboarding) {
      console.log('Restarting onboarding, clearing local storage flag and check state');
      localStorage.removeItem('onboarding_completed');
      hasChecked.current = false;
      hasRedirected.current = false;
    }
    if (hasChecked.current && !isRestartingOnboarding) return;
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
        hasChecked.current = true;
        const skipLocalStorageCheck = isRestartingOnboarding;
        const sessionAge = localStorage.getItem('auth_session_created');
        const isNewLogin = sessionAge && (Date.now() - parseInt(sessionAge)) < 10000;
        const onboardingCompleted = !skipLocalStorageCheck && !isNewLogin && 
          localStorage.getItem('onboarding_completed') === 'true';
        if (onboardingCompleted) {
          setNeedsOnboarding(false);
          setIsLoading(false);
          return;
        }
        if (isNewLogin) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        if (isRestartingOnboarding) {
          try {
            await supabase
              .from('onboarding_progress')
              .update({
                completed_at: null,
                current_step: 'welcome',
                has_completed_subjects: false,
                has_completed_availability: false,
                has_generated_plan: false,
                has_completed_diagnostic: false
              })
              .eq('student_id', state.user.id);
            console.log('Reset onboarding progress in database');
          } catch (err) {
            console.error('Failed to reset onboarding progress:', err);
          }
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
          const onboardingNeeded = isRestartingOnboarding ? true : !progress?.completed_at;
          setNeedsOnboarding(onboardingNeeded);
          if (!onboardingNeeded && !isRestartingOnboarding) {
            localStorage.setItem('onboarding_completed', 'true');
          }
          if ((onboardingNeeded || isRestartingOnboarding) && 
              redirectOnNeeded && 
              !isOnboardingPage && 
              !hasRedirected.current) {
            hasRedirected.current = true;
            console.log("Redirecting to onboarding from useOnboardingCheck");
            if (!isNewLogin) {
              toast({
                title: isRestartingOnboarding ? "Restarting Onboarding" : "Welcome to Athro",
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

    // Correct usage, no .catch on PromiseLike<void>
    checkOnboardingStatus();

  }, [state.user, state.isLoading, navigate, redirectOnNeeded, isOnboardingPage, hasFromSetupParam, toast, isRestartingOnboarding]);
  
  const restartOnboarding = () => {
    localStorage.removeItem('cached_calendar_events');
    localStorage.removeItem('onboarding_completed');
    hasChecked.current = false;
    hasRedirected.current = false;
    if (state.user?.id) {
      supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', state.user.id)
        .then(() => {
          console.log('Cleared existing calendar events for restart');
        })
        .catch((err) => {
          console.error('Failed to clear calendar events:', err);
        });
    }
    navigate('/onboarding?restart=true', { replace: true });
  };
  
  return { needsOnboarding, isLoading, restartOnboarding };
};
