
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const withOnboardingGuard = (Component: React.ComponentType) => {
  return (props: any) => {
    const { state } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    
    useEffect(() => {
      const checkOnboardingStatus = async () => {
        if (!state.user || state.isLoading) {
          // Still loading auth state, wait
          return;
        }
        
        try {
          // First check local storage for a quick decision
          if (localStorage.getItem('onboarding_completed') === 'true') {
            setIsChecking(false);
            return;
          }

          // Then verify with the database
          const { data, error } = await supabase
            .from('onboarding_progress')
            .select('completed_at')
            .eq('student_id', state.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking onboarding status:', error);
          }

          // If onboarding is not complete, redirect to onboarding
          if (!data?.completed_at) {
            navigate('/onboarding');
            return;
          } else {
            // If database says completed but localStorage disagrees, update localStorage
            localStorage.setItem('onboarding_completed', 'true');
          }
          
          setIsChecking(false);
        } catch (err) {
          console.error('Error in onboarding guard:', err);
          setIsChecking(false);
        }
      };
      
      checkOnboardingStatus();
    }, [state.user, state.isLoading, navigate]);
    
    if (isChecking) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <span className="ml-2">Checking onboarding status...</span>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
