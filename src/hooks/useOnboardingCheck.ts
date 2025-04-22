
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
    // If explicitly restarting onboarding, always clear the flags to force a fresh check
    if (isRestartingOnboarding) {
      console.log('Restarting onboarding, clearing local storage flag and check state');
      localStorage.removeItem('onboarding_completed');
      hasChecked.current = false; // Reset check to force a re-check
      hasRedirected.current = false; // Reset redirection flag to allow navigating again
    }
    
    // Only check once per component mount, unless explicitly restarting
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
        // Mark that we've checked
        hasChecked.current = true;
        
        // Skip localstorage check when restarting onboarding
        const skipLocalStorageCheck = isRestartingOnboarding;
        
        // Skip localstorage check for recently created users
        // to force checking with the database
        const sessionAge = localStorage.getItem('auth_session_created');
        const isNewLogin = sessionAge && (Date.now() - parseInt(sessionAge)) < 10000; // 10 seconds
        
        const onboardingCompleted = !skipLocalStorageCheck && !isNewLogin && 
          localStorage.getItem('onboarding_completed') === 'true';
          
        if (onboardingCompleted) {
          setNeedsOnboarding(false);
          setIsLoading(false);
          return;
        }
        
        // Force a small delay to ensure database has had time to propagate
        if (isNewLogin) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // When restarting onboarding, update the database record
        if (isRestartingOnboarding) {
          try {
            // Mark onboarding as incomplete in the database
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
          // Force onboarding needed when restarting
          const onboardingNeeded = isRestartingOnboarding ? true : !progress?.completed_at;
          setNeedsOnboarding(onboardingNeeded);
          
          if (!onboardingNeeded && !isRestartingOnboarding) {
            localStorage.setItem('onboarding_completed', 'true');
          }
          
          // Only redirect once, and only if we should redirect
          if ((onboardingNeeded || isRestartingOnboarding) && 
              redirectOnNeeded && 
              !isOnboardingPage && 
              !hasRedirected.current) {
            hasRedirected.current = true;
            
            // Use setTimeout to prevent rapid navigation
            console.log("Redirecting to onboarding from useOnboardingCheck");
            
            // No need to navigate directly for new users, signupAction already navigates
            if (!isNewLogin) {
              toast({
                title: isRestartingOnboarding ? "Restarting Onboarding" : "Welcome to Athro",
                description: "Let's set up your study plan",
              });
              // Changed to navigate immediately rather than using setTimeout
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
  }, [state.user, state.isLoading, navigate, redirectOnNeeded, isOnboardingPage, hasFromSetupParam, toast, isRestartingOnboarding]);
  
  // Function to restart onboarding
  const restartOnboarding = () => {
    // Clear calendar events from local storage
    localStorage.removeItem('cached_calendar_events');
    
    // Reset onboarding flags to force a new onboarding flow
    localStorage.removeItem('onboarding_completed');
    
    // Reset the check flags
    hasChecked.current = false;
    hasRedirected.current = false;
    
    // Clear any existing calendar events from the database when restarting
    if (state.user?.id) {
      // Attempt to delete existing calendar events
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
    
    // Navigate to onboarding with restart flag
    navigate('/onboarding?restart=true', { replace: true });
  };
  
  return { needsOnboarding, isLoading, restartOnboarding };
};
